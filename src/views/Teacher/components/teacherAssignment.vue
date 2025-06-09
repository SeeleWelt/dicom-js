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
                <v-md-editor v-model="sheet.content" height="350px"></v-md-editor>
                <div class="button-group">
                  <el-button style="margin-top: 20px;" type="primary" @click="publishSheetContent(index)">发布内容</el-button>
                  <el-button style="margin-top: 20px;" @click="clearSheetContent(index)">清空内容</el-button>
                </div>
                <div v-if="sheet.history.length > 0" class="history-list">
                  <h3>历史发布：</h3>
                  <ul>
                    <li v-for="(historyItem, historyIndex) in sheet.history" :key="historyIndex">
                      <div class="preview-text">{{ historyItem.previewText }}</div>
                      <v-md-preview :text="historyItem.content"></v-md-preview>
                      <div class="action-buttons">
                        <el-button type="danger" size="mini" @click="deleteSheetHistory(index, historyIndex)">删除</el-button>
                        <el-button type="warning" size="mini" @click="editSheetHistory(index, historyIndex)">编辑</el-button>
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
import { ElMessage } from 'element-plus';

// 这里只是为了可视化一下，写死的参数，后面可以根据教师端设置修改增加或删除章节
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
      content: '',
      history: [] // 每个Sheet的历史记录
    });
  }
  if (taskSheets.length > 0) {
    activeSheet.value = taskSheets[0].id.toString();
  }
};

// 保存Sheet内容到服务器
const publishSheetContent = (sheetIndex) => {
  if (!taskSheets[sheetIndex].content.trim()) {
    ElMessage.error('请输入内容！');
    return;
  }
  const previewText = `发布于: ${new Date().toLocaleString()}`;
  taskSheets[sheetIndex].history.push({
    content: taskSheets[sheetIndex].content,
    previewText: previewText
  });
  // 添加保存到服务器的逻辑---不懂
  taskSheets[sheetIndex].content = '';
  ElMessage.success('内容发布成功！');
};

// 清空Sheet内容
const clearSheetContent = (sheetIndex) => {
  taskSheets[sheetIndex].content = '';
};

// 删除Sheet历史记录
const deleteSheetHistory = (sheetIndex, historyIndex) => {
  taskSheets[sheetIndex].history.splice(historyIndex, 1);
  ElMessage.success('历史记录删除成功！');
};

// 编辑Sheet历史记录
const editSheetHistory = (sheetIndex, historyIndex) => {
  taskSheets[sheetIndex].content = taskSheets[sheetIndex].history[historyIndex].content;
  taskSheets[sheetIndex].history.splice(historyIndex, 1);
  ElMessage.success('历史记录已加载到编辑框，请修改！');
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

.title {
  margin-left: 20px;
  font-size: 24px;
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

.button-group {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
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