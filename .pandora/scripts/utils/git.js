/**
 * @fileOverview git 工具方法
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2019-02-21 | sizhao  // 初始版本
*/

const execa = require('execa')

module.exports = {
  async push (version, cwd) {
    const opts = { cwd }

    await execa('git', ['add', './package.json'], opts)
    await execa('git', ['commit', '-m', `chore(release): ${version} release`], opts)
    const { stdout } = await execa('git', ['symbolic-ref', '--short', '-q', 'HEAD'], opts)
    await execa('git', ['push', 'origin', `HEAD:${branch}`], opts)
  }
}
