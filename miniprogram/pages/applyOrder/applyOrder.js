// 使用云数据库
import { getTimeNow } from '../../utils/index';
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    userIDImg:'',
    content:'1.证件号指学生证上的号码2.相关证件正面指的是学生证正面3.需要加急请点击微信客服添加好友申请加急！',
    showTip:false,
    name:'',
    userID:''
  },
  //提交申请的回调
  submit() {
    // 保存this指向，方便复用
    const that = this.data;
    // 提交信息
    db.collection('orderReceive').add({
        data: {
            name: that.name,
            userID: that.userID,
            userIDImg: that.userIDImg,
            userInfo: that.userInfo,
            state: '待审核',
            time: getTimeNow(),
            allMoney: 0,
            allCount: 0,
            allOrder: []
        },
        success: (res) => {
            // 清空输入内容
            this.setData({
                name: '',
                userID: '',
                userIDImg: '',
            })
            wx.showToast({
              title: '提交成功',
            })
            wx.navigateTo({
              url: '../receiveLoading/receiveLoading',
            })
        },
        fail: (res) => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
        }
    })
},
  //获取姓名
  getName(e){
    this.setData({
      name:e.detail.value
    })
  },
  //获取证件号
  getUserID(e){
    this.setData({
      userID:e.detail.value
    })
  },
  //自定义组件弹出框的确定按钮
  confirm(){
    this.setData({
      showTip:!this.data.showTip
    })
  },
  //电子协议
  toAgreement(){
    wx.navigateTo({
      url: '../agreement/agreement',
    })
  },
  //点击跳转微信客服
  getAdminWX(){
    wx.setClipboardData({
      data: 'LivewithAsh',
      success:res=>{
        wx.showToast({
          title: '复制微信成功！',
        })
      }
    })
  },
  //常见接单问题说明的回调
  showTips(){
    this.setData({
      showTip:!this.data.showTip
    })
  },
  //相关证件上传的回调
  uploadImg(){
    let userInfo = this.data.userInfo
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
          cloudPath:`userIDImg/${this.data.userInfo.nickName}-${random}.png`,
          filePath:res.tempFiles[0].tempFilePath,
          success:res=>{
            let fileID = res.fileID;
            this.setData({
              userIDImg:fileID
            })
            wx.hideLoading({})
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
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