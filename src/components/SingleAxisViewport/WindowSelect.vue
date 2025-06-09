<template>
    <div class="grid-selector">
      <el-row style="width: 100%;">
        <el-col
          v-for="(item, index) in grid"
          :key="index"
          :span="6"
          class="grid-item"
          :class="{ highlight: isHighlighted(index) }"
          @mouseenter="highlight(index)"
          @mouseleave="clearHighlight"
          @click="handleSendRC(index)"
        >
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  export default {
    emit:[
        "handleSendRC",
    ],
    data() {
      return {
        grid: Array.from({ length: 16 }, (_, index) => ({
          row: Math.floor(index / 4),
          col: index % 4,
        })),
        highlightedIndex: null,
      };
    },
    methods: {
      highlight(index) {
        this.highlightedIndex = index;
      },
      clearHighlight() {
        this.highlightedIndex = null;
      },
      isHighlighted(index) {
        if (this.highlightedIndex === null) return false;
  
        const highlightedRow = Math.floor(this.highlightedIndex / 4);
        const highlightedCol = this.highlightedIndex % 4;
  
        const currentRow = Math.floor(index / 4);
        const currentCol = index % 4;
  
        // 判断当前单元格是否在从 (0, 0) 到 (highlightedRow, highlightedCol) 的矩形区域内
        return currentRow <= highlightedRow && currentCol <= highlightedCol;
      },

      handleSendRC(index){
        const rows = Math.floor(index / 4)
        const cols = index % 4
        this.$emit("handleSendRC",rows,cols)
      }
    },
  };
  </script>
  
  <style scoped>
  .grid-selector {
    width: 200px;
  }
  
  .grid-item {
    height: 50px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .grid-item.highlight {
    background-color: #007bff;
    color: #fff;
  }
  
  .grid-content {
    padding: 10px;
  }
  </style>