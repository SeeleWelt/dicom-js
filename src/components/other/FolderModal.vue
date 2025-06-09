<template>
  <div class="modal" v-if="showModal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>文件夹列表</h2>
      <div v-for="folder in folders" :key="folder.id" class="folder-item">
        <span class="folder-name">{{ folder.name }}/{{ folder.id }}</span>
        <div class="buttons">
          <button @click="downloadFolder(folder.id)" class="btn">导入</button>
          <span class="progress">{{ folder.downloadFolderProcess }}%</span>
        </div>
        <div class="buttons">
          <button @click="downloadFolderDCM(folder.id)" class="btn">下载dcm</button>
          <span class="progress">{{ folder.downloadFolderDCMProcess }}%</span>
        </div>
        <div class="buttons">
          <button @click="downloadFolderJPG(folder.id)" class="btn">下载jpg</button>
        </div>
        <div class="buttons">
          <button @click="downloadFolderDelete(folder.id)" class="btn">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    folders: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showModal: true, // 控制模态框显示
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    downloadFolder(folderId) {
      this.$emit('downloadFilesFromServer', folderId);
    },
    downloadFolderDCM(folderId) {
      this.$emit('downloadFilesFromServerDCM', folderId);
    },
    downloadFolderJPG(folderId) {
      this.$emit('downloadFilesFromServerJPG', folderId);
    },
    downloadFolderDelete(folderId) {
      this.$emit('downloadFilesFromServerDelete', folderId);
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
  animation: fadeIn 0.3s ease;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close:hover {
  color: #ff4d4f;
}

.folder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.folder-item:last-child {
  border-bottom: none;
}

.folder-name {
  font-weight: bold;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #0056b3;
}

.progress {
  font-size: 0.9em;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>