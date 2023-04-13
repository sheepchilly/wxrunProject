import { getTimeNow } from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    userIDImg:'', //相关证件地址
    content:'1.证件号指学生证上的号码2.相关证件正面指的是学生证正面3.需要加急请点击微信客服添加好友申请加急！',
    showTip:false,
    name:'',
    userID:''
  },
  //提交申请的回调
  submit() {
    const {
        name,
        userID,
        userIDImg
    } = this.data;
    if (!name || !userID || !userIDImg) {
        wx.showToast({
            icon: 'none',
            title: '您输入的信息不全',
        })
        return;
    }
    wx.request({
        url: 'http://localhost:3000/addNewReceiver',
        method: 'POST',
        data: {
            openid: wx.getStorageSync('openid'),
            name,
            userID,
            userIDImg,
            userInfo: wx.getStorageSync('userInfo'),
            state: '待审核',
            time: getTimeNow(),
        },
        success: (res) => {
            const {
                data
            } = res;
            if (data === "success") {
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
            } else {
                wx.showToast({
                    icon: 'none',
                    title: '上传失败',
                })
            }

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
    wx.chooseImage({
      count: 1,
      mediaType: ['image'],
      sizeType:['original','compresses'],
      sourceType: ['album', 'camera'],
      success:(res)=> {
        wx.showLoading({
          title: '加载中',
        })
        const random = Math.floor(Math.random()*1000);
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'http://localhost:3000/uploadImg', 
          filePath: tempFilePaths[0], //图片路径放在数组第0项下面
          name: 'file',
          success:(res)=>{
            let {path} =JSON.parse(res.data)[0];
            path = path.replace(/\\/g,'/'); //把\换成/，后端传来的地址有问题
            this.setData({
              userIDImg:`http://localhost:3000/${path}`
            })
            wx.hideLoading();
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