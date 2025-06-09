<script setup>
import { ref } from 'vue'
import { updateStudentInfo } from '@/api/api.js'; // 导入 API
import { ElMessage } from 'element-plus';

// 从 localStorage 获取数据，如果没有则使用默认值
const ruleForm = ref({
  name: localStorage.getItem('name') || '',
  id: localStorage.getItem('id') || '',
  major: localStorage.getItem('major') || '',
  classnum: localStorage.getItem('classnum') || '',
  phone: localStorage.getItem('phone') || '',
  email: localStorage.getItem('email') || '',
  password: localStorage.getItem('password') || '',
  confirmPassword: ''
})

const submitForm = () => {
  console.log('修改数据:', ruleForm.value);

  updateStudentInfo(ruleForm.value)
    .then((response) => {
      console.log('修改响应数据:', response.data);
      if (response.data.code === 0) {
        ElMessage({ type: 'success', message: '修改成功' });
        // 更新 localStorage 中的数据
        localStorage.setItem('name', ruleForm.value.name);
        localStorage.setItem('id', ruleForm.value.id);
        localStorage.setItem('major', ruleForm.value.major);
        localStorage.setItem('classnum', ruleForm.value.classnum);
        localStorage.setItem('phone', ruleForm.value.phone);
        localStorage.setItem('email', ruleForm.value.email);
        localStorage.setItem('password', ruleForm.value.password);
      } else {
        ElMessage({ type: 'error', message: '修改失败' });
      }
    })
    .catch((error) => {
      console.error('修改请求失败:', error);
      ElMessage({ type: 'error', message: '修改请求失败，请稍后再试' });
    });
};

const resetForm = () => {
  ruleForm.value = {
    name: localStorage.getItem('name') || '',
    id: localStorage.getItem('id') || '',
    major: localStorage.getItem('major') || '',
    classnum: localStorage.getItem('classnum') || '',
    phone: localStorage.getItem('phone') || '',
    email: localStorage.getItem('email') || '',
    password: localStorage.getItem('password') || '',
    confirmPassword: ''
  };
};
</script>

<template>
  <div>
    <el-container>
      <el-main>
        <el-card style="width: 500px">
          <div>
            <el-form :model="ruleForm" label-width="100px">
              <el-form-item label="姓名">
                <el-input v-model="ruleForm.name" placeholder="请输入姓名"></el-input>
              </el-form-item>

              <el-form-item label="学号">
                <el-input v-model="ruleForm.id" placeholder="请输入学号"></el-input>
              </el-form-item>

              <el-form-item label="专业">
                <el-input v-model="ruleForm.major" placeholder="请输入专业"></el-input>
              </el-form-item>

              <el-form-item label="班级">
                <el-input v-model="ruleForm.classnum" placeholder="请输入班级"></el-input>
              </el-form-item>

              <el-form-item label="手机号">
                <el-input v-model="ruleForm.phone" placeholder="请输入手机号"></el-input>
              </el-form-item>

              <el-form-item label="邮箱">
                <el-input v-model="ruleForm.email" placeholder="请输入邮箱"></el-input>
              </el-form-item>
              
              <el-form-item label="密码">
                <el-input
                  v-model="ruleForm.password"
                  placeholder="请输入密码"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="确认密码">
                <el-input
                  v-model="ruleForm.confirmPassword"
                  placeholder="请确认密码"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button class="custom-register-button" type="success" @click="submitForm">修改</el-button>
                <el-button type="primary" @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.register-module {
  max-width: 400px;
  height: 600px;
  margin: 0px auto;
}

::v-deep .custom-register-button {
  background-color: #006e7f !important; 
  border-color: #006e7f !important; 
}

::v-deep .custom-register-button:hover {
  background-color: #005a66 !important; 
  border-color: #005a66 !important; 
}
</style>