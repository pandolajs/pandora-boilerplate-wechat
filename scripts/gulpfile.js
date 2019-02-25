/**
 * @fileOverview 项目构建脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-13 | sizhao      // 初始版本
 * @version 1.1.0 | 2019-02-21 | sizhao      // 重写 gulp watch 方法，修复不监听新增文件的问题
*/

const gulp = require('gulp')
const chalk = require('chalk')
const buildConfig = require('../build.config')
const del = require('del')
const watch = require('glob-watcher')
const imagemin = require('gulp-imagemin')
const yaml = require('./gulp-plugin-yaml')
const wxss = require('./gulp-plugin-wxss')
const alias = require('./gulp-plugin-alias')
const npm = require('./gulp-plugin-npm')
const font = require('./gulp-plugin-font')

const env = process.env.NODE_ENV || 'development'

function log (message = '') {
  const date = new Date()
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')

  const timeStr = `[${chalk.gray(`${hours}:${minutes}:${seconds}`)}]`
  console.log(`${timeStr} [Build]: ${chalk.greenBright(message)}`)
}

// 重写 watch 方法
gulp.watch = (patterns, tasks = []) => {
  return watch(patterns, (done) => {
    tasks.forEach((name) => {
      const task = gulp.tasks[name]
      if (task) {
        gulp.start(name)
      } else {
        log(`${task} is not defined`)
      }
    })
    done()
  })
}

function watchHandlerCreator (taskName) {
  return filePath => {
    log(`File ${filePath} was modified, ${taskName}...`)
  }
}

gulp.task('clean', (callback) => {
  del.sync('dist/**')
  callback()
})

// 生成配置
gulp.task('build:config', () => {
  gulp.src('config/app.yaml')
    .pipe(yaml(env))
    .pipe(gulp.dest('dist'))
})

// less 编译
gulp.task('build:less', (done) => {
  gulp.src('src/**/*.less', { base: 'src' })
    .pipe(wxss())
    .pipe(gulp.dest('dist'))
  done()
})

// js alias 编译
gulp.task('build:js:alias', () => {
  gulp.src('src/**/*.js', { base: 'src' })
    .pipe(alias(buildConfig.alias))
    .pipe(npm({
      dest: 'dist'
    }))
    .pipe(gulp.dest('dist'))
})

// js 源码编译
gulp.task('build:js', ['build:js:alias'])

// 复制 wxml, wxss, json
gulp.task('copy', (done) => {
  gulp.src('src/**/*.@(wxml|wxss|json|wxs)', { base: 'src' })
    .pipe(gulp.dest('dist'))
  done()
})

// 图片压缩处理
gulp.task('compress:image', () => {
  gulp.src('src/images/**/*.@(png|jpg|gif)', { base: 'src' })
    .pipe(imagemin())
    .pipe(gulp.dest('dist'))
})

// svg 生成 font
gulp.task('build:font', ['copy', 'build:less'], () => {
  gulp.src('icons/*.svg', {
    buffer: false
  }).pipe(font({
      fontName: 'icon-font',
      dest: 'dist'
    }))
})

if (env === 'development') {
  // 监听配置
  gulp.watch('config/app.yaml', ['build:config'])
    .on('change', watchHandlerCreator('build:config'))

  // 监听 icon font 构建
  gulp.watch('icons/*.svg', ['build:font'])
    .on('change', watchHandlerCreator('build:font'))

  // 监听图片
  gulp.watch('src/images/**/*.@(png|jpg|gif)', ['compress:image'])
    .on('change', watchHandlerCreator('compress:image'))

  // 监听小程序其他文件变化
  gulp.watch('src/**/*.@(wxml|wxss|json)', ['copy'])
    .on('change', watchHandlerCreator('copy'))

  // 监听 less 构建
  gulp.watch('src/**/*.less', ['build:less'])
    .on('change', watchHandlerCreator('build:less'))

  // 监听 js 构建
  gulp.watch('src/**/*.js', ['build:js'])
    .on('change', watchHandlerCreator('build:js'))
}

gulp.task('default', ['clean', 'copy', 'build:config', 'build:less', 'build:font', 'build:js', 'compress:image'], () => {
  log('build successfully.')
  log('开始监听文件.')
})
