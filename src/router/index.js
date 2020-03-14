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
// 导入权限列表组件
import Rights from '../components/power/Rights.vue'
// 导入角色列表组件
import Roles from '../components/power/Roles.vue'
// 导入商品分类组件
import Cate from '../components/goods/Cate.vue'
// 导入商品参数组件
import Params from '../components/goods/Params.vue'
// 导入商品列表组件
import List from '../components/goods/List.vue'
// 导入添加商品组件
import Add from '../components/goods/Add.vue'
// 导入订单列表组件
import Order from '../components/order/Order.vue'

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
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order }
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
