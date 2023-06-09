// pages/getExpress/getExpress.js
const db = wx.cloud.database()
import {getTimeNow} from '../../utils/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList:[
      {
        name:'小件',
        tips:'小件：手机巴掌大的快件，价格三元',
        money:3
      },
      {
        name:'中件',
        tips:'中件：鞋服大小的快件，价格五元',
        money:5
      },
      {
        name:'大件',
        tips:'大件：重量超过五公斤的快件，价格八元',
        money:8
      },
    ],
    typeNow:0,
    showMore:false, //显示更多的切换变量
    isReward:false, //打赏变量
    businessIndex:0, //picker组件里的value值
    businessArray:['韵达快递','圆通速递','申通快递','中通快递','百世快递','顺丰快递','邮政快递'],
    arriveArray:['不限制','尽快送达','今天早上','今天晚上'],
    arriveIndex:0,
    selectBusiness:false,
    selectArrive:false,
    sexIndex:0,
    sexArray:['不限制性别','男','女'],
    numArray:[1,2,3,4,5,6,7,8,9],
    numIndex:0,
    money:3,
    addMoeny:0,
    business:'',
    codeImg:'',
    expressCode:'',
    remark:'',
    addMoney:0,
    address:''
  },
  //立即提交按钮
  submit(){
    //保存this指向
    const that = this.data;
    //判断必填值有没有值
    //收件地址、快递商家、收件码截图
    if(!that.address || !that.business ||!(that.expressCode || that.codeImg)){
      wx.showToast({
        title: '您填写的信息不全',
        icon:"none"
      })
      return;
    }
    db.collection('order').add({
      data:{
        name:'快递代取',
        time:getTimeNow(), //utils里面封装的方法
        money:that.money,
        state:'待帮助',
        address:that.address,
        info:{
          size:that.typeList[that.typeNow].name,
          business:that.business,
          expressCode:that.expressCode,
          codeImg:that.codeImg,
          remark:that.remark,
          expectTime:that.arriveArray[that.arriveIndex],
          expectGender:that.sexArray[that.sexIndex],
          number:that.numArray[that.numIndex],
        },
        //用户信息
        userInfo:that.userInfo,
      },
      success:res=>{
        wx.showToast({
          title: '发布成功',
        })
        wx.switchTab({
          url: '../index/index',
        })
      },
      fail:err=>{
        wx.showToast({
          title: '发布失败！',
        })
      }
    })
  },
  //额外赏金的信息收集
  getAddMoney(e){
    this.setData({
      //e.detail.value取到的是字符串
      addMoney:Number(e.detail.value)
    })
  },
  //备注信息的信息收集
  getRemark(e){
    this.setData({
      remark:e.detail.value
    })
  },
  //取件信息的信息收集
  getExpressCode(e){
    this.setData({
      expressCode:e.detail.value
    })
  },
  //上传截图
  getCode(){
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType:['original','compresses'],
      sourceType: ['album', 'camera'],
      success:(res)=> {
        wx.showLoading({
          title: '加载中',
        })
        //生成随机数->random函数会从0-1随机生成一个小数，然后*1000就会得到一个大一点的，然后用floor取整
        const random = Math.floor(Math.random()*1000);
        //上传云存储的API
        wx.cloud.uploadFile({
          cloudPath:`expressCode/${random}.png`,
          filePath:res.tempFiles[0].tempFilePath,
          success:res=>{
            //图片在云存储中的id
            let fileID = res.fileID;
            this.setData({
              codeImg:fileID
            })
            wx.hideLoading({})
          }
        })
      }
    })
  },
  bindnumChange(e){
    this.setData({
      numIndex:e.detail.value
    })
  },
  //监听用户选择了哪一个picker
  bindSexChange(e){
    this.setData({
      sexIndex:e.detail.value
    })
  },
  //监听用户选择了哪一个picker
  bindArriveChange(e){
    this.setData({
      arriveIndex:e.detail.value,
      selectArrive:true
    })
  },
  //选择快递点的回调
  selectBusiness(e){
    wx.redirectTo({
      url: '../expressBussiness/expressBussiness?url=getExpress',
    })
  },
  //大中小件的回调
  selectType(e){
    //解构数据
    const {id,tips} = e.currentTarget.dataset;
    this.setData({
      //id是当前选择的低级向
      typeNow:id,
      money:this.data.typeList[id].money
    }),
    //消息弹出框
    wx.showToast({
      icon:'none',
      title:tips
    })
  },
  showMore(){
    this.setData({
      //要加data
        showMore:!this.data.showMore
    })
  },
  handleChange(e){
    const value = e.detail.value;
    this.setData({
      isReward:value
    })
  },
  //请选择地址
  selectAddress(){
    wx.redirectTo({
      url: '../address/address?url=getExpress',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {business} = options;
    const address = wx.getStorageSync('addressNow')
    const userInfo = wx.getStorageSync('userInfo')
    if(address){
      const {build,houseNumber} = address;
      this.setData({
        address:`${build}-${houseNumber}`
      })
    }
    if(business){
      this.setData({
        business
      })
    }
    //因为要展示头像，所以要把userInfo也存一下
    this.setData({
      userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})