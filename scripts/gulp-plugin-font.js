/**
 * @fileOverview 用于处理 svg to webfont
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-14 | sizhao       // 初始版本
*/

const through = require('through2')
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const SVGIcons2SvgFontStream = require('svgicons2svgfont')
const svg2ttf = require('svg2ttf')
const PluginError = require('plugin-error')

const fontFace = `
@font-face {
  font-family : '@{fontFamilyName}';
  src         : url('@{fontString}') format('truetype');
  font-weight : normal;
  font-style  : normal;
}
`

const fontClass = `
.@{className}{
  font-family: '@{fontFamilyName}';
  font-weight : normal;
  font-style  : normal;
  -webkit-font-smoothing: antialiased;
}
`

const iconClass = `
.@{className}_@{icon}::before{
  content: '@{glyph}';
}
`

function template (temp = '', inject) {
  return temp.replace(/@\{([^}]+)\}/g, (m, key) => {
    return inject[key]
  })
}

module.exports = function (options) {
  const defaultOptions = {
    fontName: 'fontIcon',
    dest: 'dist'
  }
  const opts = Object.assign({}, defaultOptions, options)
  const { fontName, dest } = opts
  const glyphs = []
  let startPoint = 0xe600
  const iconFontSteam = new SVGIcons2SvgFontStream({
    fontName,
    centerHorizontally: true,
    normalize: true,
    fontHeight: 1024
  })

  let cwd = process.cwd()

  const fontFamilyName = fontName.replace(/-([a-zA-Z])/, (m, $1) => {
    return $1.toUpperCase()
  })

  const inputStream = through({
    objectMode: true
  })

  inputStream._transform = function (file, encoding, callback) {
    const { contents: glyph, path: filePath } = file
    cwd = file.cwd
    const iconName = path.basename(filePath).replace(/\.svg/i, '').replace(/^\d+-/, '')
    const code = startPoint ++
    const metadata = {
      unicode: [String.fromCharCode(code)],
      name: iconName
    }
    glyph.metadata = metadata
    glyphs.push({
      name: iconName,
      code
    })
    iconFontSteam.write(glyph)
    callback()
  }

  inputStream._flush = async function () {
    const chunks = []
    iconFontSteam.end()
    
    let base64Str = await new Promise((resolve, reject) => {
      iconFontSteam.on('data', chunk => {
        chunks.push(chunk)
      }).on('end', () => {
        const buff = Buffer.concat(chunks)
        const ttfFont = svg2ttf(buff.toString())
        const ttfFontBuffer = Buffer.from(ttfFont.buffer)
        resolve(ttfFontBuffer.toString('base64'))
      }).on('error', () => {
        reject(new PluginError('gulp-plugin-font', 'transform base64 error.'))
      })
    })
    base64Str = `data:${mime.getType('ttf')};base64,${base64Str}`
    const destPath = path.join(cwd, dest, `${fontName}.wxss`)
    if (!fs.existsSync(destPath)) {
      try {
        fs.mkdirSync(path.dirname(destPath))
      } catch (error) {}
    }
    const targetStream = fs.createWriteStream(destPath)
    targetStream.write(template(fontFace, {
      fontFamilyName,
      fontString: base64Str
    }))

    targetStream.write(template(fontClass, {
      fontFamilyName,
      className: fontName
    }))

    glyphs.forEach(glyph => {
      const { name, code } = glyph
      targetStream.write(template(iconClass, {
        className: fontName,
        icon: name,
        glyph: `\\${code.toString(16)}`
      }))
    })

    targetStream.end()

    // 附加到 app.wxss 中
    const appPath = path.join(cwd, dest, 'app.wxss')
    const importStr = `@import "./${fontName}.wxss";`
    let fd
    try {
      fd = fs.openSync(appPath, 'a')
      fs.appendFileSync(fd, importStr, 'utf8')
    } catch (error) {

    } finally {
      fd !== undefined && fs.closeSync(fd)
    }
  }
  return inputStream
}