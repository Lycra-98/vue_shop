import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入登录组件
import Login from '../components/Login.vue'
// 导入Home组件
import Home from '../components/Home.vue'
// 导入Welcome组件
import Welcome from '../components/Welcome.vue'
// 导入用户列表组件
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users }
    ]
  }
]
const router = new VueRouter({
  routes
})

// 挂载路由导航守卫,控制页面访问权限
router.beforeEach((to, from, next) => {
  // to 要访问的地址
  // from 从哪里跳转的地址
  // next() 直接放行 next('/login)强制跳回login路由
  if (to.path === '/login') return next()
  // 获取客户端token判断是否登录
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有token强制跳回login页
  if (!tokenStr) return next('/login')
  next()
})

export default router
