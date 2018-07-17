/**
 * @fileOverview 小程序自动发布脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-07-17 | sizhao  // 初始版本
*/

const fs = require('fs')
const path = require('path')
const http = require('http')
const { getPort, login } = require('./utils')

const choices = ['patch', 'minor', 'major']

function updateVersion (type) {
  const cwd = this.getCwd()
  let pkg = require(path.join(cwd, 'package.json'))
  let { version } = pkg
  version = version.replace(/(\d+)\.(\d+)\.(\d+)/, (m, major, minor, patch) => {
    const verObj = { 
      get major () {
        return major
      }, 
      set major (val) {
        major = val
        minor = 0
        patch = 0
      },
      get minor () {
        return minor
      },
      set minor (val) {
        minor = val
        patch = 0
      },
      get patch () {
        return patch
      },
      set patch (val) {
        patch = val
      }, 
      toString() {
        const { major, minor, patch } = this
        return `${major}.${minor}.${patch}`
      } 
    }
    verObj[type] = ++verObj[type]

    return verObj.toString()
  })

  return version
}

module.exports = {
  prompts: [
    {
      type: 'list',
      name: 'versionType',
      message: 'Please select a versionType that you want to update:',
      choices,
      when ({ cmds = [] }) {
        const versionType = cmds[1]
        if (!versionType || !choices.includes(versionType)) {
          return true
        }
        return false
      }
    },
    {
      type: 'input',
      name: 'm',
      message: 'Please enter a update description:',
      when ({ argvs = {} }) {
        return !argvs.m
      }, 
      validate ({ argvs = {} }, input) {
        if (!argvs.m && !input) {
          return 'You must enter a update description.'
        }
        return true
      }
    }
  ],
  action ({ cmds, argvs }) {
    const versionType = cmds[1] || argvs.versionType
    const message = argvs.m
    const version = updateVersion.call(this, versionType)
    const port = getPort.call(this)
    const cwd = this.getCwd()
    if (!port) {
      return;
    }
    http.get(`http://127.0.0.1:${port}/upload?projectpath=${encodeURIComponent(cwd)}&version=${version}&desc=${encodeURIComponent(message)}`, res => {
      const { statusCode } = res
      if (statusCode === 200) {
        const pkgPath = path.join(cwd, 'package.json')
        const pkg = require(pkgPath)
        const stream = fs.createWriteStream(pkgPath)
        stream.end(JSON.stringify(Object.assign(pkg, {
          version
        }), null, '  '))
        this.log.info(`version: ${version}`)
        this.log.info(`message: ${message}`)
        this.log.success(`Release success !`)
        this.renderAscii()
      } else {
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
        })
      }
    })
  }
}