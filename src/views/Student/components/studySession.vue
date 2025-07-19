<template>
  <div class="container">
    <div class="main-content">
      <!-- Header Section -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" style="height: 50px; width: 150px;" alt="Logo" />
        </div>
        <!-- 课程选择下拉框 -->
        <div class="course-selector" style="margin-left: auto;">
          <el-select v-model="selectedCourseId" placeholder="选择课程" style="width: 200px;">
            <el-option v-for="course in studentCourses" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content">
        <!-- Sheet 导航 -->
        <div class="sheet-navigation">
          <el-tabs v-model="activeSheet" type="card" v-if="currentTasks.length > 0">
            <el-tab-pane
              v-for="(sheet, index) in currentTasks"
              :key="index"
              :label="sheet.title"
            >
              <div class="box">
                <h2>{{ sheet.title }}</h2>
                <div class="course-info">
                  <p><span class="info-label">课程名称：</span>{{ sheet.courseName }}</p>
                  <p><span class="info-label">开始时间：</span>{{ formatDate(sheet.startTime) }}</p>
                  <p><span class="info-label">截止时间：</span>{{ formatDate(sheet.endTime) }}</p>
                </div>
                <!-- 内容显示区域 -->
                <div class="task-content">
                  <span>备注：{{sheet.remark  }}</span>
                  <!-- 附件下载区域 -->
                  <div v-if="sheet.files && sheet.files.length > 0" class="attachments">
                    <h3>附件：</h3>
                    <div class="attachment-list">
                      <div v-for="(file, attIndex) in sheet.files" :key="attIndex" class="attachment-item">
                        <el-button type="primary" @click="downloadAttachment(file)">
                          <i class="el-icon-download"></i> {{ file.name }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div v-else class="empty-state">
            <el-empty description="暂无该课程的任务"></el-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
// import { useRouter } from 'vue-router';

axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息

// const router = useRouter();
const studentId = ref('');
const selectedCourseId = ref('');
const studentCourses = ref([]); // 学生所选课程列表
const currentTasks = ref([]); // 当前课程的任务列表
const activeSheet = ref('1');

// 获取所有的课程
const fetchStudentCourses = async (id)=> {
  try {
    await axios.get("http://localhost:8000/student/courses/",{
      params:{
        id:id
      }
    }).then(response=> {
      const data = response.data
      studentCourses.value = data.courses
    })
  } catch (error) {
    console.error('删除课程失败:', error);
    throw error;
  }
}


// 根据课程ID获取任务
const fetchTasksByCourse = async (courseId) => {
  try {
    
    const response = await axios.get(`http://localhost:8000/student/getTasks/`, { 
      params: { id: studentId.value, courseId: courseId } 
    });
    currentTasks.value = response.data.tasks.map(task => ({
      ...task,
      // 转换时间格式
      startTime: new Date(task.openRange[0]),
      endTime: new Date(task.openRange[1]),
      // 转换文件为Blob对象
      files: task.files.map((file,index) => (
        base64ToFile(file, task.fileNames[index])
      ))
    }))
    console.log(currentTasks.value[0].files[0].name)
  } catch (error) {
    currentTasks.value = [];
    console.error('获取任务错误:', error);
    ElMessage.error('获取任务列表失败');
  }
};

/**
 * 将Base64字符串转换为File对象
 * @param {string} base64String - Base64编码的字符串（可选包含dataURI前缀）
 * @param {string} fileName - 目标文件名
 * @param {string} [fileType] - 文件类型（MIME类型）
 * @returns {File|null} - 转换后的File对象
 */
function base64ToFile(base64String, fileName, fileType = null) {
  try {
    let base64Data = base64String;
    let mimeType = fileType;
    
    if (base64String.startsWith('data:')) {
      const dataURI = base64String.split(',');
      mimeType = dataURI[0].split(':')[1].split(';')[0];
      base64Data = dataURI[1];
    }
    
    if (!mimeType) {
      if (base64Data.startsWith('/9j/4AAQSkZJRgABAQAAAQABAAD/')) mimeType = 'image/jpeg';
      else if (base64Data.startsWith('iVBORw0KGgoAAAANSUhEUgAA')) mimeType = 'image/png';
      else if (base64Data.startsWith('JVBERi0xLjQKJc')) mimeType = 'application/pdf';
      else if (base64Data.startsWith('UEsFBg')) mimeType = 'application/msword';
      else mimeType = 'application/octet-stream';
    }
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Base64转File失败:', error);
    return null;
  }
}

/**
 * 下载File对象为文件
 * @param {File} file - 要下载的File对象
 * @param {string} [fileName] - 自定义下载文件名，默认为file.name
 */
const downloadAttachment = (file, fileName = file.name) => {
  try {
    // 校验文件对象有效性
    if (!file || !(file instanceof File)) {
      ElMessage.warning('无效的文件对象');
      return;
    }
    
    // 生成文件下载URL
    const url = window.URL.createObjectURL(file);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);  // 使用自定义或原始文件名
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理资源（防止内存泄漏）
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    ElMessage.success(`文件 ${fileName} 下载成功`);
  } catch (error) {
    console.error('下载附件错误:', error);
    ElMessage.error('下载附件失败');
  }
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未设置';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 监听课程选择变化
watch(selectedCourseId, async (newValue) => {
  if (newValue) {
    await fetchTasksByCourse(newValue);
    if (currentTasks.value.length > 0) {
      activeSheet.value = '1'; // 切换到第一个标签页
    }
  }
});

// 初始化
onMounted(async () => {
  // await fetchStudentInfo();
  studentId.value = localStorage.getItem('id')
  await fetchStudentCourses(studentId.value);
});
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
  justify-content: space-between;
}

.course-selector {
  margin-left: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.box {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.box h2 {
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.course-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-label {
  font-weight: bold;
  color: #606266;
}

.task-content {
  margin-bottom: 20px;
}

.attachments {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.attachment-item {
  margin-right: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>