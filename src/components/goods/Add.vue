<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息框 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tabs标签页和表单域 -->
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-position="top">
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTagLeave"
          @tab-click="handleClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="slecteKeysChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTbaleData" :key="item.attr_id">
              <!-- 渲染复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- upload上传组件 action表示图片要上传的后台接口地址 list-type文件是什么样的形式显示-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="perviewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 默认激活的步骤条的索引
      activeIndex: '0',
      // 添加表单数据绑定对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类选中的id数组,提交时要转化为字符串
        goods_cat: [],
        // 存放图片临时上传路径的数组,对应上传的每张图片
        pics: [],
        // 商品描述
        goods_introduce: '',
        // 动态参数和静态参数数组
        attrs: []
      },
      // 添加表单验证规则对象
      addFormRule: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 商品分类列表的数组
      cateList: [],
      // 商品分类级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表
      manyTbaleData: [],
      // 静态属性表列表
      onlyTableData: [],
      // 图片上传的后台接口地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置upload的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的url地址
      previewPath: '',
      // 预览图片对话框的显示与隐藏
      perviewVisible: false
    }
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 当商品级联选择器选项发生变化时
    slecteKeysChange() {
      console.log(this.addForm.goods_cat)
      // 控制只能选中三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 当标签页切换之前触发该钩子函数
    beforeTagLeave(activeName, oldActiveName) {
      // 如果当前所处的activeName为第一页就是oldActiveName的值为'0'
      // 并且级联选择器选择的数组长度不等于3阻止切换
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 当点击tab栏的时候触发该事件处理函数
    async handleClick() {
      // console.log(this.activeIndex)
      // 如果选择了商品分类并且当前tab栏处于第二个获取动态参数列表
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          // 将参数列表的attr_vals字符串分割成数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTbaleData = res.data
        console.log(this.manyTbaleData)
      }
      // 如果点击了商品属性tab栏，获取静态属性列表
      if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性列表失败')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览的事件处理函数
    handlePreview(file) {
      console.log(file)
      // 获取到图片的真实路径赋值给data数据中保存
      this.previewPath = file.response.data.url
      // 显示图片预览对话框
      this.perviewVisible = true
    },
    // 处理一处图片的事件处理函数
    handleRemove(file) {
      console.log(file)
      // 拿到移除图片的信息,获取到该图片响应结果的tmp_path属性
      const filePath = file.response.data.tmp_path
      // 在添加表单数据对象存储图片数组中找到该值对应的索引
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 在数组中删除该索引对应的图片
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 处理图片上传成功之后的操作
    handleSuccess(response) {
      // 取出响应结果中的临时路径，添加到一个对象中
      // 将该对象追加到pics添加图片存放的数组中
      const picinfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picinfo)
      console.log(this.addForm)
    },
    // 点击添加商品按钮
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写完必要的商品信息')
        }
        // 发送添加商品请求
        // 我们要对addForm表单对象里的值做一些操作,但是不想引起原表单数据双向绑定的变化
        // 需要对addForm进行深拷贝,对深拷贝之后的对象进行操作,当作请求参数对象发送请求
        // lodash第三方插件 中cloneDeep()实现对象的深拷贝，返回深拷贝的新对象
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数,将动态参数中的每一项的attr_id和attr_vals的值
        // 拼接为一个对象添加到attrs数组中
        this.manyTbaleData.forEach(item => {
          // 转化为对象
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          // 追加到参数数组中
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          // 追加到参数数组中
          this.addForm.attrs.push(newInfo)
        })
        // 处理完之后赋值给form中的attrs属性
        form.attrs = this.addForm.attrs
        console.log(form)
        // 参数都处理好了之后,将form表单深拷贝对象作为请求体参数发送请求
        const { data: res } = await this.$axios.post('goods', form)
        if (res.meta.status !== 201) {
          console.log(res)
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        // 跳转会商品列表路由
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  created() {
    // 发送获取商品分类列表的请求
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 10px;
}
</style>
