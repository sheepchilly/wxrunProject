// pages/person/person.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    hasUserInfo:false, //判断有没有userInfo，没有才显示按钮
    canIUseGetUserProfile:false, //因为有些不支持getUserProfile
    /* personReceiveState的状态码：
      success：代表已经是接单员了
      fail：代表曾经申请过但是没通过
      loading代表目前有正在申请的
      null代表从未申请过
    */

    personReceiveState:'',
    admin:false
  },
  //申请页面的跳转
  applyOrder() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      //如果不存在用户，就给一个提示
        wx.showToast({
          icon: 'none',
          title: '请先登录!',
        })
        //直接return就可以不用else
        return;
    }
    const {
        personReceiveState
    } = this.data;
    if (personReceiveState === 'success') {
        wx.showModal({
            title: '提示',
            content: '您已经是接单员了, 请勿重复申请!',
            showCancel: false
        })
    } else if (personReceiveState === 'fail') {
        wx.showModal({
            title: '提示',
            content: '您之前提交的申请未通过审核, 您可以继续申请, 如有疑问请联系管理员: LiveWithAsh',
            success: (res) => {
                const {
                  //confirm为true的时候代表用户点击了确定
                    confirm
                } = res;
                if (confirm) {
                    wx.navigateTo({
                        url: '../applyOrder/applyOrder',
                    })
                }
            }
        })
    } else if (personReceiveState === 'loading') {
        wx.showModal({
            title: '提示',
            content: '您之前申请的内容正在审核中, 请耐心等待! 如加急审核请添加管理员微信: LivewithAsh',
            showCancel: false,
        })
        //没有提交任何数据就直接跳进去
    } else if (personReceiveState === 'null') {
        wx.navigateTo({
          url: '../applyOrder/applyOrder',
        })
    }
},
  //审核接单申请的跳转
  applyReceiver(){
    wx.navigateTo({
      url: '../orderReceiver/orderReceiver',
    })
  },
  // 关于我们页面的跳转
  toAbout(e){
    wx.navigateTo({
      url: '../aboutAs/aboutAs',
    })
  },
  //微信客服
  getCustomer(e){
    wx.setClipboardData({
      data: 'LivewithAsh',
      success:()=>{
        wx.showToast({
          title: '复制微信成功',
          icon:'success'
        })
      }
    })
  },
  //获取用户信息-老接口
  getUserinfo(e){
    this.setData({
      userInfo:e.detail.userInfo,
      hasUserInfo:true
    })
  },
  //新接口
  getUserProfile(){
    wx.getUserProfile({
      desc: '获取用户信息',
      success:(res)=>{
        this.setData({
          userInfo:res.userInfo,
          hasUserInfo:true
        })
        //setStorageSync:存缓存的API
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  },
  updateInfo(){
    if(this.data.hasUserInfo){
      wx.navigateTo({
        url: '../updateInfo/updateInfo',
      })
    }
  },
  //判断是不是管理员
  getAdminPower(){
    //查询admin数据库，判断adminID是不是自己的ID，如果是的话就有权去审核
    db.collection('admin').where({
      adminID:wx.getStorageSync('openId')
    }).get({
      success:res=>{
        this.setData({
          //res.data是一个数组，它如果有值的话，两次取反拿到的就是true
          // 0->false->!false->true->!true->false
          //（两次取反就是把数值类型变成布尔类型）
          admin:!!res.data.length
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(wx.getUserProfile){
      //如果存在这个getUserProfile API的话，就把变量设置为true
      this.setData({
        canIUseGetUserProfile:true
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    //判断是否存储了用户信息
    const userInfo = wx.getStorageSync('userInfo');
    // console.log(userInfo,!!userInfo)
    this.setData({
      // !!把原来的字符串或者是对象或空值，取反再取反就可以变成布尔值
      hasUserInfo:!!userInfo,
      userInfo:userInfo
    })
    wx.hideLoading()

    //用户状态
    let personReceiveState = '';
    this.getAdminPower();
    //查询数据库
    db.collection('orderReceive').where({
      //以openid进行查询：因为是自己提交的
      _openid: wx.getStorageSync('openid')
  }).get({
      success: (res) => {
          const {
              data
          } = res;
          //如果data是存在的
          if (data.length) {
              for (let i = 0; i < data.length; i++) {
                  if (data[i].state === '通过') {
                      personReceiveState = 'success';
                      break;
                  } else if (data[i].state === '不通过') {
                      personReceiveState = 'fail';
                  } else {
                      personReceiveState = 'loading';
                      break;
                  }
              }
              //没有提交过数据，用户状态就是null
          } else {
              personReceiveState = 'null';
          }
          this.setData({
            //存一下数据，因为只有点击的时候才会触发module
              personReceiveState,
          })
          wx.hideLoading();
      }
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
    //手动触发onload方法
    this.onLoad();
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