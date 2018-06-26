/**
 * @fileOverview 支持 npm 包管理
 * @author houquan | houquan@babytree-inc.com
 * @version 1.0.0 | 2018-06-14 | houquan       // 初始版本
 * @description
 * 默认支持 js, json 后缀的文件
*/

const through = require('through2')
const vfs = require('vinyl-fs')
const path = require('path')
const fs = require('fs')

function handlerRelivePaht (relative) {
  return /^\./.test(relative) ? relative : `./${relative}`
}

module.exports = function (options) {
  const npmCache = {}
  const { mainFiled = ['main'], dest = 'dist' } = options
  return through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file)
    }
    const cwd = file.cwd
    const filePath = file.path
    const fileDistPath = path.dirname(filePath.replace(/(\/)src(?=\/)/i, `$1${dest}`))
    const importReg = /import\s*\{?\s*[\w_-]+\s*\}?\s*from\s*['"]([@\w_\/-]+)['"]/ig
    let codeStr = file.contents.toString()
    codeStr = codeStr.replace(importReg, (m, modulx) => {
      let modulePath = path.join(cwd, 'node_modules', modulx)
      let stat = null
      try {
        stat = fs.statSync(modulePath)
      } catch (error) {
        const extname = ['js', 'json']
        for (let i = 0, len = extname.length; i < len; i++ ) {
          const ext = extname[i]
          try {
            modulePath = `${modulePath}.${ext}`
            stat = fs.statSync(modulePath)
            break
          } catch (error) {
            if (i == len - 1) {
              console.log('[Error]: can not find module', modulePath, 'in file', filePath)
            }
          }
        }
      }
      let relativePath = ''
      if (stat) {
        if (!npmCache[modulx]) {
          if (stat.isDirectory()) {
            let mainPath = ''
            const pkgPath = path.join(modulePath, 'package.json')
            const pkg = require(pkgPath)
            mainPath = path.join(modulePath, pkg.main)
            const distPath = path.join(cwd, dest, 'npm', path.dirname(path.join(modulx, pkg.main)))
            const moduleDistPath = path.join(distPath, path.basename(mainPath))
            relativePath = path.relative(fileDistPath, moduleDistPath)
            npmCache[modulx] = {
              main: mainPath,
              dest: moduleDistPath
            }
            vfs.src([mainPath])
              .pipe(vfs.dest(distPath))
          } else {
            const moduleDir = path.dirname(modulx)
            const distPath = path.join(cwd, dest, 'npm', moduleDir)
            const moduleDistPath = path.join(distPath, path.basename(modulePath))
            relativePath = path.relative(fileDistPath, moduleDistPath)
            npmCache[modulx] = {
              main: modulePath,
              dest: moduleDistPath
            }
            vfs.src([modulePath])
              .pipe(vfs.dest(distPath))
          }
        } else {
          relativePath = path.relative(fileDistPath, npmCache[modulx].dest)
        }
      }
      
      const moduleReg = new RegExp(`(from\\s*(['"]))${modulx}(\\2)`)
      return relativePath ? m.replace(moduleReg, `$1${handlerRelivePaht(relativePath)}$2`) : m
    })
    file.contents = Buffer.from(codeStr)
    return callback(null, file)
  })
}