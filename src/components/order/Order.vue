<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 输入款搜索 -->
      <el-row>
        <el-col :span="8">
          <!-- 搜索输入框区域 -->
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表表格数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="slotProps">
            <el-tag v-if="slotProps.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="slotProps">{{slotProps.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-tooltip effect="dark" :enterable="false" content="修改订单地址" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            </el-tooltip>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showPrograssBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
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

    <!-- 修改订单地址对话框 -->
    <el-dialog
      @close="addressDialogClosed"
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRule"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="prograssDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in prograssList"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 查询订单参数
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示数据
        pagesize: 10
      },
      // 订单列表数据
      orderList: [],
      total: 0,
      // 修改订单地址的显示和隐藏
      addressDialogVisible: false,
      // 修改地址表单
      addressForm: {
        // 级联选择器数组
        address1: [],
        address2: ''
      },
      addressFormRule: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区联动数据
      cityData,
      // 物流进度对话框显示和隐藏
      prograssDialogVisible: false,
      // 订单物流数据
      prograssList: []
    }
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      console.log(res.data)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 当页面数据条数发生变化
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrderList()
    },
    // 当当前页码发生变化
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrderList()
    },
    showBox() {
      this.addressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showPrograssBox() {
      // 获取物流进度数据
      const { data: res } = await this.$axios.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单物流信息失败')
      }
      this.prograssList = res.data
      console.log(this.prograssList)
      this.prograssDialogVisible = true
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
@import url(../../plugins/timeline/timeline.css);
@import url(../../plugins/timeline-item/timeline-item.css);
.el-cascader {
  width: 100%;
}
</style>
