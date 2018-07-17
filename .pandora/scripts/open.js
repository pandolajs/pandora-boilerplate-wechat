/**
 * @fileOverview 打开小程序开发者工具脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-07-17 | sizhao  // 初始版本
*/

const { getPort, login } = require('./utils')
const http = require('http')

module.exports = function () {
  const port = getPort.call(this)
  http.get(`http://127.0.0.1:${port}/open?projectpath=${encodeURIComponent(this.getCwd())}`, res => {
    const { statusCode } = res
    if (statusCode !== 200) {
      res.setEncoding('utf8')
      let chunks = []
      res.on('data', chunk => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        const { code } = JSON.parse(chunks.join(''))
        if (code === 40000) {
          this.log.info('Please scan the qrcode below to login.')
          this.log.line()
          return login.call(this, port)
        }
        this.log.error('Release failure.')
        this.renderAscii()
      }).on('error', () => {
        this.log.error('Ohoo, baby you need open wechat development tools first!')
        this.renderAscii()
      })
    }
  })
}