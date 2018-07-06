/**
 * @fileOverview 首页脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-25 | sizhao
*/

import { sayHello } from 'util/index'

Page({
  async onLoad () {
    const str = await Promise.resolve(sayHello())
    wx.showToast({
      title: str
    })
  }
})