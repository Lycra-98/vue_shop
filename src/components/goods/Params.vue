<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告框区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择分类的级联选择器 -->
          <el-cascader
            v-model="slectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="slecteKeysChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab切换栏区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="slotProps">
                <!-- 动态循环tag标签 -->
                <el-tag
                  closable
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  @close="removeAttrValue(index, slotProps.row)"
                >{{item}}</el-tag>
                <!-- 添加输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(slotProps.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="slotProps">
                <!-- 动态循环tag标签 -->
                <el-tag
                  closable
                  v-for="(item, index) in slotProps.row.attr_vals"
                  :key="index"
                  @close="removeAttrValue(index, slotProps.row)"
                >{{item}}</el-tag>
                <!-- 添加输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(slotProps.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + addText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRuleRef" label-width="100px">
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + addText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRule" ref="editFormRuleRef" label-width="100px">
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器双向绑定选中的id数组
      slectedKeys: [],
      // tab页签默认选中的页签name属性
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据绑定对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则
      addFormRule: {
        attr_name: [
          { required: true, message: '请输入参数或者属性', trigger: 'blur' }
        ]
      },
      // 修改参数的对话框
      editDialogVisible: false,
      // 修改参数的数据对象信息
      editForm: {},
      editFormRule: {
        attr_name: [
          { required: true, message: '请输入参数或者属性', trigger: 'blur' }
        ]
      },
      // 控制展开列中文本框的显示和隐藏
      inputVisible: false,
      // 展示文本框输入的值
      inputValue: ''
    }
  },
  methods: {
    // 获取所有商品分类列表数据
    async getCatelist() {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 当级联选择器的选项发生变化时触发
    slecteKeysChange() {
      this.getParamsData()
    },
    // 点击tab页签触发该函数
    handleClick() {
      this.getParamsData()
    },
    // 获取对应的参数数据的函数
    async getParamsData() {
      if (this.slectedKeys.length !== 3) {
        this.slectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.slectedKeys)
      // 根据级联选择器选择的三级分类id 和 所选的tab标签页，来获取对应的参数列表
      const { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取分类参数失败')
      }
      // console.log(res.data)
      // 将每一项的attr_vals的字符串一空格进行分割成一个数组
      // 如果是空字符串直接返回一个空数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示和隐藏
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        // 说明获取的是动态参数数据
        this.manyTableData = res.data
      } else {
        // 获取的是静态属性数据
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRuleRef.resetFields()
    },
    // 点击添加对话框确定按钮
    addParams() {
      this.$refs.addFormRuleRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击编辑按钮展示修改对话框
    async showEditDialog(editParams) {
      // 根据id查询要修改的参数
      const { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes/${editParams.attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('根据id查询参数信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 编辑对话框关闭重置表单
    editDialogClosed() {
      this.$refs.editFormRuleRef.resetFields()
    },
    // 点击编辑对话框
    editParams() {
      this.$refs.editFormRuleRef.validate(async vaild => {
        if (!vaild) return
        const {
          data: res
        } = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击删除按钮,发送删除参数请求
    async removeParams(arrtId) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除参数')
      }
      // 点击了确定发送删除请求
      const { data: res } = await this.$axios.delete(
        `categories/${this.cateId}/attributes/${arrtId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 在展示文本框失去焦点和按下回车触发该事件函数
    async handleInputConfirm(row) {
      // 如果文本框中没有输入值,将值清空隐藏文本框
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 文本框中输入了值,将文本框的值添加到attr_vals数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      // 隐藏文本框
      row.inputVisible = false
      // 发送修改参数的请求
      this.saveAttrVals(row)
    },
    // 发送请求保存每一个分类参数下的attr_vals里的值
    async saveAttrVals(row) {
      // 发送修改参数的请求
      const { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击展开中添加新标签按钮 显示文本框
    showInput(row) {
      // 显示文本框
      row.inputVisible = true
      // 自动获取焦点,$nextTick方法当页面中的元素重新被渲染的时候,执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    removeAttrValue(index, row) {
      // 删除attr_vals里的值
      row.attr_vals.splice(index, 1)
      // 发送修改参数请求
      this.saveAttrVals(row)
    }
  },
  created() {
    // 发送接口请求
    this.getCatelist()
  },
  computed: {
    // 控制添加参数和添加属性按钮的禁用
    isBtnDisabled() {
      // 如果级联选择器选择的id数组长度不为3则返回true表示禁用,否则就是false
      if (this.slectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 动态计算添加对话框的文本值
    addText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    // 计算选择的三级分类的id
    cateId() {
      if (this.slectedKeys.length === 3) {
        return this.slectedKeys[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
