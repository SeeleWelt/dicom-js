<script setup>
import { ref } from 'vue'
// import axios from '@/utils/axios-config.js'
import { updateTeacherInfo } from '@/api/api.js'; // 导入API
import { ElMessage } from 'element-plus'
const ruleForm = ref({
  teacherName: '',
  teacherID: '',
  password: '',
  confirmPassword: ''
})

const submitForm = async () => {
  try {
    console.log(ruleForm.value);
    const response = await updateTeacherInfo(ruleForm.value);
    console.log('响应数据：', response.data);
    if (response.data.success) {
      ElMessage({ type: 'success', message: '更新成功' });
      // 这里可以添加重置表单或者跳转页面的逻辑
    } else {
      ElMessage({ type: 'error', message: response.data.message || '更新失败' });
    }
  } catch (error) {
    console.error('更新教师信息出错：', error);
    ElMessage({ type: 'error', message: '更新失败，请稍后再试' });
  }
};

const resetForm = () => {
  ruleForm.value = {
    teacherName: '',
    teacherID: '',
    password: '',
    checkPass: ''
  };
};

const goBack = () => {
  // 返回上一页或执行其他操作
}
</script>

<template>
  <h1>教师密码修改</h1>
  <div>
    <el-container>
      <el-main>
        <el-card style="width: 500px">
          <div>
            <el-form :model="ruleForm" :rules="rules" label-width="100px">
              <el-form-item label="姓名" prop="teacherName">
                <el-input v-model="ruleForm.teacherName" placeholder="请输入姓名"></el-input>
              </el-form-item>

              <el-form-item label="教师工号" prop="teacherID">
                <el-input v-model="ruleForm.teacherID" placeholder="请输入教师号"></el-input>
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
                <el-button type="success" class="custom-submit-button" @click="submitForm">提交</el-button>
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
::v-deep .custom-submit-button {
  background-color: #006e7f !important; 
  border-color: #006e7f !important; 
}

/* 鼠标悬停时的样式 */
::v-deep .custom-submit-button:hover {
  background-color: #005a66 !important; 
  border-color: #005a66 !important; 
}
</style>
