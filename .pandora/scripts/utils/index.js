/**
 * @fileOverview 工具方法
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-07-17 | sizhao  // 初始版本
*/

const os = require('os')
const path = require('path')
const fs = require('fs')
const http = require('http')

module.exports = {
  getPort () {
    const home = os.homedir()
    const portPath = process.platform === 'win32' 
      ? path.join(home, '/AppData/Local/微信web开发者工具/User Data/Default/.ide') 
      : path.join(home, '/Library/Application Support/微信web开发者工具/Default/.ide')
    if (!fs.existsSync(portPath)) {
      this.log.error('You need install and open wechat development tools.')
      return this.renderAscii()
    } else {
      const port = fs.readFileSync(portPath, { encoding: 'utf8' })
      return +port
    }
  },
  login (port) {
    http.get(`http://127.0.0.1:${port}/login?format=terminal`, res => {
      res.pipe(process.stdout)
      this.log.line()
    })
  }
}