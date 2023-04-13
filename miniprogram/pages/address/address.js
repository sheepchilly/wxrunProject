// pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:[],
    url:''
  },
  //收集地址信息传给getExpress
  selectAddress(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const url = wx.getStorageSync('urlNow')
    const address = this.data.address[index];
    wx.setStorageSync('addressNow', address);
    wx.redirectTo({
      url: `../${url}/${url}`,
    })
  },
  //编辑按钮的回调
  edit(e){
    const index = e.currentTarget.dataset.index;
    //address就是当前点击的地址的所有信息
    const address = this.data.address[index];
    wx.redirectTo({
      //要把筛选出来的值给它传回去==>在url上传输应该把数据转成字符串来传输
      //传index的作用是：为了知道是在做新增还是替换
      url: `../addAddress/addAddress?address=${JSON.stringify(address)}&index=${index}`,
    })
  },
  //删除
  delete(e){
    //拿到用户点击的index
    const index=e.currentTarget.dataset.index;
    //保存数组
    const address = this.data.address;
    //去掉index这个位置的值
    address.splice(index,1)
    //保存在本地
    wx.setStorageSync('address', address);
    //弹出提示框
    wx.showToast({
      title: '删除成功',
    })
    //重新刷新页面
    this.onLoad();
  },
  addAddress(){
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const address = wx.getStorageSync('address');
    this.setData({
      address,
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