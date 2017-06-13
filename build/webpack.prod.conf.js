var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
/* webpack-merge
 *          作用？             合并多个webpack配置对象，返回合并后的新对象
 */
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
/* copy-webpack-plugin 
 *                作用？             用来将单独的文件/整个文件夹拷贝到build目录下，通常用于拷贝静态资源
 */
var CopyWebpackPlugin = require('copy-webpack-plugin')
/* html-webpack-plugin
 *                作用？             用于生成build目录下的index.html
 */
var HtmlWebpackPlugin = require('html-webpack-plugin')
/* extract-text-webpack-plugin
 *                        作用？     用于将css提取出来，放在单独的文件中
 */
var ExtractTextPlugin = require('extract-text-webpack-plugin')
/* optimize-css-assets-webpack-plugin
 *                               作用？    用于压缩css文件
 *                               如何实现css压缩?    能从css文件中推断出重复的css
 */
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

var env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    /* 设计模式
     *     如何用设计模式的方式实现多个css loader对象所组成的数组的定义？
     *                                       1.定义cssLoaders(options)方法，返回css loaders数组
     *                                       2.在cssLoaders中定义generateLoaders(loader, loaderOptions)，通过options, loader和loaderOptions参数去构造loader
     *                                       3.定义styleLoaders，cssLoaders返回的数组做格式化处理
     */
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  /* devtool 
   *    作用？ 
   *        用来配置source maps，source maps可以将打包后的代码定位到源文件中，方便查找错误
   */ 
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    /* DefinePlugin
     *        作用？
     *             用来定义全局变量
     *        什么情况下使用？
     *             1.当需要在项目中定义全局变量时； 2.当需要在项目中区分是生产环境还是开发环境时
     */
    new webpack.DefinePlugin({
      'process.env': env
    }),
    /* JSON.stringify
     *           作用？         
     *              压缩打包后的js文件
     */ 
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // split vendor js into its own file
    /* CommonsChunkPlugin
     *               作用？
     *                   @分析代码中存在的依赖，把重复的依赖提取出来放在单独的文件中
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

/* webpack-bundle-analyzer
 *                    作用？    对于打包后的文件生成一个可视化的页面来展示，用于分析
 *                    如何使用？    npm run build --report
 *                                然后访问localhost:8888
 */

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
