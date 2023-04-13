const { baseUrl } = require('../config/env').dev

// 封装ajax
module.exports = {
  request: function(url, method = 'POST', data = {}, isLoading = true) {
    // 操作url
    var url = `${baseUrl}${url}`
    // 操作data
    var data = data
    console.log(url,data,"请求参数")
    if (isLoading) wx.showLoading({ title: '加载中...' })
    return new Promise((resolve, reject)=>{
      wx.request({
        url: url,
        method: method,
        data: data, // GET请求不用传参数
        header: {
          token:wx.getStorageSync('token') || ' ',
          'Content-type': 'application/x-www-form-urlencoded' || 'application/json'
        },
        success(res) {
          wx.setStorageSync('token',res.data.data );
          if (data.code === '401') { // 这里可以对请求的状态进行判断，做出相应的动作，登录过期，去登陆
            wx.removeStorageSync('token')
            return wx.showModal({
              title: '温馨提示',
              content: '您当前还未登录，为了更好的体验请先登录!',
              showCancel: true,
              success: function (res) {
                if (res.confirm) {
                  // return wx.navigateTo({
                  //   url: '/pages/person/person', // 点击确定去登陆
                  // })
                }
              }
            })
          }
          if (res.statusCode === 200 && res.data.code === 0) {
            resolve(res.data,"接收参数")
          } else {
            wx.showToast({
              title: '接口有问题',
              icon: 'none'
            })
            reject(res)
          }
        },
        fail(error) {
          wx.showToast({
            title: '接口有问题',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }
}