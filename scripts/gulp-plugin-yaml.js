/**
 * @fileOverview 处理配置文件的插件
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-14 | sizhao
*/

const through = require('through2')
const yamlLoader = require('js-yaml')

const headerCommentTemplate = `/**
 * MUST NOT MODIFY THE FILE!!!!!!
 * @fileOverview 构建生成的配置文件，切勿自动修改，若有需求，请修改 /config/app.yaml 中的配置
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | {year}-{month}-{day}
*/
`

const codeTemplate = `
const config = {code}

export default config
`

const varReg = /\{([^}]+)\}/g

module.exports = function (env = 'development') {
  return through.obj((file, encoding, callback) => {
    // 处理生成的文件的头部注释
    const date = new Date()
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDay()}`.padStart(2, '0')
    const formatDateObj = {
      year, month, day
    }
    const comment = headerCommentTemplate.replace(varReg, (m, $1) => {
      return formatDateObj[$1]
    })

    // 生成配置
    const config = yamlLoader.safeLoad(file.contents.toString())
    const { development, test, preproduction, production, ...commonFields } = config
    const targetConfig = config[env] || {}
    const codeObj = {
      code: JSON.stringify(Object.assign({}, commonFields, targetConfig), null, '  ')
    }
    const code = codeTemplate.replace(varReg, (m, $1) => {
      return codeObj[$1]
    })

    // 修改文件
    file.contents = Buffer.from(`${comment}${code}`, 'utf8')
    file.base = file.cwd
    file.path = 'config/index.js'
    callback(null, file)
  })
}