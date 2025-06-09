<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage, } from 'element-plus';

axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上
const ruleFormRef = ref(null)
const ruleForm = ref({
  id: '123',
  name: '小明',
  className: '1',
  phone: '13546845499',
  email: '1910230934@qq.com',
  password: 'jtm19980808',
  confirmPassword: 'jtm19980808',
  code: ''
});

// 添加验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  id: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^\d{11}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: ['blur','change'] },
    {
      validator: (rule, value, callback) => {
        // 定义不允许的特殊字符
        const forbiddenChars = /[`@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~\s]/;
        if (forbiddenChars.test(value)) {
          callback(new Error('密码中不能包含特殊字符(包含空格)'));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === ruleForm.value.password) {
          callback();
        } else {
          callback(new Error('两次输入的密码不一致'));
        }
      },
      trigger: 'blur'
    }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

// 定义一个变量来控制发送验证码按钮的可用状态
const isSendingCode = ref(false);
// 定义一个变量来记录倒计时的秒数
const countdownSeconds = ref(5);

const passwordStrengthMessage = ref('');

const checkPasswordStrength = () => {
  const password = ruleForm.value.password;
  let strength = 0;

  if (/^[a-zA-Z]+$/.test(password) || /^\d+$/.test(password)) {
    strength = 1; // 仅包含数字或者字符：弱
  }
  else if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /!/.test(password))
  {
    strength = 3; // 包含数字以及大小写字母和特殊字符
  }else if(password === "")
  {
    strength=0;
  }
  else{
    strength = 2; // 包含数字以及大小写字符
  }

  switch (strength) {
    case 1:
      passwordStrengthMessage.value = '密码强度：弱（仅包含数字或字符）';
      break;
    case 2:
      passwordStrengthMessage.value = '密码强度：中 包含数字以及字母或者"!"';
      break;
    case 3:
      passwordStrengthMessage.value = '密码强度：强（包含数字以及大小写字母和!)';
      break; 
    default:
      passwordStrengthMessage.value = '';
      break;
  }
};

const sendVerificationCodeValid = async (formEl)=>{
  await formEl.validateField('email',(isValid)=>{
    if(!isValid)
    {
      ElMessage.error("email格式错误！");
      formEl.scrollToField('email')
    }else{
      sendVerificationCode()
    }
  })
}

const sendVerificationCode = async () => {
 
  // 设置按钮为不可用状态
  isSendingCode.value = true;
  // 重置倒计时秒数
  countdownSeconds.value = 5;

  const encodedEmail = encodeURIComponent(ruleForm.value.email);
  console.log(encodedEmail);

  try {
    const response = await axios.get('http://localhost:8000/get_csrf_token/');
    const csrfToken = response.data.token;
    const data = { 'email': encodedEmail };

    await axios.post('http://localhost:8000/student/registerCode', data, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      }
    });

    ElMessage({ type: 'success', message: '验证码已发送，请注意查收' });
  } catch (error) {
    console.error(error);
    ElMessage({ type: 'error', message: '验证码发送失败' });
  }

  // 开始倒计时
  const countdownInterval = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value -= 1;
    } else {
      // 倒计时结束，恢复按钮可用状态
      isSendingCode.value = false;
      clearInterval(countdownInterval);
    }
  }, 1000);
};

const doRegister = async (formEl) => {
  console.log(ruleForm.value);
  await formEl.validate(async (isValid,inValidFields)=>{
    console.log(isValid,inValidFields)
    if(!isValid){
      formEl.scrollToField(Object.keys(inValidFields)[0])
    }else{
      const response = await axios.get('http://localhost:8000/get_csrf_token/');
      const csrfToken = response.data.token;
      axios.post('http://localhost:8000/student/register', ruleForm.value, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        }
      })
      .then((response) => {
        const data = response.data
        ElMessage({message:data.message,type:data.state})
        if(data.state==="success")
          this.$router.push("/login")
      })
      .catch((error) => {
        console.error(error);
      });
    }
  })
  
};

const emailSuffixes = ref([ // 常见邮箱后缀列表
  '@gmail.com',
  '@qq.com',
  '@outlook.com',
  '@hotmail.com',
  '@163.com',
  '@yahoo.com'
])
const querySearch = (queryString,cb)=>{
  if (queryString.includes('@')) {
        // 如果已经包含 '@'，则不提供额外的后缀提示
    cb([]);
  } else {
    // 生成包含常见后缀的提示列表
    const suggestions = emailSuffixes.value.map(suffix => ({
      value: queryString + suffix
    }));
    cb(suggestions);
  }
}
</script>

<template>
  <div class="register-container">
    <el-container>
      <el-header style="height: 50px">
        <div style="text-align: center; font-size: 40px; font-weight: bolder">学生信息管理系统</div>
      </el-header>

      <el-main>
        <el-card class="register-module">
          <template v-slot:header>
            <div class="clearfix">
              <span style="text-align: center; font-size: 20px; font-family: 'Microsoft YaHei'">
                <p>学生注册</p>
              </span>
            </div>
          </template>

          <div>
            <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入姓名"></el-input>
              </el-form-item>

              <el-form-item label="学号" prop="id">
                <el-input v-model="ruleForm.id" placeholder="请输入学号"></el-input>
              </el-form-item>
              <el-form-item label="班级" prop="className">
                <el-input v-model="ruleForm.className" placeholder="请输入班级"></el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="ruleForm.phone" placeholder="请输入手机号"></el-input>
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-autocomplete
                  v-model="ruleForm.email"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入邮箱"
                  @select="handleSelect"
                  :clearable='true'
                ></el-autocomplete>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="ruleForm.password"
                  placeholder="请输入密码"
                  show-password
                  @input="checkPasswordStrength"
                ></el-input>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="至少8位，可以包含数字，大小写字符，以及英文输入法下的“!”"
                  placement="top"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
                <div v-if="passwordStrengthMessage" style="color: #ff4d4f; font-size: 12px;">
                  {{ passwordStrengthMessage }}
                </div>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="ruleForm.confirmPassword"
                  placeholder="请确认密码"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="code">
                <el-input
                  v-model="ruleForm.code"
                  :style="{ width: '120px' }"
                  placeholder="邮箱验证码"
                ></el-input>
                <!-- 绑定按钮的 disabled 属性 -->
                <el-button
                  type="primary"
                  @click="sendVerificationCodeValid(ruleFormRef)"
                  :disabled="isSendingCode"
                >
                  {{ isSendingCode ? `${countdownSeconds}秒后重试` : '发送验证码' }}
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="success"
                  style="width: 100px; height: 40px; font-size: 18px"
                  @click="doRegister(ruleFormRef)"
                >
                  注册
                </el-button>
                <el-button
                  type="danger"
                  style="width: 100px; height: 40px; font-size: 18px"
                  @click="doReturn"
                >
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.register-container {
  background: url('@/assets/login-bg.jpg');
}
.register-module {
  max-width: 400px;
  height: 600px;
  margin: 0px auto;
}
</style>