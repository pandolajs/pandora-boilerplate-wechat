/**
 * @fileOverview 项目构建脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-13 | sizhao      // 初始版本
*/

const gulp = require('gulp')
const chalk = require('chalk')
const buildConfig = require('../build.config')
const del = require('del')
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

function watchHandlerCreator (taskName) {
  return event => {
    log(`File ${event.path} was ${event.type}, ${taskName}...`)
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

gulp.watch('config/app.yaml', ['build:config'])
  .on('change', watchHandlerCreator('build:config'))

// less 编译
gulp.task('build:less', (done) => {
  gulp.src('src/**/*.less', { base: 'src' })
    .pipe(wxss())
    .pipe(gulp.dest('dist'))
  done()
})

gulp.watch('src/**/*.less', ['build:less'])
  .on('change', watchHandlerCreator('build:less'))

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

gulp.watch('src/**/*.js', ['build:js'])
  .on('change', watchHandlerCreator('build:js'))

// 复制 wxml, wxss, json
gulp.task('copy', (done) => {
  gulp.src('src/**/*.@(wxml|wxss|json)', { base: 'src' })
    .pipe(gulp.dest('dist'))
  done()
})

gulp.watch('src/**/*.@(wxml|wxss|json)', ['copy'])
  .on('change', watchHandlerCreator('copy'))

// 图片压缩处理
gulp.task('compress:image', () => {
  gulp.src('src/images/**/*.@(png|jpg|gif)', { base: 'src' })
    .pipe(imagemin())
    .pipe(gulp.dest('dist'))
})

gulp.watch('src/images/**/*.@(png|jpg|gif)', ['compress:image'])
  .on('change', watchHandlerCreator('compress:image'))

// svg 生成 font
gulp.task('build:font', ['copy', 'build:less'], () => {
  gulp.src('icons/*.svg', {
    buffer: false
  }).pipe(font({
      fontName: 'icon-font',
      dest: 'dist'
    }))
})

gulp.watch('icons/*.svg', ['build:font'])
  .on('change', watchHandlerCreator('build:font'))

gulp.task('default', ['clean', 'copy', 'build:config', 'build:less', 'build:font', 'build:js', 'compress:image'], () => {
  log('build successfully.')
  log('开始监听文件.')
})