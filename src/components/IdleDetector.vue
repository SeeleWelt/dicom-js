<template>
  <div class="study-tracker-container">
    <!-- 计时器组件 -->
    <div class="timer-display">
      <div class="timer-value">{{ formattedTime }}</div>
      <div class="timer-label">学习时长</div>
    </div>

    <div v-if="showIdleDialog" class="idle-dialog">
      <div class="idle-dialog-content">
        <p>您已长时间未操作，是否继续？</p>
        <button @click="confirmContinue">继续</button>
        <button @click="cancelSession">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onActivated, onDeactivated, defineExpose, nextTick, computed } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
axios.defaults.withCredentials = true;

const isSessionActive = ref(false);
const startTime = ref(null);
const elapsedTime = ref(0);
const lastActiveTime = ref(new Date());
const idleTime = 300000;
const showIdleDialog = ref(false);
let idleInterval = ref(null);
let timerInterval = ref(null);

// 格式化时间显示
const formattedTime = computed(() => {
  const seconds = Math.floor(elapsedTime.value % 60);
  const minutes = Math.floor((elapsedTime.value / 60) % 60);
  const hours = Math.floor(elapsedTime.value / 3600);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 更新计时器
const updateTimer = () => {
  if (isSessionActive.value) {
    elapsedTime.value = Math.floor((new Date() - startTime.value) / 1000);
  }
};

// 发送开始学习请求到后端
const startLearningSession = async () => {
  if (isSessionActive.value) return;
  
  try {
    await axios.get('http://localhost:8000/study/start/')
    .then(response => {
      ElMessage({type: response.data.state, message: response.data.msg});
      if (response.data.state === 'success') {
        isSessionActive.value = true;
        startTime.value = new Date();
        // 如果是恢复会话，累加之前的时长
        if (response.data.resumed && response.data.elapsedTime) {
          elapsedTime.value = response.data.elapsedTime;
        } else {
          elapsedTime.value = 0;
        }
        // 启动计时器
        if (!timerInterval.value) {
          timerInterval.value = setInterval(updateTimer, 1000);
        }
      }
    });
  } catch (error) {
    console.error('开始学习会话失败:', error);
  }
};

// 发送结束学习请求到后端
const endLearningSession = async () => {
  if (!isSessionActive.value) return;
  
  try {
    await axios.get('http://localhost:8000/study/end/')
    .then(response => {
      ElMessage({type: response.data.state, message: response.data.msg});
      isSessionActive.value = false;
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    });
  } catch (error) {
    console.error('结束学习会话失败:', error);
    isSessionActive.value = false;
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const resetIdleTimer = () => {
  lastActiveTime.value = new Date();
  showIdleDialog.value = false;
};

const checkIdleTime = () => {
  if (!isSessionActive.value) return;
  
  const currentTime = new Date();
  const timeDiff = currentTime - lastActiveTime.value;
  if (timeDiff >= idleTime && !showIdleDialog.value) {
    showIdleDialog.value = true;
  }
};

const confirmContinue = () => {
  showIdleDialog.value = false;
  lastActiveTime.value = new Date();
  if (!isSessionActive.value) {
    startLearningSession();
  }
};

const cancelSession = () => {
  showIdleDialog.value = false;
  endLearningSession();
};

onMounted(() => {
  startLearningSession();
  
  document.addEventListener("mousemove", resetIdleTimer);
  document.addEventListener("keydown", resetIdleTimer);
  idleInterval.value = setInterval(checkIdleTime, 1000);
});

onBeforeUnmount(() => {
  endLearningSession();
  
  clearInterval(idleInterval.value);
  clearInterval(timerInterval.value);
  document.removeEventListener("mousemove", resetIdleTimer);
  document.removeEventListener("keydown", resetIdleTimer);
});

onActivated(() => {
  nextTick(() => {
    if (document.visibilityState === 'visible' && !isSessionActive.value) {
      startLearningSession();
    }
  });
});

onDeactivated(() => {
  if (isSessionActive.value) {
    endLearningSession();
  }
});

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden' && isSessionActive.value) {
    endLearningSession();
  } else if (document.visibilityState === 'visible' && !isSessionActive.value) {
    startLearningSession();
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

defineExpose({
  confirmContinue,
  cancelSession
});
</script>

<style scoped>
.study-tracker-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.timer-display {
  background-color: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  width: 280px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.timer-value {
  font-size: 48px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.timer-label {
  font-size: 16px;
  color: #606266;
}

.idle-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.idle-dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.idle-dialog-content p {
  margin-bottom: 20px;
  color: #303133;
}

.idle-dialog-content button {
  padding: 8px 16px;
  margin: 0 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.idle-dialog-content button:first-of-type {
  background-color: #409eff;
  color: white;
}

.idle-dialog-content button:first-of-type:hover {
  background-color: #66b1ff;
}

.idle-dialog-content button:last-of-type {
  background-color: #f5f7fa;
  color: #606266;
}

.idle-dialog-content button:last-of-type:hover {
  background-color: #e4e7ed;
}
</style>    