<template>
  <div class="container">
    <div class="main-content">
      <!-- Header Section -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" style="height: 50px;width: 150px;" alt="Logo" />
        </div>
      </div>

      <!-- Content Section -->
      <div class="content">
        <h2>学生学习时长统计</h2>

        <!-- 表格展示学生学习时长 -->
        <el-table :data="studentLearningData" style="width: 100%">
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="id" label="ID"></el-table-column>
          <!-- 新增开始时间列 -->
          <el-table-column prop="startTime" label="开始时间">
            <template #default="{ row }">
              {{ row.startTime }}
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="学习时长"></el-table-column>
        </el-table>

        <!-- 导出 Excel 按钮 -->
        <el-button type="primary" @click="exportExcel" style="position: fixed; right: 20px; bottom: 20px;">
          导出 Excel
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'
import * as XLSX from 'xlsx' ;
axios.defaults.withCredentials = true;

// 学生学习数据
const studentLearningData = ref([]);

// 格式化时间（假设后端返回时间戳，可根据实际情况调整）
// const formatTime = (timeStamp) => {
//   if (!timeStamp) return '-';
//   const date = new Date(timeStamp);
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
// };

// 获取学生学习数据
const fetchStudentLearningData = async () => {
  try {
    const response = await axios.get("http://localhost:8000/get/studyList");
    studentLearningData.value = response.data.studyList.map(item => ({
      ...item,
    }));
    console.log(studentLearningData.value)
  } catch (error) {
    console.error('获取学生学习数据失败:', error);
  }
};

// 导出 Excel
const exportExcel = () => {
  // 检查是否有数据
  if (studentLearningData.value.length === 0) {
    alert('没有可导出的数据');
    return;
  }
  
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 准备导出数据
  const exportData = studentLearningData.value.map(item => ({
    '姓名': item.name,
    'ID': item.id,
    '开始时间': item.startTime || '-',
    '学习时长': item.duration || '-'
  }));
  
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '学生学习数据');
  
  // 生成 Excel 文件并下载
  XLSX.writeFile(wb, `学生学习数据_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

onMounted(() => {
  fetchStudentLearningData();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logo img {
  height: 50px;
}

.content {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.el-table {
  margin-bottom: 20px;
}
</style>