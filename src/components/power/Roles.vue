<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片组件区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialoge">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="slotProps">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter' ]"
              v-for="(item1, i1) in slotProps.row.children"
              :key="item1.id"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="deleteRightById(slotProps.row, item1.id)"
                >{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRightById(slotProps.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRightById(slotProps.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="slotProps">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRoleDialog(slotProps.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoleById(slotProps.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="setRightsDialog(slotProps.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogClose" width="50%" @close="addRoleClose">
      <el-form ref="addFormRef" :rules="addFormRule" :model="addForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClose = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色信息对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogClose" width="50%" @close="editRoleClose">
      <el-form ref="editFormRef" :rules="editFormRule" :model="editForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClose = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="setRightsTree"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="fnepeiRtihts">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleList: [],
      // 添加角色对话框的显示隐藏
      addDialogClose: false,
      // 添加角色表单数据对象
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证对象
      addFormRule: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框关闭和隐藏
      editDialogClose: false,
      // 编辑角色根据用户id查询到的角色数据对象
      editForm: {},
      // 编辑角色用户规则对象
      editFormRule: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 分配权限对话框的显示和隐藏
      setRightsDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 表示默认选中的权限id的数组
      defaultKeys: [],
      // 角色id
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表的方法
    async getRoleList() {
      const { data: res } = await this.$axios.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      console.log(res.data)
    },
    // 点击添加角色按钮显示对话框
    addRoleDialoge() {
      this.addDialogClose = true
    },
    // 添加角色对话框关闭重置表单
    addRoleClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定预验证
    addRole() {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        // 发送添加角色请求
        const { data: res } = await this.$axios.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 给出添加角色成功信息
        this.$message.success('添加角色成功')
        // 重新获取角色列表
        this.getRoleList()
        // 关闭对话框
        this.addDialogClose = false
      })
    },
    // 点击操作的编辑角色
    async editRoleDialog(id) {
      this.editDialogClose = true
      // 获取角色信息
      const { data: res } = await this.$axios.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败')
      this.editForm = res.data
    },
    // 编辑角色对话框关闭触发重置
    editRoleClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑角色对话框点击确定预验证
    editRoleInfo() {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        // 发送修改请求
        const { data: res } = await this.$axios.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        // 给出修改角色成功信息
        this.$message.success('修改角色信息成功')
        // 重新获取角色列表
        this.getRoleList()
        // 关闭对话框
        this.editDialogClose = false
      })
    },
    // 删除角色信息
    async deleteRoleById(id) {
      // 点击删除弹出操作提示框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果confirmResult为cencel说明点了取消
      // 如果confirmResult为confirm说明点了确定
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除角色')
      }
      // 发送删除角色请求
      const { data: res } = await this.$axios.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      // 重新获取角色列表数据
      this.getRoleList()
    },
    // 点击每一角色下的权限删除按钮触发
    async deleteRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色下的权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        // 说明点了取消删除
        return this.$message.info('已取消删除角色权限')
      }
      // 调用删除权限接口请求
      const { data: res } = await this.$axios.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户权限失败')
      }
      this.$message.success('删除用户权限成功')
      // 此时不能重新刷新角色列表，一刷新了角色列表整个页面就会重新渲染,那么就会关闭展开列
      // 将返回的最新的用户的权限信息赋值给角色的children属性即可
      role.children = res.data
    },
    // 点击分配权限按钮
    async setRightsDialog(role) {
      // 保存角色id
      this.roleId = role.id
      // 发送请求获取所有的权限列表,树形结构的
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 获取权限列表成功
      this.rightsList = res.data
      console.log(this.rightsList)
      // 调用获取三级权限id的递归函数
      this.getTherrNodeID(role, this.defaultKeys)

      // 显示对话框
      this.setRightsDialogVisible = true
    },
    // 使用递归获取所有角色下的三级权限的id,添加到一个新数组中
    // 这是新数组最后要赋值给树形控件default-checked-keys属性绑定的数组中
    getTherrNodeID(node, arr) {
      // 递归结束条件,没有该节点下children属性
      if (!node.children) {
        // 没有children属性就是三级权限,将id添加到arr数组中
        return arr.push(node.id)
      }
      // 遍历每一个节点数组,调用该递归函数
      node.children.forEach(item => this.getTherrNodeID(item, arr))
    },
    // 监听分配权限对话框框关闭,重置defaultKeys数组
    setRightsDialogClosed() {
      this.defaultKeys = []
    },
    // 点击确定分配发送分配权限请求
    async fnepeiRtihts() {
      // 所有被选中的权限的id组成的数组
      const idArr = [
        ...this.$refs.setRightsTree.getCheckedKeys(),
        ...this.$refs.setRightsTree.getHalfCheckedKeys()
      ]

      // 将选中的id数组转化为字符串,作为请求的参数
      const idStr = idArr.join(',')
      const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      // 重新获取角色列表
      this.getRoleList()
      // 关闭对话框
      this.setRightsDialogVisible = false
    }
  },
  created() {
    // 调用接口获取角色列表数据
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
// 一级权限的上层边框线
.bdtop {
  border-top: 1px solid #eee;
}
// 一级权限的下层边框线
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 垂直居中样式
.vcenter {
  display: flex;
  align-items: center;
}
</style>
