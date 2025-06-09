<template>
    <div style = 'display:inline-block;'>
      <select @change="handleChange" v-model="selectedOption" class = "voiselect">
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      options: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        selectedOption: this.options[0] // 默认选中第一个选项
      };
    },
    methods: {
      handleChange() {
        this.$emit('selectVoi', this.selectedOption);
      }
    }
  }
  </script>
  
  <style scoped>
.voiselect {
  appearance: none; /* 去掉默认的样式 */
  padding: 10px;
  border: 1px solid #ccc; /* 边框颜色和样式 */
  border-radius: 4px; /* 圆角 */
  background-color: #fff; /* 背景色 */
  color: #333; /* 文本颜色 */
  font-size: 16px; /* 字体大小 */
  cursor: pointer; /* 鼠标样式 */
  outline: none; /* 去掉聚焦时的边框 */
  transition: border-color 0.2s; /* 边框颜色过渡效果 */
}

.voiselect:focus {
  border-color: #007bff; /* 聚焦时的边框颜色 */
}

.voiselect option {
  padding: 10px; /* 内边距 */
}
  </style>
  