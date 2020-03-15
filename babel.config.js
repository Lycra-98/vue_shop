// 在项目发布阶段需要用到的babel插件
const proPlugins = []
// 判断是生产环境编译模式还是开发环境编译模式
if (process.env.NODE_ENV === 'production') {
  // 生产环境就是发布阶段,发布阶段就将发布阶段需要用到的插件添加到该数组中
  proPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...proPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
