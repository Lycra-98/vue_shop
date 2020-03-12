import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标样式
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 引入树状表格第三方组件
import ZkTable from 'vue-table-with-tree-grid'

// 配置为全局组件
Vue.component('tree-table', ZkTable)

// 配置axios请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置axios请求拦截,请求头携带token
axios.interceptors.request.use(config => {
  // 设置请求头
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 将axios方法挂载在vue构造函数的原型对象中,那么所有组件实例都可以使用this访问到
Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
