<template>
    <div class="slider-toolbar">
      <label >{{ title }}</label>
      <input
        type="range"
        :min="range[0]"
        :max="range[1]"
        :value="currentValue"
        :step="step"
        @input="handleSliderChange(id,$event)"
        class="slider"
      />
      <span class="current-value">{{ currentValue }}</span>
    </div>
  </template>
  
  <script>
  export default {
    name: "SliderToolbar",
    props: {
      id:{
        type:Number,
        required:true,
      },
      title: {
        type: String,
        required: true,
      },
      range: {
        type: Array,
        required: true,
        validator: (value) => value.length === 2 && value[0] <= value[1],
      },
      defaultValue: {
        type: String,
        required: true,
      },
      onSelectedValueChange: {
        type: Function,
        required: true,
      },
      step:{
        type:Number,
        required:true,
        default:1,
      }
    },
    data() {
      return {
        currentValue: this.defaultValue,
      };
    },
    methods: {
      isDecimal(num) {
          return num % 1 !== 0;
      },
      handleSliderChange(id,event) {
        let value;
        if(this.isDecimal(this.step))
          value = parseFloat(event.target.value).toFixed(2);
        else
          value = parseFloat(event.target.value)
        this.currentValue = value;
        this.onSelectedValueChange(id,this.currentValue);
      },
    },
  };
  </script>
  
  <style scoped>
.slider-toolbar {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 10px;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider {
    /* background-color: #ddd; 设置滑块轨道的颜色 */
    outline: none; /* 移除默认的轮廓 */
    cursor: pointer; /* 鼠标悬停时显示手型 */
}


/* .slider::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background-color: #4caf50;
    border-radius: 50%;
    cursor: pointer;
} */

.current-value {
    font-weight: bold;
    color: #333;
    width:35px;
}
  </style>