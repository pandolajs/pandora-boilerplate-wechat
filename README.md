# pandora-boilerplate-wechat

[![npm version](https://badge.fury.io/js/%40pandolajs%2Fpandora-boilerplate-wechat.svg)](https://badge.fury.io/js/%40pandolajs%2Fpandora-boilerplate-wechat)

一款小而美的微信小程序脚手架。

我们专注于微信小程序开发，所以我们不会引入新的复杂度来限制小程序的能力。

## Feature

- [x] Less
- [x] ES6 [兼容性参考这里](https://developers.weixin.qq.com/miniprogram/dev/devtools/details.html#%E5%AE%A2%E6%88%B7%E7%AB%AFes6-api-%E6%94%AF%E6%8C%81%E6%83%85%E5%86%B5)
- [x] async / await
- [x] dev / test / pre / prod 环境配置、打包
- [x] npm
- [x] module alias
- [x] icon font
- [x] components

## WePY, Taro, mpvue 

以上三套框架的目标都很高远，总结起来就是一句话：“Write once, build anywhere。”

目标高远的很让人敬佩，正所谓理想很丰满现实很骨感，各个平台的最初设计人，由于没有超强的预判能力，所以他们在设计这套平台的时候没有坐在一起讨论过，所以不同的平台间总是存在无法相互 hack 的坑点，导致跨平台的 DSL 编出来的目标代码总是无法 100% 发挥各平台原生的能力。

所以当使用以上三套框架，或者说 DSL 来开发小程序的时候，总是或多或少的阉割掉一部分小程序原生的能力，或者引入各种各样与预期不符的 bug, 说句大实话，原生微信小程序本身相较 HTML 就有各种限制与 bug 了，然后在此基础上，又引入了新的复杂度，那对于只有小程序开发需求的团队来说，用这些 DSL 到底能不能提升开发效率呢？ 会不会出现使用了框架后，结果变成了：用原来 20% 的时间完成了现在 80% 的需求，然后用原来 80% 的时间来 hack 剩下 20% 的需求 ？

如果对这些框架没有足够的认识，还真有可能出现上述有意思的场景，开发的时间总长没变，开发同学却被搞的没有任何幸福感而言。

当然上述的场景只是我个人 YY 的，Taro, mpvue 没用过，WePY 在上手的时候还是比较痛苦的，但是后来也就好了，也不用原生自定义组件，所以问题不是很大，用大话西游中的一句话来形容就是：“吐哇吐哇的就习惯了！”

我们专注于小程序开发，所以，我们写了如上的小程序项目模板，借助构建工具补齐了微信小程序项目工程化的短板，使用原生小程序语法开发，所以，我们可以 100% 的使用小程序的特性而没有任何后遗症，所以对于需求单一的团队来说，请谨慎选型！！

## 使用

### 使用 [pandora-cli](https://github.com/pandolajs/pandora-cli)

- 项目初始初始化

```
  npm i -g pandora-cli

  pa init projectname  

  // 或者对于已有项目目录 

  pa init .

```

- 进入项目目录，安装依赖

```
  npm i
```

- 构建

```
  // 开发环境
  pa start

  // 测试环境
  pa start --env test

  // 预发环境
  pa start --env pre

  // 生产环境
  pa start --env prod
```

- 安装组件，目前我们提供了一套小程序自定义的组件库 [pandora-ui-wechat](https://github.com/pandolajs/pandora-ui-wechat), 通过以下命令来安装组件库中的组件。自动分析依赖，安装所需组件。

```
  pa i drawer
```

- 创建样板代码

```
  // 创建页面样板代码
  pa c page home

  // 创建组件样板代码
  pa c component login

  // 创建 js 文件
  pa c index.js
```

- 从控制台打开小程序开发者工具

```
  pa open
```

- 从控制台发布小程序

```
  pa release patch -m 'some comments.'
```

> 注意：使用 release 发布的时候不需要手动输入版本号，采用和 npm 相同机制的语义化版本管理。

更多命令使用可以参照 [pandora-cli](https://github.com/pandolajs/pandora-cli)

### 单独使用

- 初始化

```
  // 克隆代码库
  git clone https://github.com/pandolajs/pandora-boilerplate-wechat.git

  // 克隆组件库
  git clone https://github.com/pandolajs/pandora-ui-wechat.git

  // 移除 .git
  rm -rf .git

  // 如需使用组件库组件，请自行手动拷贝，自行分析依赖
```

- 构建

```
  // 构建
  npm start           // dev
  npm run build:test  // test
  npm run build:pre   // pre
  npm run build:prod  // prod
```

### 目录介绍

```
.
├── config
│   └── app.yaml                  // 环境配置
├── dist                          // 构建后的目录
├── icons                         // 图标 svg, 自动构建为 icon 图标
│   └── 0-wechat.svg
├── mock                          // 接口 mock 
│   └── home.json
├── package.json
├── project.config.json
├── build.config.js               // 构建配置，模板别名
├── scripts                       // 构建脚本
│   ├── gulp-plugin-alias.js
│   ├── gulp-plugin-font.js
│   ├── gulp-plugin-npm.js
│   ├── gulp-plugin-wxss.js
│   ├── gulp-plugin-yaml.js
│   └── gulpfile.js
└── src                           // 源码目录
    ├── app.js
    ├── app.json
    ├── app.wxss
    ├── components
    ├── images
    ├── pages
    ├── services
    └── utils

```

## TODO

- [ ] 构建脚本独立发布为 gulp plugin

## LICENSE

MIT License

Copyright (c) 2018 pandolajs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.