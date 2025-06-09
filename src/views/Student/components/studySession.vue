<template>
  <div class="container">
    <div class="main-content">
      <!-- Header Section -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" style="height: 50px; width: 150px;" alt="Logo" />
        </div>
      </div>

      <!-- Content Section -->
      <div class="content">
        <!-- Sheet 导航 -->
        <div class="sheet-navigation">
          <el-tabs v-model="activeSheet" type="card">
            <el-tab-pane
              v-for="(sheet, index) in taskSheets"
              :key="sheet.id"
              :label="sheet.name"
            >
              <div class="box">
                <h2>{{ sheet.name }}</h2>
                <!-- 内容显示区域 -->
                <v-md-preview :text="sheet.currentContent"></v-md-preview>
                <!-- 历史记录区域 -->
                <div v-if="sheet.history.length > 0" class="history-list">
                  <h3>历史发布：</h3>
                  <ul>
                    <li v-for="(historyItem, historyIndex) in sheet.history" :key="historyIndex">
                      <div class="preview-text">{{ historyItem.previewText }}</div>
                      <v-md-preview :text="historyItem.content"></v-md-preview>
                      <div class="action-buttons">
                        <el-button type="primary" size="mini" @click="viewHistoryContent(index, historyIndex)">查看</el-button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
// 同样写死了，加入数据后可以将数值删除
const sessionCount = ref(3); // 固定章节数为3
const taskSheets = reactive([]); // 任务工作表数组
const activeSheet = ref('1'); // 当前激活的Sheet

// 初始化任务工作表
onMounted(() => {
  initializeSheets();
});

const initializeSheets = () => {
  taskSheets.length = 0; // 清空现有数据
  for (let i = 0; i < sessionCount.value; i++) {
    taskSheets.push({
      id: i + 1,
      name: `任务/章节Sheet${i + 1}`,
      currentContent: `# 章节 ${i + 1} 内容\n这里是第 ${i + 1} 章的学习内容。`,
      history: [
        {
          content: `# 章节 ${i + 1} 内容（旧版本）\n这里是第 ${i + 1} 章的旧版本学习内容。`,
          previewText: `发布于: ${new Date().toLocaleString()}`
        }
      ]
    });
  }
};

// 查看历史内容
// 添加后端调阅教师发布teachertask(内容)接口---不太懂
const viewHistoryContent = (sheetIndex, historyIndex) => {
  taskSheets[sheetIndex].currentContent = taskSheets[sheetIndex].history[historyIndex].content;
};
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

.history-list {
  margin-top: 20px;
}

.history-list h3 {
  margin-top: 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 5px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.preview-text {
  font-weight: bold;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 5px;
}
</style>