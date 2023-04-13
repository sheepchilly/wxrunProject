# 1.所需要的依赖

1.初始化文件 => npm init

2.下载express => npm i express --save

3.自动监听的插件 => npm i nodemon --save

4.安装mongoose => npm i mongoose --save

- 连接数据库 => mongoose.connect('mongodb://127.0.0.1:27017/RUNSchool')
- 创建Schema集合 => const OrderReceiveSchema = new mongoose.Schema({}
- 创建数据模型 => const OrderReceive = mongoose.model('OrderReceive',OrderReceiveSchema);

5.request库做网络请求 => npm i request

# 2.申请接单

1.在index.js中创建接口，获取客户端发来的请求

```js
//申请接单
app.post('/addNewReceiver',async (req,res)=>{
    const result = req.body;
    console.log(result);
    res.send(result);
})
```

2.node解析json需要用中间件

```js
app.use(express.urlencoded({extended:true}))
app.use(express.json())
```

3.在路由中用try...catch捕获异常，用create方法创建新数据

```js
app.post('/addNewReceiver',async (req,res)=>{
    try{
        await OrderReceive.create(req.body); 
        res.send('success');
    }catch(err){
        res.send('fail');
    }
})
```

4.注意：openid的获取方式还没有换掉，之前使用云开发获取的

5.在applyOrder里先判断用户输入的name、userID、userIDImg是否为空，然后再用wx.request向服务器发请求



# 3.用户登录，获取用户openId

**注意：**wx.login接口实现，后台基本都是靠openid来区别用户，而获取openid的login接口无需用户确认，用户也感受不到，这就是静默登录。

用户头像和昵称静默登录后怎么样展示给用户，我的方法是设置一个默认头像，并给用户一个默认昵称，比如游客、普通用户、SSSSVIP中P，反正随意设置，我设置的是用户+用户ID：

1.客户端用wx.login和wx.request发请求

2.服务端写login的接口，可以调用wx小程序的登录的API获取用户的openid，安装request包

3.在登录的路由里用request去请求WX小程序自带的API拿到用户的openid

```js
app.get('/login',async(req,res)=>{
    console.log(req.query,'query');
    const {code} = req.query;
    request({
        url:`https://api.weixin.qq.com/sns/jscode2session?appid=wxb381f4917f98e0f5&secret=166ffe061ff1fa8c74aeb3a96e706538&js_code=${code}&grant_type=authorization_code`
    },(err,response,data)=>{
        console.log(data,'data');
        res.send(data);
    })
})
```

4.在首页的onload生命周期钩子里，首先判断用户的缓存里是否有openid，如果没有，就调用wx.login，在成功的回调里向带着code服务器发请求，在request的成功的回调里解构出来用户的openid，然后通过wx.setStorageSync存在本地

5.用静默登录存储用户的userInfo，给他一个默认头像和昵称

# 4.Person页面逻辑

## 1.相关证件上传的回调

1.node中下载插件 => npm install multer (文件上传的库)

2.导入库并且配置multer，新建file和image文件夹

```
const multer = require('multer');
```

3.调用wx.uploadFile API

> 将本地资源上传到服务器。客户端发起一个 HTTPS POST 请求，其中 `content-type` 为 `multipart/form-data`。

- 图片的路径放在wx.chooseImage的success的res中，用tempFilePaths[0]可以得到，然后将其filePath上传给服务器，在成功的回调中解构出后端传回来的path（因为传回来的是个字符串，所以要用JSON.parse格式化一下），保存在data的userIDImg中

- 注意，node上要配置 => app.use(express.static(__dirname));  ，才可以让所有人都可以访问服务器上的静态资源

## 2.审核接单申请

1.重写orderReceive的逻辑，每次页面onload的时候就要向服务端发请求，获取state为待审核的数据。

2.在node里新增路由规则，用find()查询orderReceive数据模型，找出state为待审核的给客户端res.send回去

```js
app.get('/getOrderReceive',async(req,res)=>{
    //查询OrderReceive -> find()
    try{
        const result = await OrderReceive.find({
            state:'待审核',
        })
        res.send(result);
    }catch(error){
        res.status(500).send({
            message:'服务器出错~~'
        })
    }
})
```

3.客户端受到服务器发来的数据之后，在success的回调中存在data的receiveList中。

## 3.审核内容的逻辑

**思路：**点击通过和不通过按钮，都需要去修改数据库的字段，都需要接口支持。

1.前端需要给后端传state状态和exaimPerson审核人以及_id

2.mongoDB里修改数据一般都是用 => findByIdAndUpdate来修改

3.在node中用post审核接单申请，首先从请求体中解构出来_id、state、examination，然后通过findByIdAndUpdate来向数据模型查询

```js
app.post('/updateOrderReceive',async (req,res)=>{
    try{
        const {_id,state,examinePerson} = req.body
        const result = await OrderReceive.findByIdAndUpdate(_id,{
            state,
            examinePerson
        })
        res.send("success");
    }catch(err){
        res.status(500).send({
            message:'服务器出错~~'
        })
    }
})
```

4.客户端在审核内容点击的toExamine()回调里向服务器发请求，首先要从e.cuurentTarget.dataset中解构出来_id和state，然后把他们放在request的data里给后端传递过去，examinPerson从本地存储中取openid，在成功的回调里面解构出来服务器返回的data，并判断，如果data==='success'就重新执行onload()钩子函数刷新页面，否则提示操作失败！

## 4.获取当前用户的所有接单申请

**思路：**后端通过前端传来的openid去表中查询，把查到的数据返回给前端

1.在客户端onload的request的成功回调里解构出服务器发来的data，然后判断data的state是什么，把state的状态赋值给personReceiveState，让applyOrder()根据personReceiveState的值来判断当前用户是否可以申请接单。

2.node中用get去查询/findAllReceive数据模型，在try中从req.query中国解构出来openid，然后去数据模型中查找openid对应的数据给客户端返回回去

# 5.index页面

1.新建一个表

2.新建一个接口/addOrder，用户提交的信息都在这个接口中提交给数据库

3.getExpress.js中重写了两个逻辑：①是提交数据到数据库 ②是文件图片上传到数据库（注意选择图片的API要用chooseImg才可以拿到temFilePaths）

4.(index页面中九个接口共用一个数据表)，所以上传到/addOrder的逻辑是一样的，直接cv，图片上传的逻辑也是一样的，也可以cv

# 6.订单查询

**思路：**

## 1.全部

1.在order的onload生命周期钩子中用wx.request向服务器的/getAllOrder数据表发请求，获取全部的帮助信息

## 2.用户是否有接单资质

1.**getPersonPower()**是判断当前用户是否具备接单资质，也是需要查询数据库判断当前用户state是否是‘通过’，所以写一个新的接口/getPersonPower，通过openid和state来查询

## 3.我的订单

1.**getMyOrder()**获取我的订单信息，也需要通过查询数据库实现

## 4.我帮助的

1.**getMyHelpOrder()**我帮助的，node里对应的接口是 /getMyHelpOrder

2.我帮助的订单单数总和 **getHelpTotalNum()**，也需要对应的接口/getHelpTotalNum，其中查询数据库的方法是**countDocuments**(把符合筛选条件的数据的总和返回)，根据openid和state的状态='已完成'来返回对应的数据



3.**getHelpTotalMoney()**我帮助的订单金额总和，node对应的接口是 /getHelpTotalMoney，在这个接口里面用了aggreate方法

> aggregate()：聚合，通过管道操作符对数据进行操作

4.aggregate的管道操作符（这里用到的）

> $group:将collection中的document分组，可用于统计结果 -> 类似于mongoose的reduce()方法，注意：$group中要传递_id，且每个_id都必须是唯一的
>
> $match:过滤数据，只输出符合结果的文档 ->类似于mongoose的find()方法

## 5.接单功能

1.**orderReceive()**方法需要对数据里的数据进行重写，所以用post，node中对应的接口是/toGetOrder

2.我的订单里面的已完成按钮的回调是 **toFinsh()**，node里对应的接口是/toFinshOrder，因为在设计数据模型的时候设计了一个字段OrderNumber用于统计接单员接过多少单，所以首先要找到openid，然后再找出表里的数据做修改（OrderNumber+1）

```js
app.get('/toFinshOrder',async(req,res)=>{
    try{
        const {_id} =req.query;
        //1.首先把订单的状态改为已完成
        const result = await Order.findByIdAndUpdate(_id,{
            state:'已完成'
        })
        console.log(result.receivePerson)
        const {receivePerson} = result;
        //2.把接了单的接单员的个人信息找出来
        const receiveInfo = await OrderReceive.findOne({
            openid:receivePerson,
            state:'通过'
        })
        //解构改名就是给你需要改的数据后面加上:冒号
        let {orderNumber,_id:receiveID}  = receiveInfo
        //3.接单数量+1
        await OrderReceive.findByIdAndUpdate(receiveID,{
            orderNumber:orderNumber+1
        })
        res.send('success')
    }catch(err){
        console.log(err)
        res.send('fail')
        return;
    }
})
```

## 6.正在悬赏

1.getRewardOrder()，node中对应的接口是getRewardOrder，发请求不需要参数，只需要在数据库中查询state为'已完成'的即可

# 7.订单中新增功能

订单评论、接单排行榜、已完成的订单进行评分

## 1.订单评论

1.写样式：样式每个tab都复用了，可以封装成组件（未完成）

2.输入框判定用户是否输入完成 => 移动端点确定，PC端按enter就会触发bindconfirm

3.在bindconfirm的回调里面首先获取用户的输入 => e.detail.value => 还需要知道是哪一条订单的评论 => 用data-id绑定自定义id =>data-id="{{item.id}}"，然后在回调里取出来id  => const _id = e.currentTarget.dataset.id

4.此外还需要拿到用户的头像和昵称，在缓存里面（注意，这里登录界面没有重写）

```js
const {avatarUrl,nickName} = wx.getStorage('userInfo')
```

5.**请求接口：**/addComment，拿着id找到commentList，然后往commentList里push数据，把新数据用findByIdAndUpdate方法往Order数据表中新增评论

## 2.订单打分

1.样式创建在全局下，是一个遮罩层

2.selectStar()的回调首先要确定用户点击的是哪一个星，然后把用户点击的当前到第0个星都变成黄色的

3.用wx:if来控制遮罩层的显示与隐藏，在我的订单 - 已完成toFinish的回调中删掉向服务器接口发请求的request，而是改为将遮罩层显示与隐藏的变量设置为true，顺便保存一下当前已完成的是哪一个

4.在node的接口里面新增一个数据类型starNum用来记录当前订单的评分，前端通过发请求获得数组中starNum的值并进行展示

## 3.接单者排行榜

1.给tabbar加一个模块，因为scroll-view设置的是“scroll-view”，所以它是可以挪动的

2.node的接口是/getOrderRank ，只需要对数据表做一个查询，然后orderNumber进行排序，结果降序展示，mongoDB里排序是.sort({xx:-1}) => -1就是降序排序



# 8.删除订单的功能

**功能：**用户可以在我的订单里删除已完成的订单



# 9.问题

## 1.点击查看评论时所有评论都会展开

问题出现的原因：data里的showComment变量控制所有列表的显示与隐藏

**解决：**在onload的时候对查询到的数据做处理，给数组的每一项增加一个属性showComment，然后wx:if判断的时候就不用data里的showComment而是用自己身上的showComment

