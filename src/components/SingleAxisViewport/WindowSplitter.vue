<template>
    <div class="splitter">
      <div
        v-for="(window, index) in windows"
        :key="index"
        class="window"
        :class="{ selected: selectedWindow === index }"
        @click="selectWindow(index)"
      >
        {{ window }}
      </div>
      <div class="grid">
        <div
          v-for="n in 16"
          :key="n"
          class="grid-item"
          :class="{ selected: selectedGridItem === n }"
          @click="selectGridItem(n)"
        ></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        windows: ['Window 1', 'Window 2', 'Window 3', 'Window 4'],
        selectedWindow: null,
        selectedGridItem: null,
      };
    },
    methods: {
      selectWindow(index) {
        this.selectedWindow = index;
      },
      selectGridItem(n) {
        this.selectedGridItem = n;
      },
    },
  };
  </script>
  
  <style scoped>
  .splitter {
    display: flex;
    flex-direction: column;
  }
  
  .window {
    padding: 10px;
    border: 1px solid #ccc;
    margin-bottom: 5px;
    cursor: pointer;
  }
  
  .window.selected {
    background-color: #f0f0f0;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 5px;
    margin-top: 10px;
  }
  
  .grid-item {
    width: 100%;
    height: 100px;
    background-color: #ccc;
    cursor: pointer;
  }
  
  .grid-item.selected {
    background-color: #f0f0f0;
  }
  </style>