// pages/order/order.js
const db = wx.cloud.database();
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
    helpTotalMoney:0
  },
  selectTab(e) {
    const {
      id
    } = e.currentTarget.dataset;
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
    } else if (id === 3) {
      this.getRewardOrder();
    }
  },
    // 我帮助的订单金额总和
    getHelpTotalMoney() {
      //用一个变量保存一下
      const $ = db.command.aggregate;
      db.collection('order').aggregate().match({
        receivePerson: wx.getStorageSync('openid'),
        state: '已完成',
        //分组
      }).group({
        //_id只是占位
        _id: null,
        totalNum: $.sum('$money'),
      }).end({
        success: (res) => {
          console.log(res);
          this.setData({
            helpTotalMoeny: res.list[0].totalNum
          })
        }
      })
    },
  // 我帮助的订单单数总和
  getHelpTotalNum() {
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成'
      //.count==>查询总数
    }).count({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalNum: res.total
        })
      }
    })
  },
  // 获取我帮助的订单信息 
  getMyHelpOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('orderReceive').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        this.setData({
          helpTotalMoeny: data[0].allMoney,
          helpTotalNum: data[0].allCount
        })
        this.setData({
          helpOrder: data[0].allOrder,
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
    db.collection('order').where({
      state: '待帮助'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
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
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid: this.data.openid
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
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
    const {
      item
    } = e.currentTarget.dataset;
    const {
      _id
    } = item;
    db.collection('order').doc(_id).update({
      data:{_openid:wx.getStorageSync('openid'),
      state:'已帮助'
    },
    success:res=>{
      if(this.data.tabNow===0){
        this.onLoad()
      }else{
        this.getRewardOrder();
      }
      wx.hideLoading();
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

  toFinish(e) {
    wx.showLoading({
      title: '加载中',
    })
    //解构item
    const {
      item
    } = e.currentTarget.dataset;
    //在item里面解构_id
    const {
      _id
    } = item;
    db.collection('order').doc(_id).update({
      //把现有的state改成已完成
      data: {
        state: '已完成'
      },
      success: (res) => {
        this.getMyOrder();
        wx.hideLoading();
      }
    })
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
  db.collection('orderReceive').where({
    //查询条件是openid和state
    _openid:wx.getStorageSync('openid'),
    state:'通过'
  }).get({
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
    db.collection('order').get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
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
    wx.showLoading({
      title: '加载中',
    })
    let {
      orderList,
      myOrder,
      rewardOrder,
      helpOrder,
      tabNow,
      openid
    } = this.data;

    //分页功能，skip是查询的起点
    if (tabNow === 0) {
      db.collection('order').skip(orderList.length).get({
        success: (res) => {
          if (res.data.length) {
            res.data.forEach(item => {
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              orderList.push(item);
            })
            this.setData({
              orderList,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        },
        fail: (error) => {
          wx.showToast({
            icon: 'none',
            title: '服务器出错...',
          })
          wx.hideLoading();
        }
      })
      //我的订单页面是条件查询
    } else if (tabNow === 1) {
      db.collection('order').skip(myOrder.length).where({
        _openid: openid
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              //数据要push进去
              myOrder.push(item);
            });
            this.setData({
              myOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    } else if (tabNow === 2) {
      db.collection('order').skip(helpOrder.length).where({
        receivePerson: this.data.openid,
        state:'已完成'
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              helpOrder.push(item);
            });
            this.setData({
              helpOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    } else if (tabNow === 3) {
      db.collection('order').skip(rewardOrder.length).where({
        state: '待帮助'
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              rewardOrder.push(item);
            });
            this.setData({
              rewardOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})