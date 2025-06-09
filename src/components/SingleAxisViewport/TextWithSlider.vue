<template>
    <div class="container">
        <div class="secContainer">

        </div>
        <!-- 左下角显示文字 -->
        <div class="text-container cantSelect" @mousedown.prevent>
            <el-text type="primary">
              缩放倍数：{{ zoomScale.toFixed(2) }}
            </el-text>
            <el-text type="primary">
              窗口窗位：{{ WW }} &MediumSpace; {{ WL }}
            </el-text>
            <el-text type="primary">
              旋转角度：{{ rotation.toFixed(2) }}°
            </el-text>
        </div>
    
        <!-- 右侧竖直的 Slider -->
        <div class="slider-container" 
        @click.stop
        @mousedown.stop>
            <el-slider
            v-model="sliderValue"
            vertical
            style="flex:1"
            :min="min"
            :max="max"
            @input="onSliderChange"
            />
        </div>
        <div class="slider-value cantSelect" @mousedown.prevent>
            {{ sliderValue }}/{{ max }}
            
        </div>
    </div>
  </template>
  
  <script>
  export default {
    props:{
        min:{
            type:Number,
            default:1
        },
        max:{
            type:Number,
            default:100
        },
        curSliceIndex:{
            type:Number,
            default:50
        },
        zoomScale:{
          type:Number,
          default:1,
        },
        WW:{
          type:Number,
          defalut:1600,
        },
        WL:{
          type:Number,
          defalut:500,
        },
        rotation:{
          type:Number,
          defalut:0,
        }
    },
    mounted(){
        this.sliderValue=this.curSliceIndex
    },
    data() {
      return {
        // 滑块的当前值
        sliderValue:1,
      };
    },
    methods: {
      onSliderChange() {
        this.$emit("handleSliceChange",this.sliderValue)
      },
    },
  };
  </script>
  
<style scoped>
.container {
width: 100%;
height: 100%;
position: absolute;
top: 0%;
}

.text-container {
position: absolute;
text-align: left;
left:2%;
bottom:2%;
display: flex;
flex-direction: column;
gap:10px;
}

.text-line {
margin-bottom: 5px;
}

.slider-container {
height: 100%;
position: absolute;
right:0%;
display: flex;
flex-direction: column;
align-items: center;

}

.slider-value {
    position: absolute;
    right:10%;
    bottom:10%;
    font-size:16px;
    color:azure;
}

.cantSelect{
  user-select: none;
  -webkit-user-select: none; /* Webkit 浏览器 */
  -moz-user-select: none; /* Firefox 浏览器 */
  -ms-user-select: none; /* IE10+ 浏览器 */
}

:deep(.el-slider__runway) {
  background-color: transparent; /* 轨道颜色设置为透明 */
}

:deep(.el-slider__bar) {
  background-color: transparent; /* 已滑动部分颜色设置为透明 */
}


</style>