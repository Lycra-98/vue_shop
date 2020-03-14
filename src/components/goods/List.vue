<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 输入款搜索和添加商品 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索输入框区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表表格区域 -->
      <el-table :data="goodList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="slotProps">{{slotProps.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoods(slotProps.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 商品列表分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取所有的商品列表
      goodList: [],
      // 获取商品列表的查询参数
      queryInfo: {
        // 搜索框的参数关键字
        query: '',
        // 当前查询的页数
        pagenum: 1,
        // 每页显示的数据条数
        pagesize: 10
      },
      // 查询的总商品数
      total: 0
    }
  },
  methods: {
    // 发送获取商品列表的请求
    async getGoodList() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.$message.success('获取商品列表成功')
      this.goodList = res.data.goods
      this.total = res.data.total
      console.log(res.data)
    },
    // 当分页的一页显示多少条数据发生变化时
    handleSizeChange(newPageSzie) {
      this.queryInfo.pagesize = newPageSzie
      this.getGoodList()
    },
    // 当前页数放生变化时
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodList()
    },
    // 点击删除按钮删除该商品
    async removeGoods(goodId) {
      const comfirmRes = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (comfirmRes !== 'confirm') {
        console.log(comfirmRes)
        // 说明点击了取消
        return this.$message.info('已取消删除该商品')
      }
      // 发送删除请求
      const { data: res } = await this.$axios.delete('goods/' + goodId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodList()
    },
    // 点击添加商品跳转到添加商品路由
    goAddGoods() {
      this.$router.push('/goods/add')
    }
  },
  // 页面渲染的时候发送请求
  created() {
    this.getGoodList()
  }
}
</script>

<style lang="less" scoped>
</style>
