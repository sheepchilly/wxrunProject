// pages/updateInfo/updateInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    phone:'',
  },
  getPhoneNumber(e){
    let phone = this.data.phone
    phone = e.detail.value
    this.setData({
      phone
    })
  },
  updateAvatar(){
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
        wx.cloud.uploadFile({
          cloudPath:`avatar/${this.data.userInfo.nickName}-${random}.png`,
          filePath:res.tempFiles[0].tempFilePath,
          success:res=>{
            let fileID = res.fileID;
            userInfo.avatarUrl = fileID;
            this.setData({
              userInfo
            })
            wx.hideLoading({})
          }
        })
      }
    })
  },
  //修改名字
  updateNikcname(e){
    let userInfo = this.data.userInfo
    userInfo.nickName = e.detail.value
    this.setData({
      userInfo
    })
  },
  //地址点击跳转
  updateAddress(){
    wx.navigateTo({
      url: '../address/address',
    })
  },
  //保存修改
  saveChange(){
    wx.setStorageSync('userInfo', this.data.userInfo)
    wx.setStorageSync('phone', this.data.phone)
    wx.showToast({
      title: '修改成功',
    })
    //tabBar页面的跳转必须要用switchTabconso
    wx.switchTab({
      url: '../person/person',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    const phone = wx.getStorageSync('phone')
    this.setData({
      userInfo,
      phone
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