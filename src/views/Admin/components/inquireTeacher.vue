<template>
  <div class="teacher-manage">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索教师姓名/工号"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      
      <el-button 
        type="primary" 
        :icon="Plus"
        @click="handleAdd"
      >
        添加教师
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredTeachers"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="工号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="department" label="所属院系" width="150" />
      <el-table-column prop="title" label="职称" width="120" />
      <el-table-column label="操作" fixed="right" width="250">
        <template #default="{ row, $index }">
          <el-button 
            type="primary" 
            link
            :icon="Edit"
            @click="handleEdit(row, $index)"
          >
            编辑
          </el-button>
          <el-button 
            type="primary" 
            link
            :icon="Key"
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>
          <el-button 
            type="danger" 
            link
            :icon="Delete"
            @click="handleDelete($index)"
          >
            删除
          </el-button>
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

    <!-- 添加/编辑教师对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加教师' : '编辑教师'"
      width="500px"
    >
      <el-form
        ref="teacherFormRef"
        :model="teacherForm"
        :rules="teacherRules"
        label-width="100px"
      >
        <el-form-item label="工号" prop="id">
          <el-input v-model="teacherForm.id" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="teacherForm.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="teacherForm.email" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="teacherForm.department" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="teacherForm.title" placeholder="请选择职称">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="初始密码" prop="password">
          <el-input v-model="teacherForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
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
          <el-button type="primary" @click="handleResetPwdSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Delete, Key } from '@element-plus/icons-vue';
import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上
// import { searchTeacher } from '@/api/api'; // 如需切换接口数据，取消注释

// ===== mock 数据，仅供开发调试，后续可删除 =====
// const mockTeachers = [
//   {
//     id: '2023000001',
//     name: '张三',
//     email: 'zhangsan@example.com',
//     department: '计算机学院',
//     title: '教授',
//     status: '在职'
//   },
//   {
//     id: '2023000002',
//     name: '李四',
//     email: 'lisi@example.com',
//     department: '数学学院',
//     title: '副教授',
//     status: '在职'
//   },
//   {
//     id: '2023000003',
//     name: '王五',
//     email: 'wangwu@example.com',
//     department: '物理学院',
//     title: '讲师',
//     status: '在职'
//   }
// ];
// ===========================================

const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0); // mock 数据总数
const teacherList = ref([]); // 初始化为 mock 数据

// 表单相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const submitting = ref(false);
const teacherFormRef = ref(null);
const teacherForm = reactive({
  id: '',
  name: '',
  email: '',
  department: '',
  title: '',
  status: '在职',
  password: ''
});

const teacherRules = {
  id: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 1, max: 10, message: '长度应为10个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入所属院系', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 重置密码相关
const resetPwdVisible = ref(false);
const resetPwdFormRef = ref(null);
const currentTeacher = ref(null);
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

// 管理员查询教师信息
// 搜索教师
const searchTeacher = () => {
    return axios.get('http://localhost:8000/admin/teacher/search/')
};

// 方法
const loadTeacherList = async () => {
  // ===== 调试阶段，使用 mock 数据 =====
  // teacherList.value = [...mockTeachers];
  // total.value = teacherList.value.length;

  // ===== 切换为接口数据，注释上面两行，取消下面注释 =====
  // ===== 其实我也没看明白，主要就是获取后台存储好的教师data
  loading.value = true;
  try {
    const response = await searchTeacher();
    console.log(response.data)
    teacherList.value = response.data.list;
  } catch (error) {
    ElMessage.error('获取教师列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  await loadTeacherList()
  currentPage.value = 1;
};

const handleSizeChange = async (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = async (val) => {
  currentPage.value = val;

};

const handleAdd = () => {
  dialogType.value = 'add';
  Object.keys(teacherForm).forEach(key => {
    teacherForm[key] = '';
  });
  teacherForm.status = '在职';
  dialogVisible.value = true;
};

const handleEdit = (row, index) => {
  dialogType.value = 'edit';
  Object.keys(teacherForm).forEach(key => {
    if (key !== 'password') {
      teacherForm[key] = row[key];
    }
  });
  teacherForm._editIndex = index;
  dialogVisible.value = true;
};

const handleDelete = async (index) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该教师吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await removeTeacher(teacherList.value[index].id);
    await loadTeacherList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 添加教师的API
const addTeacher = async (teacherData) => {
  const response = await axios.get('http://localhost:8000/get_csrf_token/');
  const csrfToken = response.data.token;
  await axios.post('http://localhost:8000/admin/teacher/add/', teacherData,{
    headers:{
        'Content-Type':"application/json",
        "X-CSRFToken":csrfToken,
      }
  }
  ).then(response => {
    const data = response.data
    ElMessage({type:data.state,message : data.msg})
  }).catch(error => {
    console.error('添加教师失败:', error);
    throw error;
  });
};

// 删除教师的API
const removeTeacher = async (teacherId) => {
  await axios.get(`http://localhost:8000/admin/teacher/del/`,{params:{id:teacherId}})
    .then(response => {
      const data = response.data
      ElMessage({type:data.state,message : data.msg}) 
    })
    .catch(error => {
      console.error('删除失败:', error);
      throw error; // 将错误继续抛出，以便调用者处理
    });
};


// 更新教师信息的API
const updateTeacher = async (teacherData) => {
  await axios.get(`http://localhost:8000/admin/teacher/update/`, {
    params:{
      id: teacherData.id,
      name: teacherData.name,
      email: teacherData.email,
      department: teacherData.department,
      title: teacherData.title,
      status: teacherData.status,
    }
  })
    .then(response => {
      const data = response.data
      ElMessage({type:data.state,message : data.msg})
    })
    .catch(error => {
      console.error('更新失败:', error);
      throw error;
    });
};

// 重置教师密码的API
const resetTeacherPassword = async (data) => {
  const response = await axios.get('http://localhost:8000/get_csrf_token/');
  const csrfToken = response.data.token;
  await axios.post('http://localhost:8000/admin/teacher/reset/', data,
    {
      headers:{
        'Content-Type':"application/json",
        "X-CSRFToken":csrfToken,
      }
    }
  )
    .then(response => {
        const data = response.data
        ElMessage({type:data.state,message : data.msg})
    })
    .catch(error => {
      console.error('密码重置失败:', error);
      throw error;
    });
};

const handleResetPassword = (row) => {
  currentTeacher.value = row;
  resetPwdForm.newPassword = '';
  resetPwdForm.confirmPassword = '';
  resetPwdVisible.value = true;
};

const handleSubmit = async () => {
  if (!teacherFormRef.value) return;
  
  try {
    await teacherFormRef.value.validate();
    submitting.value = true;
    
    if (dialogType.value === 'add') {
      await addTeacher(teacherForm);
    } else {
      await updateTeacher(teacherForm);
    }
    
    dialogVisible.value = false;
    await loadTeacherList();
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleResetPwdSubmit = async () => {
  if (!resetPwdFormRef.value || !currentTeacher.value) return;
  
  try {
    await resetPwdFormRef.value.validate();
    submitting.value = true;
    
    await resetTeacherPassword({
      id: currentTeacher.value.id,
      newPassword: resetPwdForm.newPassword
    });
    
    resetPwdVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || '重置密码失败');
  } finally {
    submitting.value = false;
  }
};

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teacherList.value;
  const data = teacherList.value.filter(t =>
    t.name.includes(searchQuery.value) ||
    t.id.includes(searchQuery.value) ||
    t.email.includes(searchQuery.value) ||
    t.department.includes(searchQuery.value) ||
    t.title.includes(searchQuery.value)
  );

    // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  updateTotal()
  return data.slice(start, end);
});

// 更新总数
const updateTotal = () => {
  let data = teacherList.value;
  total.value = data.length;
};

onMounted(async () => {
  await loadTeacherList();
});
</script>

<style scoped>
.teacher-manage {
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