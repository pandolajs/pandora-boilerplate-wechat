/**
 * @fileOverview 用于处理 less to wxss
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-14 | sizhao       // 初始版本
*/

const through = require('through2')
const less = require('less')
const AutoPrefixer = require('less-plugin-autoprefix')
const autoPrefixPlugin = new AutoPrefixer({browsers: ["last 2 versions"]})
const PluginError = require('plugin-error')
const path = require('path')

const PLUGINNAME = 'gulp-plugin-wxss'
module.exports = function (options = {}) {
  const { path: importPath = [], sourceMap = false } = options
  const opts = {
    path: importPath,
    ieCompat: false,
    plugins: [autoPrefixPlugin]
  }
  if (sourceMap) {
    opts.sourceMap = { sourceMapFileInline: true }
  }
  return through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file)
    }
    const lessStr = file.contents.toString()
    less.render(lessStr, Object.assign({}, opts, {
      filename: file.path
    })).then(res => {
      file.contents = Buffer.from(res.css)
      const extReg = new RegExp(`\\${path.extname(file.path)}$`, 'i')
      file.path = file.path.replace(extReg, '.wxss')
      callback(null, file)
    }).catch(error => {
      error.lineNumber = error.line
      error.fileName = err.filename
      error.message = `${error.message} in file ${error.fileName} line no. ${error.lineNumber}`
      callback(new PluginError(PLUGINNAME, error))
    })
  })
}