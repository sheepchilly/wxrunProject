import {getTimeNow} from '../../utils/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ['全部', '我的订单', '我帮助的', '正在悬赏'],
    tabNow: 0,
    orderList: [],
    myOrder: [],
    rewardOrder: [],
    helpOrder: [],
    openid: '',
    canReceive:false,//是否允许接单
    helpTotalNum:0,
    helpTotalMoeny:0,
    comment:'',
    showComment:false,
  },
  showComment(e){
    const {index,tab} = e.currentTarget.dataset
    if(tab ==='0'){
      const data = this.data.orderList;
      data[index].showComment = !data[index].showComment
      this.setData({
        orderList:data
      })
    }else if(tab === '1'){
      const data = this.data.myOrder;
      data[index].showComment = !data[index].showComment;
      this.setData({
        myOrder:data
      })
    }else if(tab === '3'){
      const data = this.data.rewardOrder;
      data[index].showComment = !data[index].showComment;
      this.setData({
        rewardOrder:data
      })
    }
    
  },
  //评论区输入框
  getComment(e){
    const comment = e.detail.value;
    const _id = e.currentTarget.dataset.id
    const {avatarUrl,nickName} = wx.getStorageSync('userInfo')
    wx.request({
      url: 'http://localhost:3000/addComment',
      method:'post',
      data:{
        _id,
        comment,
        nickName,
        avatarUrl,
        time:getTimeNow()
      },
      success:res=>{
        if(res.data==='success'){
          wx.showToast({
            title: '评论成功'
          })
          this.setData({
            comment:''
          })
          //判断当前是在哪个tab下，再去做相应的请求
          const tabNow = this.data.tabNow;

          if (tabNow === 0) {
            this.onLoad();
          } else if (tabNow === 1) {
            this.getMyOrder();
          } else if (tabNow === 2) {
            this.getMyHelpOrder();
            this.getHelpTotalNum();
            this.getHelpTotalMoney();
          } else if (tabNow === 3) {
            this.getRewardOrder();
          }
        }else{
          wx.showToast({
            title: '评论失败',
            icon:'none'
          })
        }
      }
    })
    
    
  },
  //头部导航栏
  selectTab(e) {
    const {id} = e.currentTarget.dataset;
    this.setData({
      tabNow: id,
    })
    if (id === 0) {
      this.onLoad();
    } else if (id === 1) {
      this.getMyOrder();
    } else if (id === 2) {
      this.getMyHelpOrder();
      this.getHelpTotalNum();
      this.getHelpTotalMoney();
    } else if (id === 3) {
      this.getRewardOrder();
    }
  },
    // 我帮助的订单金额总和
    getHelpTotalMoney() {
      wx.request({
        url:"http://127.0.0.1:3000/getHelpTotalMoney",
        data:{
          receivePerson: wx.getStorageSync('openid'),
          state: '已完成',
        },
        success: (res) => {
          this.setData({
            helpTotalMoeny: res.data[0].totalNum
          })
        }
      })
    },

  // 我帮助的订单单数总和
  getHelpTotalNum() {
    wx.request({
      url: 'http://localhost:3000/getHelpTotalNum',
      data:{
        receivePerson: wx.getStorageSync('openid'),
        state: '已完成'
      },
      success: (res) => {
        // console.log(res,'totalNum');
        this.setData({
          helpTotalNum: res.data.count
        })
      }
    })
  },
  // 获取我帮助的订单信息 
  getMyHelpOrder() {
    
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'http://localhost:3000/getMyHelpOrder',
      data:{
        receivePerson:wx.getStorageSync('openid'),
      },success: (res) => {
        // console.log(res);
        const {data} = res;
        data.forEach(item=>{
          item.info = this.formatState(item);
          item.stateColor = this.formatState(item.state);
        })
        this.setData({
          helpOrder: data,
        })
        wx.hideLoading();
      }
    })

  },

  // 获取正在悬赏的订单信息
  getRewardOrder() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'http://localhost:3000/getRewardOrder',
      success: (res) => {
        const {data} = res;
        data.forEach(item => {
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
          item.showComment = false;
        });
        console.log(data)
        this.setData({
          rewardOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

  // 获取我的订单信息
  getMyOrder() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'http://localhost:3000/getMyOrder',
      data:{
        openid:this.data.openid
      },
        success: (res) => {
        const {data} = res;
        data.forEach(item => {
          item.info = this.formatInfo(item); //订单信息
          item.stateColor = this.formatState(item.state); //设置右上角颜色
          item.showComment = false
        });
        this.setData({
          myOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

 // 点击接单
 orderReceive(e) {
   //判断是否允许接单
  if (this.data.canReceive) {
    wx.showLoading({
      title: '加载中',
    })
    const {item} = e.currentTarget.dataset;
    const {_id} = item; //这个_id是当前点击的订单的_id
    // console.log(_id,'_id');
    wx.request({
      url:'http://localhost:3000/toGetOrder',
      method:'get',
      data:{
        receivePerson:wx.getStorageSync('openid'),
        _id
      },
      success:res=>{
        // console.log(res,'orderReceive')
        if(res.data==='success'){
        if(this.data.tabNow===0){
          this.onLoad()
        }else{
          this.getRewardOrder();
          }
        wx.hideLoading();

        }else{
          wx.showToast({
            title: '接单失败',
            icon:'none'
          })
        }
      }
    })
 } else { //false的话就提示不是接单员
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '您目前不是接单员, 请前往个人中心申请成为接单员!'
    })
  }

},
//接单按钮
  toFinish(e) {
    wx.showLoading({
      title: '加载中',
    })
    //解构item
    const {item} = e.currentTarget.dataset;
    //在item里面解构_id
    const {_id} = item;
    wx.request({
      url:"http://localhost:3000/toFinshOrder",
      data:{_id},
      success: (res) => {
        // console.log(res,'tofinish')
        if(res.data === 'success'){
          this.getMyOrder();
        }else{
          wx.showToast({
            title: '操作失败',
            icon:'none'
          })
        }
      }
    })
    wx.hideLoading();
  },

  formatInfo(orderInfo) {
    const {
      name,
      info,
    } = orderInfo;
    if (name === '快递代取') {
      const {
        business,
        expectGender,
        expectTime,
        number,
        remark,
        size
      } = info;
      return `快递类型: ${size} -- 快递数量: ${number}个 -- 快递商家: ${business} -- 期望送达: ${expectTime} -- 性别限制: ${expectGender} -- 备注: ${remark}`;
    } else if (name === '打印服务') {
      const {
        colorPrint,
        pageNum,
        remark,
        twoSided
      } = info;
      return `页数: ${pageNum} -- 是否彩印: ${colorPrint ? '是' : '否'} -- 是否双面: ${twoSided ? '是' : '否'} -- 备注: ${remark}`;
    } else if (name === '校园跑腿') {
      const {
        helpContent,
        pickUpAddress
      } = info;
      return `帮助内容: ${helpContent} -- 取货地点: ${pickUpAddress}`;
    } else if (name === '快递代寄') {
      const {
        helpContent,
        business,
        remark
      } = info;
      return `帮助内容: ${helpContent} -- 快递商家: ${business} -- 备注: ${remark}`;
    } else if (name === '租借服务') {
      const {
        leaseItem,
        leaseTime,
        deliveryTime
      } = info;
      return `租借物品: ${leaseItem} -- 租借时长: ${leaseTime} -- 预计交货时间: ${deliveryTime}`;
    } else if (name === '游戏陪玩') {
      const {
        gameID,
        gameName,
        gameTime,
        remark
      } = info;
      return `游戏名称: ${gameName} -- 游戏时间or盘数: ${gameTime} -- 游戏ID: ${gameID} -- 备注信息: ${remark}`;
    } else if (name === '帮我送') {
      const {
        deliveryInfo
      } = info;
      return `送达地点: ${deliveryInfo}`;
    } else if (name === '代替服务') {
      const {
        helpContent
      } = info;
      return `帮助内容: ${helpContent}`;
    } else if (name === '其它帮助') {
      const {
        helpContent
      } = info;
      return `帮助内容: ${helpContent}`;
    }
  },

  formatState(state) {
    if (state === '待帮助') {
      return 'top_right';
    } else if (state === '已帮助') {
      return 'top_right_help';
    } else if (state === '已完成') {
      return 'top_right_finish';
    }
  },
  getPersonPower(){
    wx.request({
      url: 'http://localhost:3000/getPersonPower',
      data:{
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
//取反两次判断用户当前允不允许接单，没有查到数据的话就是0，0取反两次就是false，1就是true
          canReceive:!!res.data.length
        })
      }
    })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    //获取当前用户的权限--判断是管理员还是普通用户
    this.getPersonPower();

    wx.request({
      url: 'http://localhost:3000/getAllOrder',
      success: (res) => {
        // console.log(res.data,'onload')
        const {data} = res;
        data.forEach(item => {
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
          item.showComment = false
        });
        // console.log(data,'onload')
        this.setData({
          orderList: data,
          openid: wx.getStorageSync('openid')
        })
        wx.hideLoading();
      },
      fail: (res) => {
        wx.showToast({
          icon: 'none',
          title: '服务器异常~~~',
        })
        wx.hideLoading();
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
    this.onLoad();
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