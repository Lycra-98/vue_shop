<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--2. 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1.导入echars图表绘制插件
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 合并的对象
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {},
  created() {},
  // 在页面dom元素加载完成之后渲染数据
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 获取报表数据
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取报表数据失败')
    }
    // 将响应的数据对象与options对象进行合并
    const result = _.merge(res.data, this.options)
    // 4.指定图表的配置项和数据

    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>
