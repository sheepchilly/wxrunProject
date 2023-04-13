const mongoose = require("mongoose");

//连接mongdb数据库
mongoose.connect('mongodb://127.0.0.1:27017/RUNSchool')
.then(()=>{
    console.log('数据库连接成功！');
}).catch(err=>{
    console.log('数据库连接失败！',err);
})

//申请接单
const OrderReceiveSchema = new mongoose.Schema({
    openid:{
        type:Object
    },
    name:{
        type:String
    },
    userID:{
        type:String
    },
    userIDImg:{
        type:String
    },
    userInfo:{
        type:Object
    },
    state:{
        type:String
    },
    time:{
        type:String
    },
    //统计接单员一共接过多少单
    orderNumber:{
        type:Number,
        default:0 //接单后变成1
    },
    examinPerson:{
        type:String,
        default:''
    }
})
//创建对象模型
const OrderReceive = mongoose.model('OrderReceive',OrderReceiveSchema);


module.exports={
    OrderReceive
}