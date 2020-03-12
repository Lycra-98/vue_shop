<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        show-index
        index-text=" "
        :expand-type="false"
        :selection-type="false"
        border
        :show-row-hover="false"
        class="treetable"
      >
        <!-- 是否有效这一列插槽模板 -->
        <template slot="isOk" slot-scope="slotProps">
          <i
            class="el-icon-success"
            v-if="slotProps.row.cat_deleted == false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序商品分类层级插槽模板 -->
        <template slot="level" slot-scope="slotProps">
          <el-tag size="mini" v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" v-else-if="slotProps.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>

        <!-- 操作插槽模板 -->
        <template slot="option" slot-scope="slotProps">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(slotProps.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(slotProps.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRule"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options表示数据来源 -->
          <!-- props级联选择器的属性配置对象 -->
          <el-cascader
            v-model="slectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="slecteKeysChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="editCateFormRule"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 总的商品分类数据条数
      total: 0,
      // 商品分类列表数组
      cateList: [],
      // 查询商品分类列表数据参数
      queryInfo: {
        // 需要查询所有的分类
        type: 3,
        // 当前查询的页数
        pagenum: 1,
        // 每页显示的数据条数
        pagesize: 5
      },
      // 树状表格对应的每一列的数据渲染
      columns: [
        {
          // 列名称
          label: '分类名称',
          // 列数据对应的键名
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 自定义模板
          type: 'template',
          // 具名插槽
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 添加分类的对话框显示隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 添加的分类名称
        cat_name: '',
        // 父级分类的id,一级分类父id为0
        cat_pid: 0,
        // 分类的级别
        cat_level: 0
      },
      // 添加分类的表单验证规则对象
      addCateFormRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 分级分类的列表
      parentCateList: [],
      // 级联选择器的属性配置对象
      cascaderProps: {
        // 表示鼠标经过就选中
        expandTrigger: 'hover',
        // 表示要选中的那个值,选中的为每一个分类的id
        value: 'cat_id',
        // 表示要显示在选择框的属性
        label: 'cat_name',
        // 表示父子嵌套的那个节点属性
        children: 'children',
        // 可选择任意一项
        checkStrictly: true
      },
      // 表示选中的分类id数组
      slectedKeys: [],
      // 编辑分类对话框显示和隐藏
      editCateDialogVisible: false,
      // 编辑分类查询到的分类信息
      editCateForm: {},
      // 编辑分类的验证规则对象
      editCateFormRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 调用获取商品分类列表数据的接口请求
    this.getCateList()
  },
  methods: {
    // 获取商品分类列数数据
    async getCateList() {
      // 调用接口发送请求
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      //   console.log(res.data)
      // 将数据总数赋值给total
      this.total = res.data.total
      // 将商品分类列表数据赋值给cateList
      this.cateList = res.data.result
      console.log(this.cateList)
    },
    // 监听pagesize发生变化
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getCateList()
    },
    // 监听pagenum发生变化
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCateList()
    },
    // 点击添加分类展示对话框
    showAddCateDialog() {
      // 先获取所有的一级和二级父级分类列表
      this.getParentCateList()
      // 再显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表函数,只需要获取到前两级
    async getParentCateList() {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      // 将获取的父级分类列表赋值给data私有数据中
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 表示当级联选择器选择项发生变化时触发
    slecteKeysChange() {
      console.log(this.slectedKeys)
      // 当选择项发生改变时,如果slectedKeys数组的长度大于零说明选择了父分类
      // 如果slectedKeys数组的长度等于0，说明没有选择父分类,则默认添加的分类是一级分类
      if (this.slectedKeys.length > 0) {
        // 添加的分类的父分类id为slectedKeys数组的最后一位
        this.addCateForm.cat_pid = this.slectedKeys[this.slectedKeys.length - 1]
        // 添加的分类的等级为slectedKeys数组的长度
        this.addCateForm.cat_level = this.slectedKeys.length
      } else {
        // 添加的分类的父分类id为0
        this.addCateForm.cat_pid = 0
        // 添加的分类的等级为0，一级分类
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类对话框确定
    addCate() {
      this.$refs.addCateFormRef.validate(async vaild => {
        if (!vaild) return
        // 发送添加分类请求
        const { data: res } = await this.$axios.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框关闭事件
    addCateDialogClosed() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      // 置空级联选择器的选择的id数组
      this.slectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击编辑分类按钮
    async showEditDialog(catId) {
      // 根据id发送查询分类请求
      const { data: res } = await this.$axios.get('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.editCateForm = res.data
      // 显示对话框
      this.editCateDialogVisible = true
    },
    // 重置编辑分类表单
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 点击编辑分类对话框的确定,发送修改请求
    editCate() {
      this.$refs.editCateFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$axios.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类信息失败')
        }
        this.$message.success('修改分类信息成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async removeCate(catId) {
      const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmRes !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // 发送删除分类的请求
      const { data: res } = await this.$axios.delete('categories/' + catId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
