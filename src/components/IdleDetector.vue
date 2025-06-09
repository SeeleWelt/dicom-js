<template>
  <div v-if="showIdleDialog" class="idle-dialog">
    <div class="idle-dialog-content">
      <p>您已长时间未操作，是否继续？</p>
      <button @click="confirmContinue">继续</button>
      <button @click="cancelSession">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount,defineExpose  } from 'vue';

const lastActiveTime = ref(new Date());
const idleTime = 300000; // 5 分钟无操作
const showIdleDialog = ref(false);
const learningTime = ref(0); // 学习时长（秒）
let idleInterval = ref(null);

const resetIdleTimer = () => {
  lastActiveTime.value = new Date();
  showIdleDialog.value = false;
};

const checkIdleTime = () => {
  const currentTime = new Date();
  const timeDiff = currentTime - lastActiveTime.value;
  if (timeDiff >= idleTime && !showIdleDialog.value) {
    showIdleDialog.value = true;
  }
};

const confirmContinue = () => {
  showIdleDialog.value = false;
  learningTime.value += Math.floor((new Date() - lastActiveTime.value) / 1000);
  lastActiveTime.value = new Date();
};

const cancelSession = () => {
  showIdleDialog.value = false;
};

onMounted(() => {
  document.addEventListener("mousemove", resetIdleTimer);
  document.addEventListener("keydown", resetIdleTimer);
  idleInterval.value = setInterval(checkIdleTime, 1000);
});

onBeforeUnmount(() => {
  clearInterval(idleInterval.value);
  document.removeEventListener("mousemove", resetIdleTimer);
  document.removeEventListener("keydown", resetIdleTimer);
});

defineExpose({
  confirmContinue,
  cancelSession
});
</script>

<style scoped>
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
}

.idle-dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
</style>