# 1.页面搭建

## 1.首页

### 1.tabBar导航栏

1.小程序一上来先做tabBar导航栏，选中和未选中的图片可以在阿里图标库找到，tabBar放在app.json里（tabBar必须要有两个以上才会显示）



### 2.首页轮播图

1.<swiper>和<swiper-item>，swiper-item用wx:for遍历出来，把图片地址放在data中，用插值语法引入数组，不然会被当作字符串而不是变量。

2.<image>在小程序里也是一个组件，里面有mode属性，可以设置图片的缩放，一般设置mode="widthFix"---> 缩放模式，宽度不变，高度自动变化，保持原图宽高比不变.

3.给swiper添加样式，width:100%



### 3.公告

1.不难，主要是样式。这里用了flex布局，align-item:center 垂直方向居中

```js
//记住<text>的多余字体隐藏的三部曲 ↓  
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
```

2.给外层的<view>绑定点击事件bindtap，点击后弹出对话框-->微信自带的**wx.showModel({})**



### 4.下方容器

1.样式写的我好烦



## 2.个人页面

### 1.头部

1.用户未登录的时候显示默认图片==>基础样式配置自己看一下

2.点击头像的时候调用**wx.getUserProfile**或者**wx.getUserInfo**获取用户信息

3.首先在data里定义三个变量，一个用来接收登陆后的用户信息userInfo，一个用来判断有没有userInfo从而显示按钮hasUserInfo，一个用来判断支不支持getUserProfile的canIUserGetUserProfile

4.在onload里判断if(wx.getUserProfile)===>如果为true就修改canIUseGetUserProfile为true

5.用block标签来判断用户是否授权，有就显示用户信息，没有就显示按钮。

```js
<block wx:if="{{!hasUserInfo}}" wx:key="index">
```

6.在<block>里设置两个button，wx:if判断canIUseGetUserProfile的值，然后使用对应的API

```js
<button wx:if="{{canIUseGetUserProfile}}" bindtap="getUserProfile">点我授权</button>
    <button wx:else open-type="getUserInfo" bindgetuserinfo="getUserInfo">点我授权</button>
```

7.在js里定义两个函数用来接收用户信息，注意：在getUserProfile函数里用wx.setStorageSync来缓存用户的信息，然后在onload里判断是否存储了用户信息，如果有就把他赋值给data里面的userInfo（用wx.getStorageSync读取缓存）

### 2.单元条（封装成组件）

1.单元条在个人页面复用多次，可以封装成组件（目前还没搞）

2.写静态样式

### 3.微信客服点击后生成一段文本

1.bindtap绑定事件，然后在回调里调用API ==>wx.setClipboardData(Object object)：设置系统剪贴板的内容。调用成功后，会弹出 toast 提示"内容已复制"

2.凡是wx.开头的API都有三个回调（成功、失败、完成）。

3.在成功的回调里调用wx.showToast()跳出消息提示框API，提示用户微信号已经复制

### 4.微信客服点击事件

1.一点击后弹出微信，并且直接显示官方客服（我本人）的对话框==>要在微信公众号平台先把客服人员添加上

2.在button按钮下有open-type开放功能，里面有一个contact属性： 打开客服会话，如果用户在会话中点击消息卡片后返回小程序，可以从 bindcontact 回调中获得具体信息 ==>给外层class="cell" 加上open-type=“contact”

### 5.申请接单页面

1.用了自定义组件myModule，写了myModule的样式，然后要在js里面用components来声明插值的属性。

2.在applyOrder页面中使用自定义组件，首先需要引入==>在json文件里面“自定义组件名”：“组件地址“

3.在页面中使用自定义组件<my-module>把参数传给子组件==>title="常见问题"、content="{{content}}"（这里用插值语法是因为content内容太长了，放在data里面然后引用）

4.自定义组件的事件：首先在自定义组件上面绑定点击事件bindtap，然后在自定义组件的js的methods中写bindtap的回调事件，在事件中用this.triggerEvent('自定义组件方法名')给父组件传递方法。

5.父组件在<my-module>中用bind+自定义组件方法名==>如：bindcancel来接收自定义组件的方法==>bindcancel="父组件方法名"来触发自定义组件的事件



## 3.订单页面

### 1.头部滑动滚动区域

1.头部使用<scroll-view> 可滚动视图区域。使用竖向滚动时，需要给<scroll-view>一个固定高度，通过 WXSS 设置 height。

2.在data里定义数组，用wx:for把数据遍历出来显示在<scroll-view>中

3.点击切换导航条，给导航条添加样式===>首先定义一个遍历tabNow:0===>给导航条添加点击事件bindtap="selectTab"===>注意：点击事件的传值要用data-传值，而不是用()

4.在js的回调函数中，修改tabNow的值 this.setData({tabNow:e.currentTarget.dataset.id})===>在<view>的class中用{{}}可以进行一些简单的算数运算和比较简单的判断class="tab-item {{tabNow===index?'select}:''}"

```js
<view class="tab-item {{tabNow===index?'select':''}}" wx:for="{{tabList}}" wx:key="index" bindtap="selectTab" data-id="{{index}}">
```

### 2.滚动区域下方显示内容

1.用wx:if判断，可以用来切换显示不同的页面内容

2.用微信或者qq的截图可以看到rgb()颜色值

3.渐变色：（css3中提供的）

```js
  background-image: linear-gradient(#1067D1,rgb(100, 144, 233));
```

4.底部的每一栏分为上中下三个布局，button的按钮可以用view来写



## 4.跳转页

### 1.首页点击跳转

1.给首页的container绑定点击事件，一点击就跳转服务页面

2.如何确定你点击的是哪一个功能？用data-url来区分，在data里定义indexConfig的时候多加一个url=你要跳转的页面。然后在回调函数里面存一下你点击后传过来的url，就可以navigateTo了。

### 2.快递代取页

1.按钮用<view>来写，孩子结点用nth-child来选择

2.点击大中小件要给点击的<view>添加class样式，用bindtap="selectType"和data-id="{{index}}"来解决===>在js里面定义回调函数，然后将传过来的值e.currentTarget.dataset.id赋值给typeNow===>在class里用三目运算符判断{{typeNow===index?'selectType':''}}

3.wx.showToast：显示消息提示框

4.更多选择的显示按钮===>绑定点击事件，一点击就让变量为true，然后通过wx:if来显示和隐藏更多信息

5.加急打赏的切换按钮用的是<switch>他有封装的event事件来控制按钮change后触发的回调

### 3.我的地址页面

1.在app.json里添加新的页面"pages/address/address"

  "pages/addAddress/addAddress",

  "pages/selectBuild/selectBuild"

2.跳转页太多了，都在写样式。

3.选择商家那里用的是wx的组件 **picker**：从底部弹起的滚动选择器。

## 5.个人页面点击授权跳转到信息页

### 1.个人页点击跳转

1.hasUserInfo:判断用户是否登陆过，给class="Info"绑定点击事件，然后在回调里判断，如果hasUserInfo存在，就跳转到updateInfo

2.获取手机号的API是**getPhoneNumber**（个人号不支持）

> 需要将 [button](https://developers.weixin.qq.com/miniprogram/dev/component/button.html) 组件 `open-type` 的值设置为 `getPhoneNumber`，当用户点击并同意之后，可以通过 `bindgetphonenumber` 事件回调获取到动态令牌`code`，然后把`code`传到开发者后台，并在开发者后台调用微信后台提供的 [phonenumber.getPhoneNumber](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/phonenumber/phonenumber.getPhoneNumber.html) 接口，消费`code`来换取用户手机号。

3.云开发-cloudfunctions

- 如果你是通过云开发的登录的，在app.js里会有一段wx.cloud.init初始化代码，把env:"自己的云开发id"，就可以使用云开发了

### 2.点击头像可以更换

1.因为是点击一整条都可以更换，所以给class="item"绑定点击事件，在回调函数里调用存储图片的API=>wx.chooseMedia(Object object)

2.在chooseMedia成功的回调中 先生成随机数，然后用云存储的uploadFile函数存储图片路径，在成功的回调中拿到fileID存储在userInfo里。

3.解决修改完头像图片不更新的问题

为什么会不更新？因为onload只执行一次（页面加载时）。

解决办法：在onShow里手动调用一次onLoad方法==>this.onload()

### 3.修改姓名

1.修改姓名的事件是：bindinput，在回调里保存一下userInfo，然后把userInfo里面的nickName改为新的e.detail.value，再然后this.setData修改data里面的数据

### 4.点击手机号可以修改

1.用input存储手机号码（手机号应该做一个验证，这里 **还没做**）

```js
<input type="text" placeholder="请输入手机号" bindinput="getPhoneNumber" value="{{phone}}"/>
```

```js
getPhoneNumber(e){
    let phone = this.data.phone
    phone = e.detail.value
    this.setData({
      phone})
}
```

## 6.地址栏的新增、编辑、和删除

### 1.楼号选择

1.在selectBuild中，绑定点击事件，并且用data-index="{{index}}"来把当前点击的index传给回调函数

2.用e.currentTarget.datset.index获取当前点击的索引值

3.用模板字符串保存当前楼栋信息，然后wx.navigateTo携带参数跳转

4.addAddress.js的onload生命周期钩子中的options可以获取到selectBuild页面跳转时携带的参数 ==>用解构将options中的build保存下来 const {build} = options; ===>然后this.setData({build})保存在data中

5.在addAddress.wxml中用三目运算符展示build=>{{build?build:'点击选择'}}

### 2.剩下的input框的输入值收集

1.在input里面绑定bindinput输入框事件，然后value用模板字符串将收集到的data值展示出来

2.在每个data中声明遍历，在回调中this.setData({})

3.input输入要做 **节流**！！

### 3.switch按钮的值收集

1.switch的触发事件是bindchange

2.表单的值的收集都是**e.detail.value**

### 4.编辑框

1.每次点击address页面的编辑的时候，就要进行路由跳转，并且把用户当前点击的地址的所有信息给addAddress传过去=>用?的方式传参，并且要把数据用JSON.stringify转成字符串来传输。

2.在addAddress.js中接收address传来的值，解构的时候要用JSON.parse()来把字符串转为对象。

3.编辑的时候要确定是新增还是在原来的地址上修改。（太混乱，绕晕了）

### 5.删除框

1.绑定点击事件，传递data-index的值给回调函数。

2.拿到用户当前点击的index==>const index = e.currentTarget.dataset.index

3.保存数组（因为要对数组进行操作了，不适合直接在原数组上直接操作，所以要先保存一份）==>const address = this.data.address

3.然后用数组的splice分割方法，删掉当前点击的那个 address.splice(index,1)

4.把操作完成后的数组保存在本地==>wx.setStorageSync('address',address)

5.弹出提示框显示修改成功===>wx.showToast

## 7.封装组件，父子组件传值交互

1.utils：专门用来封装组件方法的地方

2.自定义组件components：需要先在app.json里注册==>"components/myButton/myButton" 或者直接在components文件夹下新建components

3.自定义组件的使用：在页面中要单独引入==>json文件的usingComponents配置 “组件名”:"组件路径"

```js
"usingComponents": {
    "my-button":"../../components/myButton/myButton"
  }
```

4.自定义组件的样式可以在自定组件的wxss中设置，也可以在父组件（使用组件）的页面中添加class样式。

5.自定义组件中的data值不能写死，要在js文件中

```js
Component({
  //properti相当于vue的prop
  properties:{
    //接收的参数
    text:{
      type:String,
      value:'确认'
    }
  }
})
```

然后在父组件里把text给自定义组件传过去

```js
<my-button text="提交申请"></my-button>
```

## 8.云开发

### 1.applyOrder页面的数据收集

1.收集input输入的内容，在input里面加value和bindinput

2.相关证件的收集就是bindtap="uploadImg"

3.数据收集到云开发的数据库里

1. 要用云数据库的功能首先：在要使用的js的文件的最顶部写：

```js
const db = wx.cloud.detabase()
```

​	2.给你需要点击的按钮绑定点击事件，在回调函数里向数据库提交信息

​		**db.collection('orderReceive').add**

```js
db.collection('orderReceive').add({
       data:{
         name:that.name,
         userID:that.userID,
         userIDImg:that.userIDImg,
         userInfo:that.userInfo,
         state:'待审核'
       },
       success:res=>{
         //清空输入内容
         this.setData({
           name:'',
           userID:'',
           userIDImg:''
         })
```

## 9.快递代取页面的数据收集

### 1.大中小件的收集

1.收集大中小件的name，然后额外在typeList加一个money，用插值语法在下面需支付的金额处显示==>{{money}

### 2.收件地址的信息收集

1.在address中的地址栏添加点击事件，bindtap="selectAddress"，并且用data-index传递index参数过去，方便我们知道用户点击的是哪个地址

```js
selectAddress(e){
    //取出来当前点击的数据
    const {index} = e.currentTarget.dataset
    const address = this.data.address[index];
    //把数据存储到本地
    wx.setStorageSync('addressNow', address)
    //redirectTo：路由重定向
    wx.redirectTo({
      url: '../getExpress/getExpress',
    })
  },
```

2.需要注意的是：上面获取到的address是一个对象，通过url传参的时候，需要通过JSON.stringify转为字符串。然后这里的路由跳转也不是navigationTo而是redirectTo。因为navigateTo会形成一个路由栈，当我们点击顶部导航栏左侧的返回时，会返回上一个页面。redirectTo这个路由跳转API不会形成路由历史栈。

3.从address页面把参数传递给getExpress这个页面之后，要在onload里面获取，options里面是携带的参数，所以用解构拿到address，判断如果有adress就用JSON.parse函数把字符串转为对象，然后用this.setData修改data里面的数据

```js
onLoad(options) {
    const address = wx.getStorageSync('addressNow')
    if(address){
      const {build,houseNumber} = address;
      this.setData({
        address:`${build}-${houseNumber}`
      })
    }
```

4.将获取到的address数据展示在页面上，在<text>标签中用一个三元表达式==>{{address?address:"请选择地址 >"}}

### 3.快递商家的信息收集

1.快递商家的信息收集和收件地址类似。我们点击快递商家后跳转到expressBusiness页面。我们也需要知道用户点击的是哪一个数据，然后携带参数返回getExpress页面===>bindtap="selectBusiness" data-index="{{index}}" ===>这里用的是query传参，而不是上面的setStorageSync本地存储

```js
selectBusiness(e) {
    const { index } = e.currentTarget.dataset;
    wx.redirectTo({
      url: `../getExpress/getExpress?business=${this.data.businessList[index]}`,
    })
```

2.然后在getExpress页面中的onload函数中继续处理==>解构出bussiness然后this.setData。===>用三元做判断展示在页面当中。

### 4.取件信息的信息收集

1.样式方面：因为getImg设置了position:absolute;脱离文档流，如果不给它加上z-index，点击的就是textarea而不是图片选择。

2.imga的点击事件的回调里：把图片上传到云存储，然后把云存储里的图片地址保存到本地变量里，如果本地变量codeImg里有值，就在页面中显示图片。

### 5.备注信息的信息收集

1.简单的一个input的表单收集，用value+bindinput

### 6.额外赏金的信息收集

1.input表单收集，value+bindinput

2.下方的需支付里面也要随着额外赏金的变化而变化{{money+addMoney}}

### 7.立即发布按钮

1.第一步还是去云存储的数据库里面新建一张表：order，别忘记在js文件第一行const db = wx.cloud.database()

2.给按钮添加点击事件 bindtap="submit"

3.submit回调函数中，首先需要获取一个时间，就是用户发布订单的准确时间，可以把这个方法封装到utils中===>export const getTimeNow=()=>{}

4.在需要用到的js文件的顶部引入，然后就可以使用了

```js
import {getTimeNow} from '../../utils/index'
```

5.在submit回调函数中首先保存一下this，再判断一下必填项有没有填写if(!that.address || !that.business ||!(that.expressCode || that.codeImg))，记得这里要用!，因为你第一次没有加！所以报错找了好久

6.通过db.collection('数据库名').add(P{})来把需要存入数据库的字段写入，在成功的回调里调用wx.showToast弹出消息框的API来提示用户上传成功，然后用wx.switchTab({})跳回index页面

### 8.用户登陆了之后才能填写订单信息

1.怎么限制登录之后才能进去？

（1）当初在本地存储了用户的userInfo，只要Storage中有userInfo就证明用户登录过

（2）在index.wxml页面中找到图标的bindtap，在回调里先获得本地存储的userInfo，然后再判断是否有userInfo，如果有就跳转，没有就提示用户未登录。



## 10.数据库查：订单页面数据展示

1.在orderd.js页面的首行写上==>const db = wx.cloud.database()

2.在查数据库的时候，一般都是在onload这个生命周期函数中进行的

```js
数据库的查询：（两种）
onLoad:function(options){
    db.collection('集合名称').where({ //条件查询
        //以键值对的方式展示要筛选的条件
    }).get({ //全部查询
        success:res=>{
            //查询成功的回调
        },
        fail:err=>{
            //查询失败的回调
        }
    })
}
```

3.把数据库中的数据整理到orderList中，通过db.collection('数据库名').get({})，在成功的回调中解构出data（这个data包含着数据库里所有的数据），然后用**forEach**循环（调用数组里的每一个元素，并将元素传给回调函数）==>从info中解构出想要的数据，然后拼接起来===>用this.setData把数据赋值给orderList以便渲染

4.在order.wxml页面中用wx:for遍历orderList数组，将数据用{{}}+item渲染到页面

5.页面右上角的订单状态，只写了待帮助的样式，所以补了一个已完成的样式，通过三目运算符来控制展示哪一个

## 11.订单提交查询+订单查询分页

1.在OnReachBottom的处理函数中写分页的逻辑

2.Collection.skip：指定查询返回结果时从指定序列后的结果开始返回，常用于分页

### 1.四个tab的订单查询

1.我的订单的查询逻辑：拿到openid再去找数据

2.在index.js中获取云开发ID（获取到之后在项目的所有地方都可以使用它了）

```js
  onLoad(options) {
    //获取openid
    const openid = wx.getStorageSync('openid')
    if(!openid){
      wx.cloud.callFunction({
        //name是云函数的名字
        name:'UserOpenid',
        success:res=>{
          const {openid} = res.result
          wx.setStorageSync('openid',openid)
        }
      })
    }
```

3.用setStorageSync存到本地的openid，需要在对应的页面用getStorageSync取得openID

### 3.我帮助的页面

1.db.collection查询的条件是state:'待帮助'

### 4.正在悬赏页面

1.点击接单按钮的回调，里面要更新数据库的state状态==>db.collection('order').doc(_id).update({})

> doc：获取集合中指定记录的引用。方法接受一个 id 参数，指定需引用的记录的 _id。

2.在成功的回调中需要判断，如果this.data.tabNow===0的话代表它是第一个页面点击的接单，需要执行this.onload()刷新页面，否则它就是第四个tab（正在悬赏页面），执行this.getRewardOrder()==>重新获取正在选上的订单信息（state为待帮助的才展示）

### 5.路由跳转

1.**所有模块都用的同一个地址**，所以传参的时候要把url通过?url= 当前页路径给需要navigateTo/redirectTo的页面传过去。

2.expressBussiness在onload中把url解构出来，然后赋值给data中的url

3.在js的selectBussiness中通过模板字符串${url}就知道是从哪一个页面来的了

## 12.新用户未登录时

1.一些功能无法使用：首页无法跳转发单，无法申请成为接单员

## 13.目前存在的问题

1.添加地址按钮点击了之后，控制台报错

2.删除最后一个地址项时候，会把第一个地址删了，并且解构出来的url报错

# 



# 14.基本功能

## 1.前台

1.九种类型的订单编写与提交

2.自定义个人地址支持增删改查

3.订单查询、包含全部、我的订单、我帮助的、正在悬赏

4.支持接单功能，支持完成订单功能

5.个人累计接单数量与总收益

6.订单评论功能

7.订单评分功能

8.授权获取用户基本信息，支持自定义修改

9.申请接单功能

10.审核接单申请功能



## 2.后台

1.管理员登录

2.全部订单的查询、修改、删除

3.管理员账号管理，支持新增、修改、删除

4.权限管理，管理员和超级管理员针对一些页面拥有不同的使用权限



### 1.后台需要的工具

1.nodejs

2.MongoDB

3.MongoDB的可视化工具 Robo 3T
