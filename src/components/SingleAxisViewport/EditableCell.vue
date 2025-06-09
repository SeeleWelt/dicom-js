<template>
  <div class="editable-container" @dblclick="toggleEdit">
    <span v-if="!isEditing" class="editable-text">{{ value }}</span>
    <input
      v-else
      type="text"
      v-model="editName"
      @blur="saveEdit" 
      ref="editInput"
      class="editable-input"
      placeholder="请输入文件名"
    />
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      editName: '', // 用于存储不带后缀的文件名
      fileExtension: '' // 用于存储文件后缀
    };
  },
  methods: {
    toggleEdit() {
      this.isEditing = true;
      this.editName = this.getFileNameWithoutExtension(this.value); // 提取文件名（不带后缀）
      this.fileExtension = this.getFileExtension(this.value); // 提取文件后缀
      this.$nextTick(() => {
        this.$refs.editInput.focus();
      });
    },
    saveEdit() {
      const newName = this.editName.trim(); // 获取用户输入的新文件名
      if (newName !== this.getFileNameWithoutExtension(this.value)) {
        const newValue = `${newName}${this.fileExtension}`; // 拼接新的文件名和后缀
        this.$emit('editableUpdate', newValue);
      } else {
        ElMessage.info("文件名未修改");
      }
      this.isEditing = false;
    },
    getFileNameWithoutExtension(fileName) {
      // 提取文件名（不带后缀）
      return fileName.substring(0, fileName.lastIndexOf('.'));
    },
    getFileExtension(fileName) {
      // 提取文件后缀
      return fileName.substring(fileName.lastIndexOf('.'));
    }
  }
};
</script>

<style scoped>
.editable-container {
  display: inline-block;
  cursor: pointer;
  position: relative;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.editable-container:hover {
  border-color: #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editable-text {
  font-size: 14px;
  color: #333;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.editable-input {
  font-size: 14px;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px 8px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.editable-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}
</style>