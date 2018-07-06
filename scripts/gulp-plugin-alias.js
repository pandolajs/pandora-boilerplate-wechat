/**
 * @fileOverview 用于处理 js 自定义别名
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-14 | sizhao       // 初始版本
*/

const through = require('through2')
const path = require('path')

module.exports = function (alias = {}) {
  return through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file)
    }
    const aliasNames = Object.keys(alias)
    if (aliasNames.length > 0) {
      const aliasStr = aliasNames.join('|')
      const importReg = new RegExp(`import\\s*\\{?\\s*[\\w_-]*\\s*\\}?\\s*from\\s*['"](${aliasStr})(?:\\/[\\w_.-]+)*['"]`, 'ig')
      let codeStr = file.contents.toString()
      const cwd = file.cwd
      codeStr = codeStr.replace(importReg, (m, key) => {
        const aliasPath = path.resolve(cwd, alias[key])
        let aliasRelative = path.relative(path.dirname(file.path), aliasPath)
        aliasRelative = /^\./.test(aliasRelative) ? aliasRelative : `./${aliasRelative}`
        const moduleReg = new RegExp(`(from\\s*(['"]))${key}(?=(?:\\/[\\w_.-]+)*\\2)`)
        return m.replace(moduleReg, `$1${aliasRelative}`)
      })
      file.contents = Buffer.from(codeStr)
    }
    callback(null, file)
  })
}