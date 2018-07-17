/**
 * @fileOverview 构建工具运行脚本
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-25 | sizhao
*/

const chalk = require('chalk')
const { spawn } = require('child_process')

function color (chunk) {
  return chunk.toString().replace(/\[([^\]]+)\]/g, (m, $1) => {
    return `[${chalk.gray($1)}]`
  }).replace(/'([\w:]+)'/g, (m, $1) => {
    return `'${chalk.cyan($1)}'`
  }).replace(/(\d+(?:\.\d+)?\s*[mμ]s)/g, (m, $1) => {
    return chalk.green($1)
  })
}

module.exports = ({ argvs: { env } }) => {
  const npmCmd = {
    dev: 'start',
    test: 'build:test',
    pre: 'build:pre',
    prod: 'build:prod'
  }

  const cp = spawn('npm', ['run', npmCmd[env]])
  cp.stdout.on('data', chunk => process.stdout.write(color(chunk)))
  cp.stderr.on('data', chunk => process.stderr.write(color(chunk)))
}
