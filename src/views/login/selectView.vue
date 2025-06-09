<template>
  <div class="login-box">
    <el-form ref="ruleFormRef" status-icon label-width="80px" class="demo-ruleForm">
      <img src="@/assets/logo.png" style="max-width: 200px; max-height: 200px;">
      <h2>医疗影像工作平台</h2>
      <h3>请选择登录身份</h3>

      <el-radio-group v-model="radio" style="margin-bottom: 20px; margin-top: 30px;" size="large">
        <el-radio :value="3">学生</el-radio>
        <el-radio :value="6">教师</el-radio>
        <el-radio :value="9">管理员</el-radio>
      </el-radio-group>

      <el-form-item>
        <el-button type="primary" class="login-btn" @click="login">登录</el-button>
        <el-button type="primary" class="login-btn" @click="register">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const radio = ref(3)
const login = () => {
  if (radio.value === 3) {
    router.push('/login')
  } else if (radio.value === 6) {
    router.push('/teacherLogin')
  } else if (radio.value === 9) {
    router.push('/adminLogin')
  } else {
    ElMessage.error('请选择登录身份')
  }
}
const register = () => {
  if (radio.value === 3) {
    router.push('/register')
  } else if (radio.value === 6) {
    router.push('/teacherRegister')
  } else {
    ElMessage.error('请选择注册身份')
  }
}
</script>

<style scoped>
.login-box {
  height: 760px;
  background: url('@/assets/bg.jpg') no-repeat center center;
  background-size: cover; 
  text-align: center; 
  padding: 1px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}
  .demo-ruleForm {
    width: 500px;
    margin: 200px auto;
    background: rgba(255, 255, 255, 0.8);
    padding: 40px;
    border-radius: 15px;
  }
  .login-btn {
    width: 39%;
    background-color: #006e7f;
    color: white;
    font-size: 16px;
    border: none;
    padding: 10px;
  }

::v-deep .el-radio__label {
  color: #000 !important; 
}
</style>
