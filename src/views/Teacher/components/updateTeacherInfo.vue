<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus';
import { updateTeacherInfo } from '@/api/api.js'; // 导入 API

const ruleForm = ref({
  teacherID: localStorage.getItem('teacherID'),
  teacherName: localStorage.getItem('teacherName'),
  phoneNumber: localStorage.getItem('phoneNumber'),
  email: localStorage.getItem('email'),
  password: '',
  confirmPassword: ''
})

const submitForm = () => {
  console.log('修改数据:', ruleForm.value);

  updateTeacherInfo(ruleForm.value)
    .then((response) => {
      console.log('修改响应数据:', response.data);
      if (response.data.code === 0) {
        ElMessage({ type: 'success', message: '修改成功' });
        // 更新 localStorage 中的数据
        localStorage.setItem('teacherName', ruleForm.value.teacherName);
        localStorage.setItem('phoneNumber', ruleForm.value.phoneNumber);
        localStorage.setItem('email', ruleForm.value.email);
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
    teacherName: localStorage.getItem('teacherName') || '',
    phoneNumber: localStorage.getItem('phoneNumber') || '',
    email: localStorage.getItem('email') || '',
    password: '',
    confirmPassword: ''
  };
};

const goBack = () => {
  // 返回上一页或执行其他操作
  history.back();
};
</script>

<template>
  <div>
    <el-container>
      <el-main>
        <el-card style="width: 500px">
          <div>
            <el-form :model="ruleForm" :rules="rules" label-width="100px">
              <el-form-item label="姓名" prop="teacherName">
                <el-input v-model="ruleForm.teacherName" placeholder="请输入姓名"></el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phoneNumber">
                <el-input v-model="ruleForm.phoneNumber" placeholder="请输入手机号"></el-input>
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="ruleForm.email" placeholder="请输入邮箱"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="ruleForm.password"
                  placeholder="请输入密码"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="ruleForm.confirmPassword"
                  placeholder="请确认密码"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button class="custom-register-button" type="success" @click="submitForm">提交</el-button>
                <el-button type="primary" @click="resetForm">重置</el-button>
                <el-button @click="goBack">返回</el-button>
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

/* 鼠标悬停时的样式 */
::v-deep .custom-register-button:hover {
  background-color: #005a66 !important; 
  border-color: #005a66 !important; 
}
</style>
