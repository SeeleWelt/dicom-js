<template>
  <div class="container">
    <div class="main-content">
      <!-- Header Section -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" style="height: 50px; width: 150px;" alt="Logo" />
        </div>
        <h1 class="title">教师端 - 发布任务</h1>
      </div>

      <!-- Content Section -->
      <div class="content">
        <!-- 上传任务表单 -->
        <el-card style="margin-bottom: 30px;">
          <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
            <el-form-item label="课程选择" prop="courseId" required>
              <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%;">
                <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="任务标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入任务标题" />
            </el-form-item>
            <el-form-item label="开放时间" required>
              <el-date-picker
                v-model="form.openRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
            <el-form-item label="上传文件" prop="files">
              <el-upload
                class="upload-demo"
                drag
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :file-list="fileList"
                :accept="'.doc,.docx,.pdf,.txt'"
                multiple
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">仅支持word、pdf、txt文件，可多选</div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitTask">{{ editIndex === null ? '发布任务' : '保存修改' }}</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 任务列表 -->
        <el-card>
          <h3>已发布任务</h3>
          <el-table :data="taskList" style="width: 100%; margin-top: 10px;">
            <el-table-column prop="courseName" label="课程名称" width="180" />
            <el-table-column prop="title" label="任务标题" width="180" />
            <el-table-column prop="openRange" label="开放时间" width="220">
              <template #default="scope">
                <span>{{ scope.row.openRange[0] }} 至 {{ scope.row.openRange[1] }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200" />
            <el-table-column prop="fileNames" label="附件" width="220">
              <template #default="scope">
                <div v-if="scope.row.files && scope.row.files.length">
                  <div v-for="file in scope.row.files" :key="file.uid || file.name">
                    <el-link type="primary" @click="previewFile(file)">{{ file.name }}</el-link>
                  </div>
                </div>
                <span v-else>无</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" size="small" @click="editTask(scope.$index)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteTask(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive,onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上



// 模拟课程数据
const courseList = ref([
  { id: 1, name: '高等数学' },
  { id: 2, name: '大学英语' },
  { id: 3, name: '计算机科学' },
  { id: 4, name: '线性代数' }
]);

// ===== MOCK数据演示，后续对接后端可删除 =====
const taskList = ref([
  {
    courseId: 1,
    courseName: '高等数学',
    title: '第一章作业',
    openRange: ['2024-06-01', '2024-06-10'],
    remark: '请按时完成',
    files: []
  },
  {
    courseId: 3,
    courseName: '计算机科学',
    title: '第二章作业',
    openRange: ['2024-06-11', '2024-06-20'],
    remark: '重点复习',
    files: []
  }
]);
// ===== MOCK数据演示结束 =====

const form = reactive({
  courseId: '',
  courseName: '',
  title: '',
  openRange: [],
  remark: '',
  files: [] // 多文件
});
const fileList = ref([]);
const formRef = ref(null);
const editIndex = ref(null);

// 预览窗口map（mock演示，后续可删除）
const previewWindows = new Map();

const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  files: [{ required: true, message: '请上传文件', trigger: 'change' }]
};

onMounted(async ()=>{
  const id = localStorage.getItem("id")
  console.log(id)
  await getCourseList(id) // 获取课程列表
  await getTaskList(id)
  
})

/**
 * 将Base64字符串转换为File对象
 * @param {string} base64String - Base64编码的字符串（可选包含dataURI前缀）
 * @param {string} fileName - 目标文件名
 * @param {string} [fileType] - 文件类型（MIME类型），默认根据base64内容推断
 * @returns {File|null} - 转换后的File对象，失败时返回null
 */
function base64ToFile(base64String, fileName, fileType = null) {
  try {
    // 处理dataURI格式（如"data:image/png;base64,iVBORw0KGgo..."）
    let base64Data = base64String;
    let mimeType = fileType;
    
    if (base64String.startsWith('data:')) {
      const dataURI = base64String.split(',');
      mimeType = dataURI[0].split(':')[1].split(';')[0];
      base64Data = dataURI[1];
    }
    
    // 确定文件类型（若未指定）
    if (!mimeType) {
      // 简单推断：根据Base64字符串前缀判断常见类型
      if (base64Data.startsWith('/9j/4AAQSkZJRgABAQAAAQABAAD/')) mimeType = 'image/jpeg';
      else if (base64Data.startsWith('iVBORw0KGgoAAAANSUhEUgAA')) mimeType = 'image/png';
      else if (base64Data.startsWith('JVBERi0xLjQKJc')) mimeType = 'application/pdf';
      else if (base64Data.startsWith('UEsFBg')) mimeType = 'application/msword';
      else mimeType = 'application/octet-stream'; // 通用二进制类型
    }
    
    // 解码Base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    // 创建Uint8Array和Blob
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // 转换为File对象
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Base64转File失败:', error);
    return null;
  }
}

const getTaskList = async (teacherId)=>{
  await axios.get("http://localhost:8000/teacher/getTasks/",{params:{id:teacherId}})
  .then(response=>{
    const data = response.data
    const tasks = data.taskList
    let task_temp = []
    tasks.forEach(task=>{
      let temp = []
      task.fileNames.forEach((name,index)=>{
        const file = base64ToFile(task.files[index],name)
        temp.push(file)
      })
      task_temp.push({...task,files:temp})
    })
    console.log(task_temp)
    taskList.value = task_temp
  })
}

const getCourseList = async (id)=> {
  try {
    await axios.get("http://localhost:8000/teacher/courses/",{
      params:{
        id:id
      }
    }).then(response=> {
      courseList.value = response.data.courses
      console.log("courseList",courseList.value)
    })
  } catch (error) {
    console.error('删除课程失败:', error);
    throw error;
  }
}

function handleFileChange(file, fileListArr) {
  form.files = fileListArr.map(f => f.raw || f.originFileObj || f);
  fileList.value = fileListArr;
}

function handleFileRemove(file, fileListArr) {
  form.files = fileListArr.map(f => f.raw || f.originFileObj || f);
  fileList.value = fileListArr;
}

function previewFile(file) {
  // 从文件对象或URL中获取文件信息
  const fileInfo = typeof file === 'string' 
    ? { url: file, name: file.split('/').pop() } 
    : { file, name: file.name, type: file.type };

  // 判断文件类型
  const isImage = (() => {
    if (fileInfo.type?.includes('image') || 
        fileInfo.name.endsWith('.png') || 
        fileInfo.name.endsWith('.jpg') || 
        fileInfo.name.endsWith('.jpeg')) return true;
    return false;
  })();

  // 生成预览/下载URL
  let targetUrl;
  if (fileInfo.url) {
    targetUrl = fileInfo.url; // 已有URL，直接使用
  } else if (fileInfo.file) {
    targetUrl = URL.createObjectURL(fileInfo.file); // 创建临时URL
  } else {
    ElMessage.error('无法获取文件信息');
    return;
  }

  // 处理图片预览
  if (isImage) {
    const win = window.open(targetUrl, '_blank');
    if (win) {
      const key = fileInfo.file?.uid || fileInfo.name;
      previewWindows.set(key, win);
      
      // 清理临时URL（窗口关闭后）
      if (fileInfo.file) {
        win.addEventListener('close', () => {
          URL.revokeObjectURL(targetUrl);
          previewWindows.delete(key);
        });
      }
    }
    return;
  }

  // 处理其他文件下载
  const link = document.createElement('a');
  link.href = targetUrl;
  link.download = fileInfo.name;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    if (fileInfo.file) {
      URL.revokeObjectURL(targetUrl);
    }
  }, 100);
}

function resetForm() {
  form.courseId = '';
  form.courseName = '';
  form.title = '';
  form.openRange = [];
  form.remark = '';
  form.files = [];
  fileList.value = [];
  editIndex.value = null;
  if (formRef.value) formRef.value.clearValidate();
  // ===== MOCK预览同步关闭，后续可删除 =====
  for (const win of previewWindows.values()) {
    if (win && !win.closed) win.close();
  }
  previewWindows.clear();
  // ===== MOCK预览同步关闭结束 =====
}

async function submitTask() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;

    // 创建FormData对象
    const formData = new FormData();
    formData.append('course_id', form.courseId);
    formData.append('title', form.title);
    formData.append('open_time', form.openRange[0]);
    formData.append('close_time', form.openRange[1]);
    formData.append('remark', form.remark);
    formData.append('mode', editIndex.value === null ? '0' : '1');
    if (form.files && form.files.length > 0) {
      form.files.forEach(file => {
        formData.append('files', file); // 注意：不要用 files[]，Django 默认使用字段名获取所有文件
      });
    }
    
    try {
      // 发送请求
      const response = await axios.get('http://localhost:8000/get_csrf_token/');
      const csrfToken = response.data.token;
      await axios.post(
        "http://localhost:8000/teacher/addTask/",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            "X-CSRFToken":csrfToken,
          }
        }
      ).then(async (response)=>{
        const data  = response.data
        ElMessage({type:data.state,message:data.msg})
        const id = localStorage.getItem("id")
        if(editIndex.value !== null)
          editIndex.value = null
        await getTaskList(id)
      })
    } catch (error) {
      console.error('添加任务失败:', error);
      ElMessage.error('网络错误，请稍后重试');
    }
  });
}

function editTask(index) {
  const task = taskList.value[index];
  form.courseId = task.courseId;
  form.courseName = task.courseName;
  form.title = task.title;
  form.openRange = [...task.openRange];
  form.remark = task.remark;
  form.files = task.files ? [...task.files] : [];
  fileList.value = form.files.map(f => ({ name: f.name, url: '', raw: f }));
  editIndex.value = index;
}

async function deleteTask(index) {
  const courseId = taskList.value[index].courseId
  console.log(courseId)
  await axios.get("http://localhost:8000/teacher/delTask/",{params:{courseId:courseId}})
  .then(response=>{
    const data = response.data
    ElMessage({type:data.state,message:data.msg})
  })
  const id = localStorage.getItem("id")
  await getTaskList(id)
}
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  margin-left: 20px;
  font-size: 24px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.upload-demo {
  width: 100%;
}
</style>