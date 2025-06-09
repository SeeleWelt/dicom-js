<template>
    <div class="button-toolbar">
      <button @click="handleClick" class="toolbar-button">
        <img v-if='icon' :src="icon" alt="" class = 'icon'>
        {{ title }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: "ButtonToolBar",
    props: {
      id:{
        type:Number,
        required:true,
      },
      title: {
        type: String,
        required: true,
        default: "点击我", // 默认标题
      },
      icon:{
        type: String,
        required: false,
      },
      onClick: {
        type: Function,
        required: true,
      },
    },
    methods: {
      handleClick() {
        // 调用父组件传递的回调函数
        this.onClick(this.id);
      },
    },
  };
  </script>
  
  <style scoped>
  .icon{
    width: 20px;
    height: 20px;
    color:white;
  }

  .button-toolbar {
    display: inline-block;
    justify-content: center;
    align-items: center;
    margin: 10px;
    font-size:16px;
  }
  
  .toolbar-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap:10px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .toolbar-button:hover {
    background-color: #0056b3;
  }
  </style>