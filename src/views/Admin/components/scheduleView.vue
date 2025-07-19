<template>
  <div>
    <h1>查询班级信息</h1>

    <!-- 课程管理区块 -->
    <el-card style="margin-top: 32px;">
      <div class="course-manage">
        <div class="search-bar">
          <el-input
            v-model="courseSearchQuery"
            placeholder="搜索课程名/课程号/任课老师"
            clearable
            @clear="handleCourseSearch"
            @keyup.enter="handleCourseSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleCourseSearch">搜索</el-button>
            </template>
          </el-input>
          <el-button type="primary" :icon="Plus" @click="handleCourseAdd">添加课程</el-button>
        </div>
        <el-table
          :data="filteredCourses"
          border
          style="width: 100%"
        >
          <el-table-column prop="name" label="课程名" width="180" />
          <el-table-column prop="id" label="课程号" width="120" />
          <el-table-column prop="studentCount" label="学生人数" width="120" />
          <el-table-column prop="teacher" label="任课老师" width="150" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row, $index }">
              <el-button type="primary" link :icon="Edit" @click="handleCourseEdit(row, $index)">编辑</el-button>
              <el-button type="danger" link :icon="Delete" @click="handleCourseDelete($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="courseCurrentPage"
          v-model:page-size="coursePageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          :total="courseTotal"
          @size-change="handleCourseSizeChange"
          @current-change="handleCourseCurrentChange"
        />
        <el-dialog
          v-model="courseDialogVisible"
          :title="courseDialogType === 'add' ? '添加课程' : '编辑课程'"
          width="500px"
        >
          <el-form
            ref="courseFormRef"
            :model="courseForm"
            :rules="courseRules"
            label-width="100px"
          >
            <el-form-item label="课程名" prop="name">
              <el-input v-model="courseForm.name" />
            </el-form-item>
            <el-form-item label="课程号" prop="id">
              <el-input v-model="courseForm.id" :disabled="courseDialogType === 'edit'" />
            </el-form-item>
            <el-form-item label="任课老师" prop="teacher">
              <!-- 下拉选择框组件 -->
              <el-select
                v-model="courseForm.teacher"
                placeholder="请选择任课老师"
                style="width: 100%"
                clearable
                width="100px"
              >
                <el-option
                  v-for="teacher in teacherList"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="学生人数" prop="studentCount">
              <el-input v-model.number="courseForm.studentCount" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="courseDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleCourseSubmit">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-card>

    <!-- 新增界面 -->
    <el-dialog v-model="addFormVisible" title="新增班级信息" :append-to-body="true" @close="resetForm(addFormRef)">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="班级号" prop="classId">
          <el-input v-model="addForm.classId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="className">
          <el-input v-model="addForm.className" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="listenLoading">提 交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑界面 -->
    <el-dialog v-model="editFormVisible" title="编辑班级信息" :append-to-body="true" @close="resetForm(editFormRef)">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="班级号" prop="classId">
          <el-input v-model="editForm.classId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="className">
          <el-input v-model="editForm.className" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editSubmit" :loading="listenLoading">提 交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上

// API 接口配置
const API_BASE_URL = 'http://localhost:8000/admin';
const API_ENDPOINTS = {
  CLASSES: '/classes',
  COURSES: '/course',
  SEARCH:"/search/",
  ADD:"/add/",
  UPDATE:"/update/",
  DEL:"/del/"
};

// // 模拟数据生成函数
const generateMockClasses = () => {
  return [
    { id: 1, classId: 'CS2021-1', className: '计算机科学2021级1班' },
    { id: 2, classId: 'CS2021-2', className: '计算机科学2021级2班' },
    { id: 3, classId: 'SE2021-1', className: '软件工程2021级1班' },
    { id: 4, classId: 'SE2021-2', className: '软件工程2021级2班' },
  ];
};

// const generateMockCourses = () => {
//   return [
//     { name: '高等数学', id: 'C001', studentCount: 30, teacher: '张三' },
//     { name: '大学英语', id: 'C002', studentCount: 28, teacher: '李四' },
//     { name: '数据结构', id: 'C003', studentCount: 35, teacher: '王五' },
//     { name: '操作系统', id: 'C004', studentCount: 32, teacher: '赵六' },
//     { name: '计算机网络', id: 'C005', studentCount: 29, teacher: '钱七' },
//   ];
// };

// 后端API接口（定义未使用）
const apiService = {
  // 班级相关接口
  classes: {
    // 获取班级列表
    getList: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}`);
        return response.data;
      } catch (error) {
        console.error('获取班级列表失败:', error);
        throw error;
      }
    },

    // 添加班级
    add: async (classData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}`, classData);
        return response.data;
      } catch (error) {
        console.error('添加班级失败:', error);
        throw error;
      }
    },

    // 更新班级信息
    update: async (classId, classData) => {
      try {
        const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}/${classId}`, classData);
        return response.data;
      } catch (error) {
        console.error('更新班级信息失败:', error);
        throw error;
      }
    },

    // 删除班级
    delete: async (classId) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}/${classId}`);
        return response.data;
      } catch (error) {
        console.error('删除班级失败:', error);
        throw error;
      }
    }
  },

  // 课程相关接口
  courses: {
    // 获取课程列表
    getCourse: async () => {
      try {
        await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSES}${API_ENDPOINTS.SEARCH}`).then(response => {
          const data = response.data
          courses.value = data.courses
        })
      } catch (error) {
        console.error('获取课程列表失败:', error);
        throw error;
      }
    },

    // 添加课程
    add: async (courseData) => {
      try {
        await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSES}${API_ENDPOINTS.ADD}`, {params:courseData})
        .then(response=> {
          const data = response.data
          ElMessage({type:data.state,message : data.msg}) 
        })
      } catch (error) {
        console.error('添加课程失败:', error);
        throw error;
      }
    },

    // 更新课程信息
    update: async (courseData) => {
      try {
      await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSES}${API_ENDPOINTS.UPDATE}`,
       {params:courseData} )
       .then(response=> {
          const data = response.data
          ElMessage({type:data.state,message : data.msg}) 
        })

      } catch (error) {
        console.error('更新课程信息失败:', error);
        throw error;
      }
    },

    // 删除课程
    delete: async (courseId) => {
      try {
        await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSES}${API_ENDPOINTS.DEL}`,{
          params:{
            id:courseId
          }
        }).then(response=> {
          const data = response.data
          ElMessage({type:data.state,message : data.msg}) 
        })
      } catch (error) {
        console.error('删除课程失败:', error);
        throw error;
      }
    }
  }
};

// 班级管理相关
const classs = ref([]);
const totalClasses = ref(0);
const addFormVisible = ref(false);
const editFormVisible = ref(false);
const listenLoading = ref(false);

const teacherList = ref([]); 

const addForm = reactive({
  id: '',
  classId: '',
  className: '',
});

const editForm = reactive({
  id: '',
  classId: '',
  className: '',
});

const addFormRules = reactive({
  classId: [{ required: true, message: '请输入班级号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名', trigger: 'blur' }],
});

const editFormRules = reactive({
  classId: [{ required: true, message: '请输入班级号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名', trigger: 'blur' }],
});

const addFormRef = ref(null);
const editFormRef = ref(null);


// 关闭dialog时清数据
const resetForm = (formEl) => {
  if (formEl) {
    formEl.resetFields();
  }
};

const searchTeacher = () => {
    return axios.get('http://localhost:8000/admin/teacher/search/')
};


// 请求加载班级信息
const loadClassInfo = async () => {
  try {
    // 开发阶段使用模拟数据
    classs.value = generateMockClasses();
    totalClasses.value = classs.value.length;
    
    // 实际开发时使用API调用
    // const response = await apiService.classes.getList();
    // classs.value = response.data;
  } catch (error) {
    console.error('加载班级信息失败:', error);
    ElMessage.error('加载班级信息失败');
  }
};

const loadCourseInfo =async () => {
  try {
    const response = await searchTeacher();
    teacherList.value = response.data.list;
    // 实际开发时使用API调用
    await apiService.courses.getCourse();
    
  } catch (error) {
    console.error('加载班级信息失败:', error);
    ElMessage.error('加载班级信息失败');
  }
};

// 更新提交逻辑
const addSubmit = async () => {
  if (!addFormRef.value) return;
  
  try {
    await addFormRef.value.validate();
    listenLoading.value = true;
    
    // 开发阶段使用模拟数据
    const newClass = {
      id: classs.value.length + 1,
      classId: addForm.classId,
      className: addForm.className,
    };
    classs.value.push(newClass);
    
    // 实际开发时使用API调用
    // await apiService.classes.add({
    //   classId: addForm.classId,
    //   className: addForm.className,
    // });
    
    listenLoading.value = false;
    addFormVisible.value = false;
    await loadClassInfo();
  } catch (error) {
    listenLoading.value = false;
    ElMessage.error(error.message || '添加失败');
  }
};

// 编辑表单验证逻辑
const editSubmit = async () => {
  if (!editFormRef.value) return;
  
  try {
    await editFormRef.value.validate();
    listenLoading.value = true;
    
    // 开发阶段使用模拟数据
    const index = classs.value.findIndex(c => c.id === editForm.id);
    if (index !== -1) {
      classs.value[index] = {
        id: editForm.id,
        classId: editForm.classId,
        className: editForm.className, 
      };
    }
    
    // 实际开发时使用API调用
    // await apiService.classes.update(editForm.id, {
    //   classId: editForm.classId,
    //   className: editForm.className,
    // });
    
    listenLoading.value = false;
    editFormVisible.value = false;
    ElMessage.success('更新成功');
    await loadClassInfo();
  } catch (error) {
    listenLoading.value = false;
    ElMessage.error(error.message || '更新失败');
  }
};

// 课程管理相关
const courses = ref([]);
const courseSearchQuery = ref('');
const courseDialogVisible = ref(false);
const courseDialogType = ref('add');
const courseFormRef = ref(null);
const courseForm = reactive({
  name: '',
  id: '',
  studentCount: 0,
  teacher: "",
});

const courseRules = {
  name: [
    { required: true, message: '请输入课程名', trigger: 'blur' }
  ],
  id: [
    { required: true, message: '请输入课程号', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  teacher: [
    { required: true, message: '请输入任课老师', trigger: 'blur' }
  ]
};

const courseCurrentPage = ref(1);
const coursePageSize = ref(10);
const courseTotal = ref(0);

// 计算属性：过滤后的课程列表
const filteredCourses = computed(() => {
  let data = courses.value;
  if (courseSearchQuery.value) {
    data = data.filter(c =>
      c.name.includes(courseSearchQuery.value) ||
      c.id.includes(courseSearchQuery.value) ||
      c.teacher.includes(courseSearchQuery.value)
    );
  }
  const start = (courseCurrentPage.value - 1) * coursePageSize.value;
  const end = start + coursePageSize.value;
  return data.slice(start, end);
});

// 更新课程总数
const updateCourseTotal = () => {
  let data = courses.value;
  if (courseSearchQuery.value) {
    data = data.filter(c =>
      c.name.includes(courseSearchQuery.value) ||
      c.id.includes(courseSearchQuery.value) ||
      c.teacher.includes(courseSearchQuery.value)
    );
  }
  courseTotal.value = data.length;
};

// 课程搜索
const handleCourseSearch = () => {
  courseCurrentPage.value = 1;
  updateCourseTotal();
};

// 添加课程
const handleCourseAdd = () => {
  courseDialogType.value = 'add';
  Object.assign(courseForm, { name: '', id: '', studentCount: 0, teacher: "" });
  courseDialogVisible.value = true;
};

// 编辑课程
const handleCourseEdit = (row, index) => {
  courseDialogType.value = 'edit';
  const teacherUno = teacherList.value.filter((teacher)=>{teacher.name===row.name}).id
  Object.assign(courseForm, {...row,teacher:teacherUno});

  courseForm._editIndex = index;
  courseDialogVisible.value = true;
};

// 删除课程
const handleCourseDelete = async (index) => {
  try {
    
    // 实际开发时使用API调用
    const course = courses.value[index];
    await apiService.courses.delete(course.id);

    await  apiService.courses.getCourse()
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 提交课程表单
const handleCourseSubmit = async () => {
  if (!courseFormRef.value) return;
  
  try {
    await courseFormRef.value.validate();
    
    if (courseDialogType.value === 'add') {
      
      // 实际开发时使用API调用
      await apiService.courses.add(courseForm);

      
    } else if (courseDialogType.value === 'edit') {

      // 实际开发时使用API调用
      await apiService.courses.update(courseForm);
    }
    await apiService.courses.getCourse()
    courseDialogVisible.value = false;
    updateCourseTotal();
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页处理
const handleCourseSizeChange = (val) => {
  coursePageSize.value = val;
  courseCurrentPage.value = 1;
  updateCourseTotal();
};

const handleCourseCurrentChange = (val) => {
  courseCurrentPage.value = val;
  updateCourseTotal();
};

// 初始化数据
onMounted(async () => {
  try {
    await loadClassInfo();
    await loadCourseInfo();
    // courses.value = generateMockCourses();
    updateCourseTotal();
  } catch (error) {
    ElMessage.error('加载数据失败');
  }
});
</script>

<style scoped>
.card {
  margin-top: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
}

.course-manage .search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.course-manage .el-input {
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