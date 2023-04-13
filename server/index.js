const express = require('express');
//导入Person数据表
const {OrderReceive} = require('./data/db');
//导入order数据表
const {Order} = require('./data/order')
//导入request库
const request = require('request');
//引入multer库
const multer = require('multer');

const app = express();

//中间件
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(__dirname)); //所有人都可以访问服务器上的静态资源

//配置multer库
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./file/image'); //声明文件存放路径
    },
    //文件的名字
    filename:(req,file,cb)=>{
        let type = file.originalname.replace(/.+\./,'.'); //正则取后缀
        cb(null,Date.now()+type); //当前时间戳加上jpg格式
    }
})

//upload 实例化出来的对象
const upload = multer({storage:storage})

//上传文件     multer.array()=>允许一次上传多个文件
app.post('/uploadImg',upload.array('file',10),(req,res)=>{
    res.send(req.files);
})

// 申请接单
app.post('/addNewReceiver', async (req, res) => {
    try {
        await OrderReceive.create(req.body);
        res.send("success");
    } catch (error) {
        res.send("fail");
    }
})

//获取需要审核的接单申请
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

//审核用户的接单申请
app.post('/updateOrderReceive',async (req,res)=>{
    try{
        const {_id,state,examinPerson} = req.body
        const result = await OrderReceive.findByIdAndUpdate(_id,{
            state,
            examinPerson
        })
        res.send("success");
    }catch(err){
        res.send('fail');
    }
})

//获取当前用户的所有接单申请
app.get('/findAllReceive',async(req,res)=>{
    try{
        const {openid} = req.query;
        const result = await OrderReceive.find({
            "userInfo.openid":openid
        })
        res.send(result);
    }catch(err){
        res.status(500).send({
            msg:'服务器出错~~'
        })
    }
})

//登录
app.get('/login',async(req,res)=>{
    const {code} = req.query;
    request({
        url:`https://api.weixin.qq.com/sns/jscode2session?appid=wxb381f4917f98e0f5&secret=166ffe061ff1fa8c74aeb3a96e706538&js_code=${code}&grant_type=authorization_code`
    },(err,response,data)=>{
        res.send(data);
    })
})

//提交订单
app.post('/addOrder',async (req,res)=>{
    try{
        await Order.create(req.body);
        res.send('success');
    }catch(err){
        res.send('fail');
    }
})

//获取全部订单
app.get('/getAllOrder',async (req,res)=>{
    const result = await Order.find({});
    res.send(result)
})

//获取用户的接单权限
app.get('/getPersonPower',async (req,res)=>{
    const {openid} =req.query;
    const result = await OrderReceive.find({
        "userInfo.openid":openid,
        state:'通过'
    })
    res.send(result);
})

//获取我的订单信息
app.get('/getMyOrder',async (req,res)=>{
    const {openid} = req.query;
    const result = await Order.find({
        "userInfo.openid":openid
    })
    res.send(result);
})

//获取我帮助的订单信息
app.get('/getMyHelpOrder',async (req,res)=>{
    const {receivePerson} = req.query;
    const result = await Order.find({
        receivePerson,
        state:'已完成'
    })
    res.send(result);
})

//获取我帮助的订单单数综合
app.get('/getHelpTotalNum',async(req,res)=>{
    const {receivePerson} = req.query;
    const result = await Order.countDocuments({
        receivePerson,
        state:'已完成'
    })
    res.send({
        count:result
    })
})

//我帮助的订单金额总和
app.get('/getHelpTotalMoney',async(req,res)=>{
        const {receivePerson} = req.query;
        const result = await Order.aggregate([
        {
            //match进行条件的筛选
            $match:{
                receivePerson,
                state:'已完成'
            }
        },
        {
            //group计算，累加金额并返回结果
            $group:{
                _id:"",
                totalNum:{
                    $sum:"$money"
                }
            }
        }
    ])
        console.log(result,'Money')
        res.send(result)
})

//接单功能
app.get('/toGetOrder',async(req,res)=>{
    try{
        const { receivePerson,_id} = req.query;
        await Order.findByIdAndUpdate(_id,{
            receivePerson,
            state:'已帮助'
        })
        res.send('success')
    }catch(err){
        res.status(500).send('fail')
        return
    }
})

//完成订单的接口
app.get('/toFinshOrder',async(req,res)=>{
    try{
        const {_id,starNum} =req.query;
        //1.首先把订单的状态改为已完成
        const result = await Order.findByIdAndUpdate(_id,{
            state:'已完成',
            starNum
        })
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

//获取正在悬赏的订单信息
app.get('/getRewardOrder',async(req,res)=>{
    const result = await Order.find({
        state:'待帮助'
    })
    res.send(result)
})

//给订单添加评论 -> 把当前评论添加到已有评论里去
app.post('/addComment',async (req,res)=>{
    try{
        const {_id,nickName,avatarUrl,time,comment} = req.body; //解构出当前评论的信息
        const order = await Order.findById(_id);
        const {commentList} = order;
        commentList.push({
            nickName,
            avatarUrl,
            time,
            comment
        });
        await Order.findByIdAndUpdate(_id,{
            commentList
        })
        res.send("success");
    }catch(err){
        console.log(err)
        res.send('fail')
    }
})

//接单者排行榜
app.get('/getOrderRank',async (req,res)=>{
    const result = await OrderReceive.find({
        state:'通过'
    }).sort({orderNumber:-1})
    res.send(result)
})

app.listen(3000,()=>{
    console.log('正在监听中...');
})