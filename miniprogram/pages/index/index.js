// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner:['../../images/齐司礼2.jpg','../../images/查理苏5.jpg','../../images/陆沉3.jpg'],
    indexConfig:[
      {
        icon:'../../images/kuaidi.png',
        text:'快递代取',
        // 在这里写上url就可以直接把url传过去
        url:'../getExpress/getExpress'
      },
      {
        icon:'../../images/dayin.png',
        text:'打印服务',
        url:'../print/print'
      },
      {
        icon:'../../images/paotui.png',
        text:'校园跑腿',
        url:'../run/run'
      },
      {
        icon:'../../images/kuaididaiji.png',
        text:'快递代寄',
        url:'../expressReplace/expressReplace'
      },
      {
        icon:'../../images/zujie.png',
        text:'租借服务',
        url:'../lease/lease'
      },
      {
        icon:'../../images/youxi.png',
        text:'游戏陪玩',
        url:'../playGame/playGame'
      },
      {
        icon:'../../images/bangsong.png',
        text:'帮我送',
        url:'../helpMeGive/helpMeGive'
      },
      {
        icon:'../../images/daiti.png',
        text:'代替服务',
        url:'../replaceMe/replaceMe'
      },
      {
        icon:'../../images/qita.png',
        text:'其他帮助',
        url:'../otherHelp/otherHelp'
      }
    ]
  },
  //切换页面
  toDetail(e){
    const url = e.currentTarget.dataset.url;
    //1.取缓存
    const userInfo = wx.getStorageSync('userInfo');
    //2.判断如果存在的话
    if(userInfo){
      wx.navigateTo({
        url
      })
    }else{
      wx.showToast({
        icon:'none',
        title: '请前往个人中心登录',
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取openid
    const openid = wx.getStorageSync('openid');
    
    if(!openid){
      wx.cloud.callFunction({
        //name是云函数的名字
        name:'getMyOpenID',
        success:res=>{
          const {openid} = res.result
          wx.setStorageSync('openid',openid)
        }
      })
    }
  },
  handleClickNotice(){
    wx.showModal({
      title: '公告',
      content: '关注公众号可享订单推送-接单员请务必添加客服v:livewithAsh' 
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