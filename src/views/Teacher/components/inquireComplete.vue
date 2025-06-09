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
        <el-table :data="studentLearningData">
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="id" label="ID"></el-table-column>
          <el-table-column prop="learningTime" label="学习时长（分钟）"></el-table-column>
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

// 学生学习数据
const studentLearningData = ref([]);

// 获取学生学习数据
const fetchStudentLearningData = async () => {
  try {
    const response = await fetch("/api/studentLearningData");//后端学生学习时长接口
    const data = await response.json();
    studentLearningData.value = data;
  } catch (error) {
    console.error('获取学生学习数据失败:', error);
  }
};

// 导出 Excel
const exportExcel = () => {
  // 调用后台导出 Excel 接口
  window.location.href = "/api/exportExcel";//后端导出excel表格
};

// 生命周期钩子
onMounted(() => {
  fetchStudentLearningData(); // 获取学生学习数据
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
}
</style>