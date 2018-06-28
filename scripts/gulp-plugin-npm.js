/**
 * @fileOverview 支持 npm 包管理
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-14 | sizhao       // 初始版本
 * @description
 * 默认支持 js, json 后缀的文件
*/

const through = require('through2')
const path = require('path')
const dependency = require('dependency-tree')
const webpack = require('webpack')
const readPkg = require('read-pkg-up')

function handlerRelivePaht (relative) {
  return /^\./.test(relative) ? relative : `./${relative}`
}

module.exports = function (options) {
  const npmCache = {}
  const { dest = 'dist' } = options
  return through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file)
    }
    const cwd = file.cwd
    const filePath = file.path
    const fileDistPath = path.dirname(filePath.replace(/(\/)src(?=\/)/i, `$1${dest}`))
    let codeStr = file.contents.toString()
    const tree = dependency({
      filename: filePath,
      directory: cwd,
      filter: path => {
        return /node_modules/i.test(path)
      }
    })

    const dependencyTree = tree[filePath]
    if (/[^\w_.-]async(?![\w_.-])/.test(codeStr)) {
      const regeneratorPath = path.join(cwd, 'node_modules', 'regenerator-runtime/runtime-module.js')
      dependencyTree[regeneratorPath] = {}
      codeStr = `import regeneratorRuntime from 'regenerator-runtime'\n${codeStr}`
    }
    Object.keys(dependencyTree).forEach(entry => {
      const dirname = path.dirname(entry)
      const { pkg } = readPkg.sync({
        cwd: dirname
      })
      let moduleName = pkg.name
      const outputFileName = path.basename(entry)
      const distPath = path.join(cwd, dest, 'npm', moduleName)
      const outputFilePath = path.join(distPath, outputFileName)
      const importReg = new RegExp(`import\\s*(\\{?\s*[\\w_-]+\\s*\\}?)\\s*from\\s*['"]${moduleName}(?:[\\w_\\/-]+)*['"]`, 'i')
      codeStr = codeStr.replace(importReg, `import $1 from '${handlerRelivePaht(path.relative(fileDistPath, outputFilePath))}'`)
      if (!npmCache[entry]) {
        webpack({
          mode: 'production',
          entry,
          output: {
            filename: outputFileName,
            path: distPath,
            libraryTarget: 'commonjs2'
          }
        }, error => {
          if (error) {
            console.error(error)
          }
        })
        npmCache[entry] = outputFilePath
      }
    })
    file.contents = Buffer.from(codeStr)
    return callback(null, file)
  })
}