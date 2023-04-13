// pages/addAddress/addAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultAddress:true, //默认地址按钮是否选中
    build:'',
    houseNumber:'',
    name:'',
    phone:'',
    isEdit:false,
    editNum:false,
    editIndex:0,
  },
  //保存按钮
  saveAddress(){
    const {build,houseNumber,name,phone,defaultAddress,isEdit,editNum,index} = this.data;
    let address = wx.getStorageSync('address')
    if(!isEdit && defaultAddress && address){
        //已经存在默认地址了
        for(let i=0;i<address.length;i++){
          if(address[i].defaultAddress){
            wx.showToast({
              icon:'none',
              title: '已存在默认地址',
            })
            return;
          }
      }
    }
    //保存数据
    const form = {
      build,
      houseNumber,
      name,
      phone,
      defaultAddress
    }
    if(!address){
      //判断缓存里面没有值的时候
      address = [form]
    }else{
      if(editNum){
        address[Number(index)] = form;
      }else{
        //有值的时候
        address.push(form)
      }
    }
    wx.setStorageSync('address', address)
    wx.redirectTo({
      url: '../address/address',
    })
  },
  handleChangeSwitch(e){
    this.setData({
      defaultAddress:e.detail.value
    })
  },
  getPhone(e){
    this.setData({
      phone:e.detail.value
    })
  },
  selectBuild(){
    wx.navigateTo({
      url: '../selectBuild/selectBuild',
    })
  },
  //获取门牌号
  getHouseNumber(e){
    this.setData({
      houseNumber:e.detail.value
    })
  },
  getName(e){
    this.setData({
      name:e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // options可以获取到a页面跳转b页面时携带的参数
    const {build,address,index} = options;
    // console.log(address)
    if(address){
       //取的时候要把字符串转为对象
      const {build:builds,houseNumber,name,phone,defaultAddress} = JSON.parse(address)
      if(defaultAddress){
        //如果当前编辑的地址是默认地址
        this.setData({
          isEdit:true
        })
      }
      this.setData({
        build:builds,
        houseNumber,
        name,
        phone,
        defaultAddress,
        index,
        //如果address有值的话，代表当前的操作是编辑
        editNum:true,
      })
    }else{
      this.setData({
        build
      })
    }
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