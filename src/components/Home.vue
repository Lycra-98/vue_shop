<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt width="50px" />
        <span class="text">电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单区域 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 一级菜单字体图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单文本区域 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveActive('/' + subitem.path)"
            >
              <!-- 二级菜单字体图标 -->
              <i class="el-icon-menu"></i>
              <!-- 二级菜单文本区域 -->
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      // 一级菜单字体图标类
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 菜单折叠与展开
      isCollapse: false,
      // 菜单默认激活的index
      activePath: ''
    }
  },
  created() {
    // 获取左侧导航菜单数据,然后渲染左侧菜单项,在服务器端渲染的时候使用created获取数据
    this.getMenuList()
    // 取出保存的菜单激活状态
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 删除浏览器的sessionStroage
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左侧菜单导航数据
    async getMenuList() {
      const { data: res } = await this.$axios.get('menus')
      // 获取数据失败
      if (res.meta.status !== 200) return this.$meaasge.error(res.meta.msg)
      this.menulist = res.data
      console.log(res.data)
    },
    // 点击按钮控制侧边栏的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 来保存点击菜单项的激活状态
    saveActive(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  padding: 0;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    vertical-align: middle;
  }

  .text {
    font-size: 24px;
    color: #fff;
    margin-left: 10px;
  }
}
.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  text-align: center;
  left: 24px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
  font-size: 12px;
  line-height: 24px;
}
</style>
