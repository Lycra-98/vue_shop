<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 输入款搜索和添加用户 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索输入框区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表table表格 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChanged(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(slotProps.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(slotProps.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框脚部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRule" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义添加用户邮箱校验规则
    var checkEmail = (rule, value, callback) => {
      // 邮箱正则
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 验证邮箱合法
        return callback()
      }
      // 不合法提示错误信息
      callback(new Error('请输入正确的邮箱格式'))
    }

    // 自定义添加用户手机号校验规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        // 验证手机号合法
        return callback()
      }
      // 不合法提示错误信息
      callback(new Error('请输入正确的手机号格式'))
    }
    return {
      // 用户列表请求参数
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 2
      },
      // 用户总数
      total: 0,
      // 用户列表数据
      userList: [],
      // 控制对话框的显示和隐藏
      dialogVisible: false,
      // 添加用户表单绑定数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addFormRule: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框显示和隐藏
      editDialogVisible: false,
      // 存储根据id查询到用户信息
      editForm: {},
      // 修改用户信息的验证规则对象
      editFormRule: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取管理员列表失败')
      }
      this.total = res.data.total
      this.userList = res.data.users
      console.log(res)
    },
    // 当每页显示多少条数据发生变化时,就是当点击sizes布局中的数据时
    handleSizeChange(newPagesize) {
      // 将请求参数中pagesize修改为最新变化后的值
      this.queryInfo.pagesize = newPagesize
      // 重新发送请求查询数据
      this.getUserList()
    },
    // 当前页数发生变化时触发
    handleCurrentChange(newPagenum) {
      // 将请求参数中的当前页数修改为最新变化后的值
      this.queryInfo.pagenum = newPagenum
      // 重新发送请求查询数据
      this.getUserList()
    },
    // 当页面switch状态发生变化时触发该事件
    async userStateChanged(userInfo) {
      // 将最新状态发送请求修改数据库中的用户状态
      const { data: res } = await this.$axios.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 页面中的switch不能发生变化
        userInfo.mg_state = !userInfo.mg_state
        return this.message.error('用户状态修改失败')
      }
      this.$message.success('用户状态修改成功')
    },
    // 监听对话框关闭时触发
    addDialogClosed() {
      // 重置添加表单信息
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定添加用户
    addUser() {
      // 预验证
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        // 发送添加用户请求,将绑定表单数据对象作为请求参数
        const { data: res } = await this.$axios.post('/users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 重新获取用户列表数据
        this.getUserList()
        // 关闭对话框
        this.dialogVisible = false
      })
    },
    // 点击操作中修改按钮显示对话框
    async showEditDialog(id) {
      // 根据用户id查询用户信息
      const { data: res } = await this.$axios.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户表单重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定预验证发送修改请求
    editUserInfo() {
      this.$refs.editFormRef.validate(async vaild => {
        // console.log(vaild)
        if (!vaild) return
        // 发送修改请求
        const { data: res } = await this.$axios.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 修改用户成功
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 重新获取用户数据
        this.getUserList()
      })
    },
    // 点击操作中用户删除按钮
    async removeUserById(id) {
      // 点击删除弹出操作提示框
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // $confirm方法返回的时promise对象
      // 如果点击弹框中的确定返回值是字符串confirm
      // 如果点击弹框中的确定返回值是字符串cancel
      if (confirmResult !== 'confirm') {
        // 如果弹框的返回值不是confirm 那么就点击了取消给出取消删除提示
        return this.$message.info('已取消删除用户')
      }
      // 点击了弹框中的确定按钮,发送删除请求
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      // 重新获取用户列表数据
      this.getUserList()
    }
  },
  created() {
    // 请求接口数据
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>
