// pages/orderReceiver/orderReceiver.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    receiveList: [],
  },

  // 审核内容
  toExamine(e) {
    wx.showLoading({
      title: '加载中',
    })
    //把点击的数据都给传过来，然后解构出来-name：代表它点击哪一个按钮
    const { item: { _id }, name } = e.currentTarget.dataset;
    db.collection('orderReceive').doc(_id).update({
      data: {
        state: name,
        //审核的管理员是谁
        examinePerson: wx.getStorageSync('openid') 
      },
      success: (res) => {
        //成功的话刷新页面
        this.onLoad();
        //隐藏loading
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('orderReceive').where({
      state: '待审核'
    }).get({
      success: (res) => {
        this.setData({
          receiveList: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})