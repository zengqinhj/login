// pages/info/info.js
var zhenzisms = require('../../utils/zhenzisms.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    longitude:"",
    latitude:"",
    markers:[]
  
  },
  getMyLocation:function(){
    var that=this;
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        console.log(res);
        console.log("1",that.data.latitude);
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude,
          markers: [{
            iconPath: "../../images/MyLoc.png",
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude
          }],
        });
        console.log("2",that.data.latitude);
      }
     })
  },
  onLoad: function () {
    var that = this;
        that.getMyLocation();
  },
})