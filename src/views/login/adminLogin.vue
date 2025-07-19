<template>
  <div class="login-container">
    <div class="login-box">
      <h2>管理员登录</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin()" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上

// // 模拟管理员账号数据
// const mockAdminAccounts = [
//   {
//     username: 'admin',
//     password: 'admin123',
//     role: 'admin',
//     name: '普通管理员'
//   },
//   {
//     username: 'superadmin',
//     password: 'super123',
//     role: 'superAdmin',
//     name: '超级管理员'
//   }
// ];

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3到 20 个字符', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  const response = await axios.get('http://localhost:8000/get_csrf_token/');
  const csrfToken = response.data.token;
  axios
    .post('http://localhost:8000/admin/login/', loginForm.value,
      {
        headers:{
          'Content-Type':"application/json",
          "X-CSRFToken":csrfToken,
        }
      }
    )
    .then(function (response) {
      if (response.data !== null) {
        ElMessage({ type: 'success', message: '登录成功' })
        router.push('/adminHome')
      } else {
        ElMessage({ type: 'error', message: '登录失败' })
      }
    })
    .catch(function (error) {
      console.error('请求出错：', error)
    })
}

// 登录处理函数
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    
    await submitForm()
    
    // 存储登录信息
    // localStorage.setItem('token', response.data.token);
    // localStorage.setItem('role', response.data.role);
    // localStorage.setItem('username', response.data.username);
    // localStorage.setItem('adminName', response.data.name);
    
    // ElMessage.success(response.message);
    
    // // 根据角色跳转到不同页面
    // if (response.data.role === 'superAdmin') {
    //   router.push('/superAdminHome');
    // } else {
    //   router.push('/adminHome');
    // }
  } catch (error) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  margin-top: 20px;
}

.el-button {
  width: 100%;
}
</style>
