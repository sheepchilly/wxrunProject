const mongoose = require('mongoose');

//连接mongodb数据库
mongoose.connect('mongodb://127.0.0.1:27017/RUNSchool')
.then(()=>{
    console.log('数据库连接成功！');
}).catch(err=>{
    console.log('数据库连接失败！',err);
})

const OrderSchema = new mongoose.Schema({
    name:{
        type:String
    },
    time:{
        type:String
    },
    money:{
        type:Number
    },
    state:{
        type:String
    },
    address:{
        type:String
    },
    info:{
        type:Object
    },
    userInfo:{
        type:Object
    },
    phone:{
        type:String
    },
    receivePerson:{
        type:String,
        default:''
    },
    //评论
    commentList:{
        type:Array,
        default:[]
    },
    //订单评分的星级数量
    starNum:{
        type:Number,
        default:0
    }
})

const Order = mongoose.model('Order',OrderSchema)

module.exports={
    Order
}