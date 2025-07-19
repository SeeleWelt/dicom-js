<template>
  <div>
    <el-container class="container">
      <el-main>
        <el-card>
          <infoCardtea></infoCardtea>
          <!-- 原轮播图位置 -->
          <div class="carousel-container">
            <div class="block text-center course-blocks">
              <el-button
                v-for="course in teacherCourses"
                :key="course.id"
                class="course-btn"
                @click="goToCourse(course)"
                :style="{ background: course.color }"
              >
                {{ course.name }}
              </el-button>
            </div>
          </div>
        </el-card>
        <!-- <logout></logout> -->
      </el-main>
    </el-container>
    <!-- <IdleDetector 
      @update-learning-time="updateLearningTime" 
      @session-cancelled="handleSessionCancelled"
    /> -->
  </div>
</template>

<script setup>
import infoCardtea from '@/components/infoCardtea.vue'
// import IdleDetector from '@/components/IdleDetector.vue';
// import { sendLearningTime } from '@/api/api.js';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { ElMessage } from 'element-plus';
//import logout from '@/components/logoutView.vue'

// let learningTime = 0; // 用于存储学习时长

const teacherCourses = ref([]);
const router = useRouter();
const pastelColors = ['#FFD6E0', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB', '#B5D8FA'];

import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上

const fetchTeacherCourses = async (id)=> {
  try {
    await axios.get("http://localhost:8000/teacher/courses/",{
      params:{
        id:id
      }
    }).then(response=> {
      const data = response.data
      teacherCourses.value = data.courses.map((c, i) => ({ ...c, color: pastelColors[i % pastelColors.length] }));
    })
  } catch (error) {
    console.error('删除课程失败:', error);
    throw error;
  }
}

async function loadCourses() {
  const id = localStorage.getItem('id');
  try {
    await fetchTeacherCourses(id);
    
  } catch (e) {
    // ===== MOCK数据演示（如无后端可用，自动填充三条课程，后续可删除） =====
    const data = [
      { id: 'C001', name: '高等数学' },
      { id: 'C002', name: '大学英语' },
      { id: 'C003', name: '数据结构' }
    ];
    teacherCourses.value = data.map((c, i) => ({ ...c, color: pastelColors[i % pastelColors.length] }));
    // ===== MOCK数据演示结束 =====
  }
}

// sync function updateLearningTime(time) {
//   learningTime = time;
//   // 使用 API 服务发送学习时长到后端
//   try {
//     const result = await sendLearningTime(learningTime);
//     console.log('后端响应:', result);
//   } catch (error) {
//     console.error('发送学习时长失败:', error);
//   }
// }a

function goToCourse() {
  router.push({ name: 'teacherHome' });
}

onMounted(loadCourses);
</script>
<style scoped>
.container {
  display: flex;
  justify-content: center; 
  margin-top: 10px;
  align-items: center; 
  height: 600px;
  width: 100%; 
}
.carousel-container {
  margin-top: 10px;
  height: 500px;
  width: 1000px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.course-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.course-btn {
  width: 120px;
  height: 120px;
  border-radius: 35px;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: none;
  transition: transform 0.1s;
}
.course-btn:hover {
  transform: scale(1.08);
  filter: brightness(1.1);
}
/* 轮播图图片样式 */
.carousel-image {
  margin-top: 20px;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}
</style>
