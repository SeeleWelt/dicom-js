<template>
  <div>
    <el-container class="container">
      <el-main>
        <el-card>
          <infoCardtea></infoCardtea>
          <!-- 轮播图容器 -->
          <div class="carousel-container">
            <!-- 轮播图内容 -->
            <div class="block text-center">
              <!-- <span class="demonstration">轮播图</span> -->
              <!-- 轮播图组件 -->
              <el-carousel height="600px" motion-blur :interval="2000">
                <el-carousel-item v-for="(item, index) in imageList" :key="index">
                  <!-- 图片 -->
                  <img :src="item.src" :alt="'Slide ' + index" class="carousel-image" />
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
        </el-card>
        <!-- <logout></logout> -->
      </el-main>
    </el-container>
    <IdleDetector 
      @update-learning-time="updateLearningTime" 
      @session-cancelled="handleSessionCancelled"
    />
  </div>
</template>

<script setup>
import infoCardtea from '@/components/infoCardtea.vue'
import IdleDetector from '@/components/IdleDetector.vue';
import { sendLearningTime } from '@/api/api.js';
//import logout from '@/components/logoutView.vue'
const imageList = [
  { src: 'src/assets/image/1.png' },
  { src: 'src/assets/image/2.png' }
  // Add more images as needed
]
let learningTime = 0; // 用于存储学习时长

async function updateLearningTime(time) {
  learningTime = time;
  // 使用 API 服务发送学习时长到后端
  try {
    const result = await sendLearningTime(learningTime);
    console.log('后端响应:', result);
  } catch (error) {
    console.error('发送学习时长失败:', error);
  }
}
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
