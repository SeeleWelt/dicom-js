const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = defineConfig({
  transpileDependencies: true,
  // 指定静态资源目录
  //基本路径 文件打包后放的位置
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  assetsDir: 'static',
  //默认输出文件夹为dist，填入的名字为打包后的文件名
  
  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。资源放的目录
  configureWebpack:{
    experiments: {
      // 基于异步模块的 WebAssembly 实验性特性
      asyncWebAssembly: true,
    },
    // 如果需要对 .wasm 文件进行特殊处理，可以添加 module.rules 配置
    module: {
      rules: [
        {
          test: /\.wasm$/,
          type: "asset/resource", // 异步 WebAssembly 类型
          // 对于同步的 WebAssembly，使用 'webassembly/sync'
        },
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
      ],
    },
    resolve:{
      fallback:{
        "path": require.resolve("path-browserify"),
          'fs':false,
      },
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
})
