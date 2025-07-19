<template>
  <div class="student-manage">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索学生姓名/学号"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加学生</el-button>
    </div>

    <el-table
      :data="filteredStudents"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column label="操作" fixed="right" width="250">
        <template #default="{ row, $index }">
          <el-button type="primary" link :icon="Edit" @click="handleEdit(row, $index)">编辑</el-button>
          <el-button type="primary" link :icon="Key" @click="handleResetPassword(row)">重置密码</el-button>
          <el-button type="danger" link :icon="Delete" @click="handleDelete($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加学生' : '编辑学生'"
      width="500px"
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm"
        :rules="studentRules"
        label-width="100px"
      >
        <el-form-item label="学号" prop="id">
          <el-input v-model="studentForm.id" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="studentForm.className" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="studentForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="studentForm.password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPwdVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPwdSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, Key } from '@element-plus/icons-vue';
import axios from 'axios';

// API 接口配置
const API_BASE_URL = 'http://localhost:8000/admin';
const API_ENDPOINTS = {
  STUDENTS: '/student/search/',
  ADD:"/student/add/",
  UPDATE:"/student/update/",
  DEL:"/student/del/",
  RESET_PASSWORD: '/student/reset/'
};

// // 模拟数据生成函数
// const generateMockStudents = () => {
//   return [
//     { id: 'S001', name: '张三', className: '计算机1班', phone: '13800000001', email: 'zhangsan@school.com' },
//     { id: 'S002', name: '李四', className: '计算机2班', phone: '13800000002', email: 'lisi@school.com' },
//     { id: 'S003', name: '王五', className: '计算机1班', phone: '13800000003', email: 'wangwu@school.com' },
//     { id: 'S004', name: '赵六', className: '软件1班', phone: '13800000004', email: 'zhaoliu@school.com' },
//     { id: 'S005', name: '钱七', className: '软件2班', phone: '13800000005', email: 'qianqi@school.com' },
//   ];
// };

// 后端API接口
const api = {
  // 获取学生列表
  getStudents: async () => {
    try {
      await axios.get(`${API_BASE_URL}${API_ENDPOINTS.STUDENTS}`)
      .then(response => {
        const data = response.data
        students.value = data.students;
      })
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    }
  },

  // 添加学生
  addStudent: async (studentData) => {
    try {
        const response = await axios.get('http://localhost:8000/get_csrf_token/');
        const csrfToken = response.data.token;
       await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ADD}`, studentData,{
        headers:{
          'Content-Type':"application/json",
          "X-CSRFToken":csrfToken,
        }
       })
      .then(response => {
        const data = response.data
        ElMessage({type:data.state,message : data.msg})
      })
    } catch (error) {
      console.error('添加学生失败:', error);
      throw error;
    }
  },

  // 更新学生信息
  updateStudent: async (studentData) => {
    try {
      await axios.get(`${API_BASE_URL}${API_ENDPOINTS.UPDATE}`, {params:studentData})
      .then(response => {
        const data = response.data
        ElMessage({type:data.state,message : data.msg})
      })
    } catch (error) {
      console.error('更新学生信息失败:', error);
      throw error;
    }
  },

  // 删除学生
  deleteStudent: async (studentId) => {
    try {
      
      await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DEL}`,{params:{id:studentId}})
      .then(response => {
        const data = response.data
        ElMessage({type:data.state,message : data.msg})
      })
    } catch (error) {
      console.error('删除学生失败:', error);
      throw error;
    }
  },

  // 重置密码
  resetPassword: async (passwordData) => {
    try {
      const response = await axios.get('http://localhost:8000/get_csrf_token/');
        const csrfToken = response.data.token;
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.RESET_PASSWORD}`,
        passwordData,
        {
          headers:{
            'Content-Type':"application/json",
            "X-CSRFToken":csrfToken,
          }
        }
      ).then(response => {
        const data = response.data
        ElMessage({type:data.state,message : data.msg})
      })
      
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  }
};

// 前端状态管理
const students = ref([]);
const searchQuery = ref('');
const dialogVisible = ref(false);
const dialogType = ref('add');
const studentFormRef = ref(null);
const studentForm = reactive({
  id: '',
  name: '',
  className: '',
  phone: '',
  email: '',
  password:"",
});

// 表单验证规则
const studentRules = {
  id: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const submitting = ref(false);

// 重置密码相关
const resetPwdVisible = ref(false);
const resetPwdFormRef = ref(null);
const currentStudent = ref(null);
const resetPwdForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

const resetPwdRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 计算属性：过滤后的学生列表
const filteredStudents = computed(() => {
  let data = students.value;
  if (searchQuery.value) {
    data = data.filter(s =>
      s.name.includes(searchQuery.value) ||
      s.id.includes(searchQuery.value) ||
      s.className.includes(searchQuery.value) ||
      s.phone.includes(searchQuery.value) ||
      s.email.includes(searchQuery.value)
    );
  }
  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  updateTotal()
  return data.slice(start, end);
});

// 更新总数
const updateTotal = () => {
  let data = students.value;
  if (searchQuery.value) {
    data = data.filter(s =>
      s.name.includes(searchQuery.value) ||
      s.id.includes(searchQuery.value) ||
      s.className.includes(searchQuery.value) ||
      s.phone.includes(searchQuery.value) ||
      s.email.includes(searchQuery.value)
    );
  }
  total.value = data.length;
};

// 搜索处理
const handleSearch = async () => {
  await api.getStudents();
  currentPage.value = 1;
};

// 添加学生
const handleAdd = () => {
  dialogType.value = 'add';
  Object.assign(studentForm, {
    id: '', name: '', className: '', phone: '', email: '',password:""
  });
  dialogVisible.value = true;
};

// 编辑学生
const handleEdit = (row, index) => {
  dialogType.value = 'edit';
  Object.assign(studentForm, row);
  studentForm._editIndex = index;
  dialogVisible.value = true;
};

// 删除学生
const handleDelete = async (index) => {
  try {
    const student = students.value[index];
    await api.deleteStudent(student.id);
    await api.getStudents()
    
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!studentFormRef.value) return;
  
  try {
    await studentFormRef.value.validate();
    
    if (dialogType.value === 'add') {
      await api.addStudent(studentForm);
      await api.getStudents()
    } else if (dialogType.value === 'edit') {
      await api.updateStudent(studentForm);
      await api.getStudents()
    }
    
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 重置密码
const handleResetPassword = (row) => {
  currentStudent.value = row;
  resetPwdForm.newPassword = '';
  resetPwdForm.confirmPassword = '';
  resetPwdVisible.value = true;
};

// 提交重置密码
const handleResetPwdSubmit = async () => {
  if (!resetPwdFormRef.value || !currentStudent.value) return;
  
  try {
    await resetPwdFormRef.value.validate();
    submitting.value = true;
    
    await api.resetPassword({
      id:currentStudent.value.id,
      newPassword: resetPwdForm.newPassword
    });
    resetPwdVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || '重置密码失败');
  } finally {
    submitting.value = false;
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 初始化数据
onMounted(async () => {
  try {
    // 实际开发时使用API调用
    await api.getStudents();
    
    // 开发阶段使用模拟数据
    // students.value = generateMockStudents();
  } catch (error) {
    ElMessage.error('获取学生列表失败');
  }
});
</script>

<style scoped>
.student-manage {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-bar .el-input {
  width: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-table) {
  margin-bottom: 20px;
}
</style>