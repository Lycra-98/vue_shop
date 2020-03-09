<template>
  <div class="login_container">
      <div class="login_box">
          <!-- 头像区域 -->
          <div class="touxiang">
              <img src="../assets/logo.png" alt="">
          </div>
          <!-- 登陆表单 -->
            <el-form ref="loginFormRef" class="login_form" :rules="loginFormRule" :model="loginForm">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btn">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLogin">重置</el-button>
                </el-form-item>
            </el-form>
      </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // form组件表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // form组件验证规则对象
      loginFormRule: {
        username: [
          { required: true, message: '请输入登陆用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLogin () {
      // 获取form组件的ref关联的实例对象
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 预验证
      this.$refs.loginFormRef.validate(async valid => {
        // 如果valid的值为true说明验证成功,发送登录请求
        if (!valid) return
        // 发送axios请求
        const { data: res } = await this.$axios.post('login', this.loginForm)
        // meta的status等于200才是登录成功,给出弹框提示
        if (res.meta.status !== 200) return this.$message({ message: '登录失败', type: 'error', center: true, showClose: true })
        this.$message({ message: '登录成功', type: 'success', center: true, showClose: true })
        // 叫服务器返回的token存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到home路由
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    border-radius: 3px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .touxiang {
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        box-shadow: 0 0 10px #ddd;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        padding: 0 20px;

        .btn {
        display: flex;
        justify-content: flex-end;
        }
    }
}
</style>
