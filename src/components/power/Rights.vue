<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片组件区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="slotProps">
            <el-tag v-if="slotProps.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的权限列表
      rightsList: []
    }
  },
  methods: {
    // 获取所有权限列表数据
    async getRightsList() {
      const { data: res } = await this.$axios.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表数据失败')
      this.rightsList = res.data
      console.log(res.data)
    }
  },
  created() {
    // 调用获取所有权限列表的数据
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>
</style>
