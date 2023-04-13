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
        inner:'代取快递,免排队',
        url:'../getExpress/getExpress'
      },
      {
        icon:'../../images/dayin.png',
        text:'打印服务',
        inner:'代帮打印,免等待',
        url:'../print/print'
      },
      {
        icon:'../../images/paotui.png',
        text:'校园跑腿',
        inner:'代办业务,免跑腿',
        url:'../run/run'
      },
      {
        icon:'../../images/daiji.png',
        text:'快递代寄',
        inner:'代寄快递,免走动',
        url:'../expressReplace/expressReplace'
      },
      {
        icon:'../../images/zujie.png',
        text:'租借服务',
        inner:'"你需要的我都有"',
        url:'../lease/lease'
      },
      {
        icon:'../../images/peiwan.png',
        text:'游戏陪玩',
        inner:'上分不再难',
        url:'../playGame/playGame'
      },
      {
        icon:'../../images/bangsong.png',
        text:'帮我送',
        inner:'代办业务,免跑腿',
        url:'../helpMeGive/helpMeGive'
      },
      {
        icon:'../../images/tidai.png',
        inner:'一站式解决',
        text:'代替服务',
        url:'../replaceMe/replaceMe'
      },
      {
        icon:'../../images/qita.png',
        inner:'别的需求看这里',
        text:'其他帮助',
        url:'../otherHelp/otherHelp'
      }
    ],
    userInfo:{},
  },
  //切换页面（鉴权）
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
      wx.login({
        success: (res) => {
          if(res.code){
            wx.request({
              url: 'http://127.0.0.1:3000/login',
              data:{
                code:res.code
              },
              success:res=>{
                const {openid} = res.data;
                wx.setStorageSync('openid', openid)
                this.data.userInfo={
                  openid,
                  session_key:res.data.session_key,
                  nickName:`用户${openid.slice(-8)}`,
                  avatarUrl:'../../images/person.png'
                }
                wx.setStorageSync('userInfo', this.data.userInfo)
                
              }
            })
          }
        },
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