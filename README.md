# ui-cc

> 制作自己的UI框架

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

npm run build:theme

npm run build
```

[**1-初步构建**](#1-初步构建)<br>
[**2-修改配置**](#2-修改配置)<br>
[**3-测试**](#3-测试)<br>
[**4-打包css和fonts**](#4-打包css和fonts)<br>
[**5-按需加载**](#5-按需加载)<br>
[**6-UI框架Markdown格式组件说明文档**](#6-UI框架Markdown格式组件说明文档s)<br>
- [6.1 下载依赖](#61-下载依赖)
- [6.2 配置](#62-配置)
- [6.3 md格式组件使用](#63-md格式组件使用)

## <a id="1-初步构建"></a>1-初步构建

建立一个vue-cli多页面项目： [https://github.com/ccyinghua/webpack-multipage](https://github.com/ccyinghua/webpack-multipage)

将src文件夹重命名为examples，作为调试、UI框架说明文档例子；
将build中的webpack相关配置文件中关于src的路径改为examples

新建packages文件夹放置各个功能模块
lib文件夹是最终打包生成目录
增加components.json文件

## <a id="2-修改配置"></a>2-修改配置

config/index.js
```javascript
build: {
  assetsRoot: path.resolve(__dirname, '../lib') // 打包生成目录
}
```
打包配置：
由于`webpack.dev.conf.js`和`webpack.prod.conf.js`两个配置都是使用`webpack.base.conf.js`文件的配置作为基础配置，现在需将开发与生产环境分开，复制`webpack.base.conf.js`文件重命名为`webpack.examples.conf.js`，此文件作为测试项目examples文件夹运行的配置基础文件。
```javascript
// webpack.dev.conf.js修改
const baseWebpackConfig = require('./webpack.examples.conf')
```
webpack.base.conf.js入口配置，设置为packages/index.js这个文件中引入了所有的功能模块
```javascript
// webpack.base.conf.js
entry: {
  'index': './packages/index.js'
},
output: {
  path: path.resolve(process.cwd(), './lib'),
  publicPath: '/dist/',
  filename: 'ui-cc.common.js',
  chunkFilename: '[id].js',
  libraryTarget: 'commonjs2'
},
```
build/webpack.prod.conf.js
- 去除HtmlWebpackPlugin插件相关代码，因为只需要打包js文件和css文件，不涉及html；
- 去除`new webpack.optimize.CommonsChunkPlugin`相关代码，CommonsChunkPlugin是抽取公用模块，打包会多生成vendor.js和manifest.js；
- 之后配置文件再进行以下部分修改
```javascript
const baseWebpackConfig = require('./webpack.base.conf')
// ++ 整理入口，入口除了所有模块，另外分别引入各个模块
const components = require('../components.json')
const entrys = {}
Object.keys(components).forEach(item => {
  entrys[item] = components[item]
})

// 修改
const webpackConfig = merge(baseWebpackConfig, {
  entry: entrys,
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    library: 'ui-cc',
    libraryTarget: 'umd'
  },
  plugins: [
    // extract css into its own file
    new ExtractTextPlugin({
      // filename: utils.assetsPath('css/[name].[contenthash].css'),
      filename: '/theme-chalk/[name].css'
    }),
    ......
  ]
})
```

## <a id="3-测试"></a>3-测试

在node_modules文件夹内新建ui-cc文件夹，将打包的文件放入ui-cc中
examples/entry/test/test.js
```javascript
import UICC from 'ui-cc'
Vue.use(UICC)
```

## <a id="4-打包css和fonts"></a>4-打包css和fonts

主题css与fonts的打包使用了gulp，
官网：[https://www.gulpjs.com.cn/](https://www.gulpjs.com.cn/)
参考elementUI
首先下载相关依赖
```javascript
npm install gulp gulp-autoprefixer gulp-cssmin gulp-postcss gulp-sass --save-dev
npm install cp-cli --save-dev
```
仿造elementUI将样式文件theme-chalk文件夹放于packages

package.json 添加theme主题打包命令，打包后lib文件夹会有theme-chalk文件出现，内有对应的样式字体文件；
`npm run build:theme`单独打包样式字体文件，`npm run build`打包样式字体以及js文件
```javascript
"scripts": {
  "build:theme": "gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk",
  "build": "npm run build:theme && node build/build.js"
},
```

测试: examples/entry/test/test.js
```javascript
import UICC from 'ui-cc'
Vue.use(UICC)
import 'ui-cc/theme-chalk/index.css'
```

## <a id="5-按需加载"></a>5-按需加载

运用`babel-plugin-component`实现按需加载，在执行按需加载时已经配置了对应样式的加载，所以如果在.babelrc文件配置过styleLibraryName属性的，不需要在全局引入ui-cc的css样式了,以下加载的是配置引入ui-cc的lib/theme-chalk文件夹中的对应样式，`component`是插件的名字。

```javascript
npm install babel-plugin-component -D
npm install babel-preset-es2015 --save-dev
```
.babelrc
```javascript
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": [
    [
      "component",
      {
        "libraryName": "ui-cc",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
```
测试: examples/entry/test/test.js
```javascript
import { Button, Tag } from 'ui-cc'
Vue.use(Button)
Vue.component(Tag.name, Tag)
```

## <a id="6-UI框架Markdown格式组件说明文档"></a>6-UI框架Markdown格式组件说明文档

### <a id="61-下载依赖"></a>6.1 下载依赖
使用vue-markdown-loader
```javascript
markdown-it 渲染 markdown 基本语法
markdown-it-anchor 为各级标题添加锚点
markdown-it-container 用于创建自定义的块级容器
vue-markdown-loader 核心loader
transliteration 中文转拼音
cheerio 服务器版jQuery
highlight.js 代码块高亮实现

npm install markdown-it markdown-it-anchor markdown-it-container vue-markdown-loader transliteration cheerio highlight.js --save-dev
```

### <a id="62-配置"></a>6.2 配置
在build目录下建立strip-tags.js文件
```javascript
/*!
 * strip-tags <https://github.com/jonschlinkert/strip-tags>
 */

'use strict';

var cheerio = require('cheerio');  // 服务器版的jQuery

/**
 * 在生成组件效果展示时,解析出的VUE组件有些是带<script>和<style>的,我们需要先将其剔除,之后使用
 * @param  {[String]}       str   需要剔除的标签名 e.g'script'或['script','style']
 * @param  {[Array|String]} tags  e.g '<template></template><script></script>''
 * @return {[String]}             e.g '<html><head><template></template></head><body></body></html>'
 */
exports.strip = function(str, tags) {
  var $ = cheerio.load(str, {decodeEntities: false});

  if (!tags || tags.length === 0) {
    return str;
  }

  tags = !Array.isArray(tags) ? [tags] : tags;
  var len = tags.length;

  while (len--) {
    $(tags[len]).remove();
  }

  return $.html(); // cheerio 转换后会将代码放入<head>中
};

/**
 * 获取标签中的文本内容
 * @param  {[String]} str e.g '<html><body><h1>header</h1></body><script></script></html>'
 * @param  {[String]} tag e.g 'h1'
 * @return {[String]}     e.g 'header'
 */
exports.fetch = function(str, tag) {
  var $ = cheerio.load(str, {decodeEntities: false});
  if (!tag) return str;

  return $(tag).html();
};
```
webpack.examples.conf.js
```javascript
const md = require('markdown-it')();  // 引入markdown-it
const slugify = require('transliteration').slugify; // 引入transliteration中的slugify方法
const striptags = require('./strip-tags') // 引入strip-tags.js文件
/**
 * 由于cheerio在转换汉字时会出现转为Unicode的情况,所以我们编写convert方法来保证最终转码正确
 * @param  {[String]} str e.g  &#x6210;&#x529F;
 * @return {[String]}     e.g  成功
 */
function convert(str) {
  str = str.replace(/(&#x)(\w{4});/gi, function($0) {
    return String.fromCharCode(parseInt(encodeURIComponent($0).replace(/(%26%23x)(\w{4})(%3B)/g, '$2'), 16));
  });
  return str;
}
/**
 * 由于v-pre会导致在加载时直接按内容生成页面.但是我们想要的是直接展示组件效果,通过正则进行替换
 * hljs是highlight.js中的高亮样式类名
 * @param  {[type]} render e.g '<code v-pre class="test"></code>' | '<code></code>'
 * @return {[type]}        e.g '<code class="hljs test></code>'   | '<code class="hljs></code>'
 */
function wrap(render) {
  return function() {
    return render.apply(this, arguments)
      .replace('<code v-pre class="', '<code class="hljs ')
      .replace('<code>', '<code class="hljs">');
  };
}
const vueMarkdown = {
  // 定义处理规则
  preprocess: (MarkdownIt, source) => {
    // 对于markdown中的table,
    MarkdownIt.renderer.rules.table_open = function() {
      return '<table class="table">';
    };
    // 对于代码块去除v-pre,添加高亮样式
    MarkdownIt.renderer.rules.fence = wrap(MarkdownIt.renderer.rules.fence);
    return source;
  },
  use: [
    [require('markdown-it-anchor'), {
      level: 2, // 添加超链接锚点的最小标题级别, 如: #标题 不会添加锚点
      slugify: slugify, // 自定义slugify, 我们使用的是将中文转为汉语拼音,最终生成为标题id属性
      permalink: true, // 开启标题锚点功能
      permalinkBefore: true // 在标题前创建锚点
    }],
    // 'markdown-it-container'的作用是自定义代码块
    [require('markdown-it-container'), 'demo', {
      // 当我们写::: demo :::这样的语法时才会进入自定义渲染方法
      validate: function(params) {
        return params.trim().match(/^demo\s*(.*)$/);
      },
      // 自定义渲染方法,这里为核心代码
      render: function(tokens, idx) {
        var m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
        // nesting === 1表示标签开始
        if (tokens[idx].nesting === 1) {
          var description = (m && m.length > 1) ? m[1] : ''; // 获取正则捕获组中的描述内容,即::: demo xxx中的xxx
          var content = tokens[idx + 1].content; // 获得内容
          var html = convert(striptags.strip(content, ['script', 'style'])).replace(/(<[^>]*)=""(?=.*>)/g, '$1'); // 解析过滤解码生成html字符串
          var script = striptags.fetch(content, 'script'); // 获取script中的内容
          var style = striptags.fetch(content, 'style'); // 获取style中的内容
          var jsfiddle = { html: html, script: script, style: style }; // 组合成prop参数,准备传入组件
          // 是否有描述需要渲染
          var descriptionHTML = description 
            ? md.render(description)
            : '';

          jsfiddle = md.utils.escapeHtml(JSON.stringify(jsfiddle)); // 将jsfiddle对象转换为字符串,并将特殊字符转为转义序列
          // 起始标签,写入demo-block模板开头,并传入参数
          return `<demo-block class="demo-box" :jsfiddle="${jsfiddle}">
                    <div class="source" slot="source">${html}</div>
                    ${descriptionHTML}
                    <div class="highlight" slot="highlight">`;
        }
        // 否则闭合标签
        return '</div></demo-block>\n';
      }
    }],
    [require('markdown-it-container'), 'tip'],
    [require('markdown-it-container'), 'warning']
  ]
}
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        loader: 'vue-markdown-loader',
        options: vueMarkdown
      }
    ]
  }
}
```

### <a id="63-md格式组件使用"></a>6.3 md格式组件使用

- 举例单个使用：
```
1.  button.md
2.  ### 基础用法
3.  基础的按钮用法。
4.  :::demo 使用`type`、`plain`、`round`和`circle`属性来定义 Button 的样式。
5.  ```html
6.  <el-row>
7.    <el-button>默认按钮</el-button>
8.    <el-button type="primary">主要按钮</el-button>
9.    <el-button type="success">成功按钮</el-button>
10.   <el-button type="info">信息按钮</el-button>
11.   <el-button type="warning">警告按钮</el-button>
12.   <el-button type="danger">危险按钮</el-button>
13. </el-row>
14. ```
15. :::
```

```html
<!-- vue文件 -->
<template>
  <div class="markdown-body">
    <button></button>
  </div>
</template>

<script>
import button from './button.md'
export default {
  components: {
    button
  }
}
</script>
```
- 项目使用
1、构建全局组件demo-block.vue模板组件： index/components/demo-block.vue
```html
<div class="docs-demo-wrapper">
  <!-- source插槽，放置md格式文件解析出的html字符串，渲染组件的显示效果 -->
  <slot name="source"></slot>
  <div :style="{height: isExpand ? 'auto' : '0'}" class="demo-container">
    <div span="14">
      <div class="docs-demo docs-demo--expand">
        <div class="highlight-wrapper">
          <div class="description" v-if="$slots.default">
            <!-- 默认插槽，放置描述文字，例md文件中：:::demo 后面的描述文字 -->
            <slot></slot>
          </div>
          <!-- highlight插槽，放置md文件中的示例代码 -->
          <slot name="highlight"></slot>
        </div>
      </div>
    </div>
  </div>
  <span class="docs-trans docs-demo__triangle" @click="toggle">{{isExpand ? '隐藏代码' : '显示代码'}}</span>
</div>
```
2、注册demo-block组件作为全局组件： index/index.js
```javascript
import demoBlock from './components/demo-block.vue'
Vue.component('demo-block', demoBlock)
```

3、配置路由，构建左侧菜单：
entry/index/nav.config.json
```
{
  "开发指南": [
    {
      "path": "/",
      "redirect": "/installation"
    },
    {
      "desc": "安装",
      "path": "/installation",
      "name": "installation"
    },
    {
      "desc": "快速上手",
      "path": "/quickstart",
      "name": "quickstart"
    }
  ],
  "组件": [
    {
      "desc": "基础组件",
      "path": "/",
      "items": [
        {
          "desc": "Layout 布局",
          "path": "/layout",
          "name": "layout"
        },
        {
          "desc": "Color 色彩",
          "path": "/color",
          "name": "color"
        }
      ]
    }
  ]
  ......
}
```
examples/entry/index/router/index.js
```javascript
import Vue from 'vue'
import Router from 'vue-router'
import navConf from '../nav.config.json'

Vue.use(Router)

let routes = []

Object.keys(navConf).forEach((header) => {
  routes = routes.concat(navConf[header])
})

let addComponent = (router) => {
  router.forEach((route) => {
    if (route.items) {
      addComponent(route.items)
      routes = routes.concat(route.items)
    } else {
      if (route.type === 'pages') {
        route.component = r => require.ensure([], () =>
          r(require(`../components/${route.name}.vue`)))
        return
      }
      route.component = r => require.ensure([], () =>
        r(require(`../docs/${route.name}.md`)))
    }
  })
}
addComponent(routes)

export default new Router({
  routes: routes
})
```
index/index.js
```javascript
import router from './router'
new Vue({
  el: '#app',
  router,
  render: h => h(IndexView)
});
```
entry/components/side-nav.vue
```html
<template>
  <div class="side-nav">
    <div v-for="(title, index1) in Object.keys(data)" class="group-container" :key="index1">
      <p class="side-nav-title">{{title}}</p>
      <div class="side-nav-items" v-for="(nav, index2) in data[title]" :key="index2">
        <router-link :to="{name: nav.name}" v-if="nav.name" :class="$route.name===nav.name ? 'active' : ''">{{nav.desc}}</router-link>
        <p v-else class="side-nav-group">{{nav.desc}}</p>
        <div v-for="(item, index3) in nav.items" :key="index3">
          <router-link :to="{name: item.name}" :class="$route.name===item.name? 'active': ''" class="side-nav-component">{{item.desc}}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import navConf from '../nav.config.json'
  export default {
    data () {
      return {
        data: navConf
      }
    },
  }
</script>
```
- 项目运行

样式使用了scss，首先下载依赖：
```javascript
cnpm install node-sass sass-loader --save-dev
```
运行： npm run dev

![](readmeimg/1.png)




