<template>
        <el-card class="menu-toolbar-card">
        <!-- 滑动条 -->
        <slider-tool-bar v-for="(sliderToolForMenuObject, index) in sliderToolForMenuObjects" :key="index"
                         :id="sliderToolForMenuObject.id"
                         :title="sliderToolForMenuObject.title"
                         :default-value="sliderToolForMenuObject.defaultValue"
                         :range="sliderToolForMenuObject.range"
                         :step="sliderToolForMenuObject.step"
                         :onSelectedValueChange="handleSilder">
        </slider-tool-bar>

        <!-- 色轮 -->
        <colorwheel-tool-bar v-for="(colorWheelToolForMenuObject, index) in colorWheelToolForMenuObjects" :key="index"
                             :id="colorWheelToolForMenuObject.id"
                             :title="colorWheelToolForMenuObject.title"
                             :default-value="colorWheelToolForMenuObject.defaultValue"
                             :onSelectedValueChange="handleColorWheel">
        </colorwheel-tool-bar>

        <!-- 滑块 -->
        <switch-tool-bar v-for="(switchToolForMenuObject, index) in switchToolForMenuObjects" :key="index"
                         :id="switchToolForMenuObject.id"
                         :title="switchToolForMenuObject.title"
                         :default-value="switchToolForMenuObject.defaultValue"
                         :values="switchToolForMenuObject.values"
                         :toggle="handleSwitch">
        </switch-tool-bar>

        <!-- 按钮 -->
        <button-tool-bar v-for="(buttonToolForMenuObject, index) in buttonToolForMenuObjects" :key="index"
                         :id="buttonToolForMenuObject.id"
                         :title="buttonToolForMenuObject.title"
                         :icon="buttonToolForMenuObject.icon"
                         :onClick="handeButton">
        </button-tool-bar>

        <!-- 独属于箭头工具的滑块 -->
        <switch-tool-bar v-if="showArrowHeadSwitch"
                         :id="arrowSwitchObject.id"
                         :title="arrowSwitchObject.title"
                         :default-value="arrowSwitchObject.defaultValue"
                         :values="arrowSwitchObject.values"
                         :toggle="handleArrowHeadSwitch">
        </switch-tool-bar>
    </el-card>

</template>

<script>
import SliderToolBar from './SliderToolBar.vue';
import ColorwheelToolBar from './ColorwheelToolBar.vue';
import SwitchToolBar from './SwitchToolBar.vue';
import ButtonToolBar from './ButtonToolBar.vue';


export default {
    components:{
        SliderToolBar,
        ColorwheelToolBar,
        SwitchToolBar,
        ButtonToolBar
    },
    props:{
        arrowSwitchObject:{
            type:Object,
            required:true,
        },
        id:{
            type:String,
            required:true,
        },
        sliderToolForMenuObjects:{
            type:Array,
            required:true,
        },
        colorWheelToolForMenuObjects:{
            type:Array,
            required:false,
        },
        switchToolForMenuObjects:{
            type:Array,
            required:false,
        },
        buttonToolForMenuObjects:{
            type:Array,
            required:false,
        },
        handleMenuSliders:{
            type:Function,
            required:false
        },
        handleMenuColorWheels:{
            type:Function,
            required:false
        },
        handleMenuSwitchs:{
            type:Function,
            required:false
        },
        handleMenuButton:{
            type:Function,
            required:false
        },
        showArrowHeadSwitch:{
            type:Boolean,
            required:false,
            default:false,
        }
    },
    methods:{
        handleSilder(id,value){
            this.handleMenuSliders(this.id,id,value)
        },
        handleColorWheel(id,value)
        {
            this.handleMenuColorWheels(this.id,id,value)
        },
        handleSwitch(id,value)
        {
            this.handleMenuSwitchs(this.id,id,value)
        },
        handeButton(id)
        {
            this.handleMenuButton(this.id,id)
        },
        handleArrowHeadSwitch(id,value){
            console.log(id)
            this.$emit("handleMenuArrowHeadSwitch",value)
        }
    },
};
</script>

<style scoped>
.menuToolbar{
    background-color: #ffffff;
    border:1px solid #7a7777;
    padding:5px;
}
.el-card{
    overflow: visible;
}
/* 添加箭头 */
.menu-toolbar-card::before {
  content: ''; /* 伪元素必须有 content 属性 */
  position: absolute;
  top: -10px; /* 箭头位于卡片上方 */
  left: 50%; /* 水平居中 */
  width: 0;
  height: 0;
  border-left: 10px solid transparent; /* 左边框透明 */
  border-right: 10px solid transparent; /* 右边框透明 */
  border-bottom: 10px solid #ffffff; /* 底边框为箭头颜色 */
  transform: translateX(-50%); /* 精确居中 */   
}
</style>