//获取应用实例
const app = getApp()

Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isHide: false,
        isPhone: false,
        hidden: true,
    btnValue:'',
    btnDisabled:false,
    name: '',
    phone: '',
    code: '',
    second: 60,
    sendTime: '发送验证码',
    snsMsgWait: 300
    },
    onLoad: function() {
        var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function(res) {
                            // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
                            // 根据自己的需求有其他操作再补充
                            // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
                            wx.login({
                                success: res => {
                                    // 获取到用户的 code 之后：res.code
                                    console.log("用户的code:" + res.code);
                                    wx.getUserInfo({
                                        success: function (res) {
                                            var userInfo = res.userInfo
                                            var nickName = userInfo.nickName
                                            var avatarUrl = userInfo.avatarUrl
                                            //昵称
                                            console.log("用户的昵称:" + nickName);
                                            app.globalData.nickName = nickName;
                                            //头像地址
                                            console.log("用户的头像地址:" + avatarUrl);
                                            app.globalData.avatarUrl = avatarUrl;
                                        }
                                      });
                                    // 可以传给后台，再经过解析获取用户的 openid
                                    // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
                                    wx.request({
                                
                                        url: 'https://api.weixin.qq.com/sns/jscode2session',//微信服务器获取appid的网址 不用变
                                        method:'POST',//必须是post方法
                                        data:{
                                        js_code:res.code,
                                        appid:'wx583f12034a04993e',//仅为实例appid
                                        secret:'d168ac30a8be5e9cac44d9ba4d7dfc89',//仅为实例secret
                                        grant_type:'authorization_code'
                                        },
                                        header: {
                                        'content-type': 'application/x-www-form-urlencoded',
                                        },
                                        success: res => {
                                            // 获取到用户的 openid
                                            app.globalData.openid = res.data.openid;
                                            wx.request({
                                
                                                url: 'http://127.0.0.1:8765/test/select',//微信服务器获取appid的网址 不用变
                                                method:'POST',//必须是post方法
                                                data:{
                                                wxId:res.data.openid
                                                },
                                                header: {
                                                'content-type': 'application/x-www-form-urlencoded',
                                                },
                                                success: res => {
                                                    console.log("用户的头像地址:" + res.data);
                                                if(res.data==false){
                                                    that.setData({
                                                        isPhone: true
                                                    });
                                                }else{
                                                  wx.reLaunch({
                                                    url: '../info/info',
                                                    })
                                                }
                                                    
                                                }
                                            });
                                        
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    // 用户没有授权
                    // 改变 isHide 的值，显示授权页面
                    that.setData({
                        isHide: true
                    });
                }
            }
        });
    },

    bindGetUserInfo: function(e) {
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            // 获取到用户的信息了，打印到控制台上看下
            console.log("用户的信息如下：");
            console.log(e.detail.userInfo);
            //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
            that.setData({
                isHide: false
            });
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function(res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”');
                    }
                }
            });
        }
    },

    //手机号输入
  bindPhoneInput(e) {
    //console.log(e.detail.value);
    var val = e.detail.value;
    this.setData({
      phone: val
    })
    if(val != ''){
      this.setData({
        hidden: false,
        btnValue: '获取验证码'
      })
    }else{
      this.setData({
        hidden: true
      })
    }
  },
  //验证码输入
  bindCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },
  //获取短信验证码
  getCode(e) {
    var that = this;
    that.data.phone;

    if (that.data.phone == "") {
      this.toast('请输入手机号');
      return;
    }

    if (!(/^1[3|4|5|8|7|9][0-9]\d{8}$/.test(that.data.phone))) {
      this.toast('手机号输入错误');
      return;
    }

    // 180秒后重新获取验证码
    var inter = setInterval(function() {
      this.setData({
        smsFlag: true,
        sendColor: '#cccccc',
        sendTime: this.data.snsMsgWait + 's后重发',
        snsMsgWait: this.data.snsMsgWait - 1
      });
      if (this.data.snsMsgWait < 0) {
        clearInterval(inter)
        this.setData({
          sendColor: '#363636',
          sendTime: '发送验证码',
          snsMsgWait: 300,
          smsFlag: false
        });
      }
    }.bind(this), 1000);

    // 写自己的服务器和接口- - 
    wx.request({
      url: 'http://127.0.0.1:8765/test/phoneCode',
      data: {
        mobiles: that.data.phone,
      },
      method: "POST",
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data);
        if (res.data.data==true) {
          that.showToast('短信验证码发送成功，请注意查收');
		  app.globalData.phone = that.data.phone;
		  app.globalData.code = res.data.code;
        }
      }
    })
    
  },
  timer: function () {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          var second = this.data.second - 1;
          this.setData({
            second: second,
            btnValue: second+'秒',
            btnDisabled: true
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              btnValue: '获取验证码',
              btnDisabled: false
            })
            resolve(setTimer)
          }
        }
        , 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  showToast(msg){
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },
  //保存
  save(e) {
    //console.log('姓名: ' + this.data.name);
    //console.log('手机号: ' + this.data.phone);
    //console.log('验证码: ' + this.data.code);
    var that = this;
	if (that.data.phone == "") {
      this.toast('请输入手机号');
      return;
    }

    if (!(/^1[3|4|5|8|7|9][0-9]\d{8}$/.test(that.data.phone))) {
      this.toast('手机号输入错误');
      return;
    }
    if (that.data.code == "") {
      that.toast('请输入验证码！');
      return;
    }
	if (app.globalData.phone != that.data.phone) {
          that.showToast('验证错误，手机号不一致!');
		  return;
    } 
	if (app.globalData.code != that.data.code) {
          that.showToast('验证错误，验证码不一致!');
		  return;
     } 
	 if(this.data.snsMsgWait < 0){
		 that.showToast('验证错误，验证码已过期!');
	 }
     //检验验证码
     wx.request({
      url: 'http://127.0.0.1:8765/test/phoneCodeEq',
      data: {
        phone: that.data.phone,
        nickName: app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl,
        wxId: app.globalData.openid,
      },
      method: "POST",
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        var result = res.data.result;
        if (result == 'ok'){
          that.showToast('验证正确！');
          wx.reLaunch({
            url: '../info/info',
            })
        }else{
			 that.showToast('手机验证失败！！!');
		}
      }
    })
  }
})
