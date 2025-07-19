<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus';
import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上

const ruleForm = ref({
  id: localStorage.getItem('id'),
  name: localStorage.getItem('name'),
  phone: localStorage.getItem('phone'),
  email: localStorage.getItem('email'),
  password: '',
  confirmPassword: ''
})

onMounted(()=>{
  ruleForm.value = {
    id: localStorage.getItem('id') || '',
    name: localStorage.getItem('name') || '',
    phone: localStorage.getItem('phone')|| '',
    email: localStorage.getItem('email'),
    password: '',
    confirmPassword: ''
  }
})
const updateTeacherInfo = async (requestData)=>{
  const response = await axios.get('http://localhost:8000/get_csrf_token/');
    const csrfToken = response.data.token;
    axios
      .post('http://localhost:8000/teacher/update/', requestData,
        {
          headers:{
            'Content-Type':"application/json",
            "X-CSRFToken":csrfToken,
          }
        }
      ).then(response=>{
        const data = response.data
        if (data.state==="success")
        {
          // 更新 localStorage 中的数据
          localStorage.setItem('name', data.name);
          localStorage.setItem('phone', data.phone);
          localStorage.setItem('email', data.email);
        }
        ElMessage({ type: data.state, message: data.msg });
      }).catch((error) => {
        console.error('修改请求失败:', error);
        ElMessage({ type: 'error', message: '修改请求失败，请稍后再试' });
      });
}
const submitForm = async () => {
  console.log('修改数据:', ruleForm.value);

  await updateTeacherInfo(ruleForm.value)

};

const resetForm = () => {
  ruleForm.value = {
    teacherName: localStorage.getItem('name') || '',
    phoneNumber: localStorage.getItem('phone') || '',
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
              <el-form-item label="姓名" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入姓名"></el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="ruleForm.phone" placeholder="请输入手机号"></el-input>
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
