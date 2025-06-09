<template>
  <div class="toolbar">
    <!-- 重置工具 -->
    <el-tooltip 
      content="重置视图"
      placement="top"
      effect="customized"
      :hide-after='0'
      
    >
      <el-button @click="this.handleReset" style="height: 40px;" :type="el_button_type">
        <img src="svg/重置.svg" alt="重置视图" class = 'icon_left'>
      </el-button>
    </el-tooltip>

    <!-- 轴向，矢向，冠向 -->
    <!-- <div>
      <div class="div_left">
        <button class = 'button_left'>
          <img :src="orientationIcon" alt="" class = 'icon_left'>
          <span class="tooltiptext_left">{{ orientation }}</span>
        </button>
      </div>

      <div class="div_right">
        <button @click="orientationObject.dropdownClickCallback" class = 'button_right'>
          <img src="svg/下拉.svg" alt="" class = 'icon_right'>
          <span class="tooltiptext_right">选择</span>
        </button>
        <list-tool-bar v-if="orientationObject.showDropdown" :title="''" :default-value-string="orientation" 
          :values="Object.keys(orientationNameAndIcons)"
          :onSelectedValueChange = 'orientationObject.dropdownCallback' class='dropdown'>
        </list-tool-bar>
      </div>
    </div> -->
    <el-tooltip
        effect="customized"
        :content="orientation"
        placement="top"
        :hide-after='0'
      >
      <el-dropdown split-button  @command="handleOrientationDropdownCallback" size="large" :type="el_button_type"
       >
        <img :src="orientationIcon" alt="" class = 'icon_left'>
        <template #dropdown>
          <el-dropdown-menu >
            <el-dropdown-item  v-for="(orientationName) in Object.keys(orientationObjects) "
              :key="orientationName"
              :command="orientationName"
              :disabled="orientationDisable"
              class="selected_dropdown"
              >
              {{ orientationName }}
              <img :src=selected_dropdown_icon alt="" v-if="orientation===orientationName" class="icon">
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-tooltip>

    <!-- 这里是窗口调整 -->
    <el-tooltip
        effect="customized"
        :content="curWindowName"
        placement="top"
        :hide-after='0'
      >
      <el-dropdown split-button  size="large" @command="handMultiWindows" :type="el_button_type">
        <img :src="curWindowIcon" alt="" class = 'icon_left'>
        <template #dropdown>
          <el-dropdown-menu >
            <el-dropdown-item  v-for="(windowName) in Object.keys(multiWindows) "
              :key="windowName"
              :command="windowName"
              class="selected_dropdown"
              >
              <img :src="multiWindows[windowName].icon" alt="" class = 'icon_left'>
              {{ windowName }}
              <img :src="selected_dropdown_icon" alt="" v-if="windowName===curWindowName" class="icon">
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-tooltip>

    <!-- 思路是一个div包含两个button，左边的button是都有的，右边的下拉button用户自己决定 -->
     <!-- 这是基础操作工具 -->
    <div  v-for="(toolobject,index) in baseManipulationToolIconObjects" :key = 'index' >
      <el-tooltip
        effect="customized"
        :content="toolobject.zh"
        placement="top"
        :hide-after='0'
      >
        <el-button 
        @click="handleChangeActiveManipulationTool(toolobject.toolName,index)"
        :class="{toolSelected : toolobject.toolSelected}"
        :type="el_button_type"
        >
          <img :src="toolobject.icon" alt="" class="icon">
        </el-button>
      </el-tooltip>
    </div>

    <!-- 这里是windowlevel调整工具 -->
    <div class="button_div">
      <el-tooltip
        effect="customized"
        :content="windowLevelTool.zh"
        placement="top"
        :hide-after='0'
      >
        <el-dropdown 
          size="large"
          split-button 
          @click="handleChangeActiveWLTool(windowLevelTool.toolName)"
          @command="handleWindowLevelDropdownCallback"
          :max-height="300"
          :class={toolSelected:windowLevelTool.toolSelected}
          :type="el_button_type"
        >
          <img src="svg/窗口窗位.svg" alt="" class="icon">
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="voiDataName" 
              v-for="(voiDataName) in Object.keys(voiData)"
              :key="voiDataName"
              class="selected_dropdown"
              >
                {{ voiDataName }}
                <img :src="selected_dropdown_icon" alt="" v-if="voiDataName===curVOIDateName" class="icon">
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
    
    <img src="svg/工具栏分割线.svg" alt="" class = 'icon'>

    <!-- 这里是基础绘制工具 -->
    <div  v-for="(toolobject,index) in baseAnnotationToolIconObjects" :key = 'index' class='button_div'
    :class="{toolSelected : toolobject.toolSelected}">
      <el-tooltip
        effect="customized"
        :content="toolobject.zh"
        placement="top"
        :hide-after='0'
      >
        <div>
          <el-button 
            @click = 'this.handleChangeActiveAnnotationTool(toolobject.toolName,index)'
            :color="button_color"
            :type="el_button_type"
            plain
          >
          <img :src="toolobject.icon" alt="" class = 'icon_left'>
          </el-button>
        </div>
      </el-tooltip>
      <div class="menu_button button_div" >
        <el-tooltip
        effect="customized"
        content="配置"
        placement="top"
        :hide-after='0'
        >
          <el-button 
            @click = "toolobject.menuClickCallback(index)"
            class="div_right "
            :color="button_color"
            :type="el_button_type"
          >
            <img src="svg/下拉.svg" alt="" class = 'icon_right' >
          </el-button>
        </el-tooltip>
        <menu-tool-bar v-if="toolobject.showMenu" 
        :id="toolobject.toolName"
        :slider-tool-for-menu-objects="ToolsMenu[toolobject.toolName].sliderObjects"
        :color-wheel-tool-for-menu-objects="ToolsMenu[toolobject.toolName].colorWheelObjects"
        :switch-tool-for-menu-objects="ToolsMenu[toolobject.toolName].switchObjects"
        :button-tool-for-menu-objects="ToolsMenu[toolobject.toolName].buttonObjects"
        :handle-menu-sliders="handleMenuSliders"
        :handle-menu-color-wheels="handleMenuColorWheels"
        :handle-menu-switchs="handleMenuSwitchs"
        :handle-menu-button="handleMenuButton"
        :show-arrow-head-switch="toolobject.toolName==='ArrowAnnotate'"
        :arrowSwitchObject="arrowSwitchObject"
        @handleMenuArrowHeadSwitch="handleMenuArrowHeadSwitch"
        class="menu"
        ></menu-tool-bar>
      </div>
    
    </div>

    <img src="svg/工具栏分割线.svg" alt="" class = 'icon'>

    <!-- MPR的十字准线工具 -->
    <div class="button_div">
      <el-tooltip
        effect="customized"
        :content="crosshairTool.zh"
        placement="top"
        :hide-after='0'
       
      >
        <el-dropdown
        size="large"
        @click="handleChangeActiveCrosshairTool(crosshairTool.toolName)"
        :class="{toolSelected : crosshairTool.toolSelected}"
        split-button
        :disabled="crosshairDisabled"
        :button-props="{
        color:button_color,
        type:el_button_type
        }"
         @command="handleChangeSlabThickness"
        >
          <img src="svg/crosshair.svg" alt="" class="icon">
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
              v-for="(slabThicknessBlendMode) in slabThicknessBlendModes"
              :command="slabThicknessBlendMode" 
              :key="slabThicknessBlendMode"
              class="selected_dropdown"
              >
                {{ slabThicknessBlendMode }}
                <img :src="selected_dropdown_icon" alt="" v-if="slabThicknessBlendMode===curSlabThicknessBlendMode" class="icon">
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>

    <!-- 同步器选择 -->
    <div class="button_div">
      <el-tooltip
        effect="customized"
        :content="'同步选择'"
        placement="top"
        :hide-after='0'
      >
        <el-dropdown 
          size="large"
          split-button 
          :type="el_button_type"
          :button-props="{color:button_color}"
        >
          <img src="svg/同步器.svg" alt="" class="icon">
          <template #dropdown>
            <el-dropdown-menu style="padding: 20px;width: 200px;">
              <el-row justify="space-evenly" align="middle">
                <el-col :span="12">
                  <el-text  style="color: #3498db; font-weight: bold;">
                    VOI
                  </el-text>
                </el-col>
                
                <el-col :span="12">
                  <el-switch
                    inline-prompt
                    v-model="voiSynchronizeValue"
                    active-text="同步"
                    inactive-text="不同步"
                    @change="handleVoiSynchronizeValue"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    size="large"
                  />
                </el-col>
              </el-row>

              <el-row justify="space-evenly" align="middle">
                <el-col :span="12">
                  <el-text style="color: #e67e22; font-weight: bold;">
                    缩放平移
                  </el-text>
                </el-col>
                <el-col :span="12">
                  <el-switch
                    v-model="zoomPanSynchronizeValue"
                    active-text="同步"
                    inactive-text="不同步"
                    @change="handleZoomPanSynchronizeValue"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    inline-prompt
                    size="large"
                  />
                </el-col>
              </el-row>
              
              <el-row justify="space-evenly" align="middle">
                <el-col :span="12">
                  <el-text style="color: #e67e22; font-weight: bold;">
                    强度投影
                  </el-text>
                </el-col>
                <el-col :span="12">
                  <el-switch
                    v-model="slabThicknessSynchronizeValue"
                    active-text="同步"
                    inactive-text="不同步"
                    @change="handleSlabThicknessSynchronizeValue"
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    inline-prompt
                    size="large"
                  />
                </el-col>
              </el-row>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
    
  </div>
</template>

<script>
import {  
  // 操作类
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  PanTool,
  DragProbeTool,
  PlanarRotateTool,
  
  // 注释类
  LengthTool,
  BidirectionalTool,
  ArrowAnnotateTool,
  RectangleROITool,
  EllipticalROITool,
  CircleROITool,
  // 十字准线
  CrosshairsTool,
} from '@cornerstonejs/tools';
import MenuToolBar from '../other/MenuToolBar.vue';
// 一些常见的VOI
const voiData = {
  "默认":null,
  "肺窗": { WW: 1750, WL: -525 }, // 中间值
  "纵膈窗": { WW: 300, WL: 40 }, // 中间值
  "骨窗": { WW: 1250, WL: 300 }, // 中间值
  "软组织窗": { WW: 400, WL: 50 }, // 中间值
  "脑组织窗": { WW: 90, WL: 35 }, // 中间值
  "垂体及蝶鞍区": { WW: 225, WL: 47 }, // 中间值
  "脑出血": { WW: 110, WL: 40 }, // 中间值
  "脑梗死": { WW: 60, WL: 40 }, // 单一值
  "颌面部眼眶": { WW: 200, WL: 35 }, // 中间值
  "喉颈部、鼻咽、咽喉部": { WW: 325, WL: 40 }, // 中间值
  "腹部": { WW: 400, WL: 40 }, // 中间值
  "肝脾": { WW: 150, WL: 37 }, // 中间值
  "肾脏": { WW: 250, WL: 30 }, // 中间值
  "胰腺": { WW: 325, WL: 42.5 }, // 中间值
  "脊柱及四肢": { WW: 275, WL: 40 }, // 中间值
  "常规脊柱扫描": { WW: 275, WL: 40 }, // 中间值
};

export default {
  components:{
    MenuToolBar,
  },
  emits: [
    'handleChangeActiveTool',
    'handleWindowLevelDropdownCallback',
    'handleOrientationDropdownCallback',
    'handleMenuSliders',
    'handleMenuColorWheels',
    'handleMenuSwitchs',
    'handleMenuButton',
    'handMultiWindows',
    'handleVoiSynchronizeValue',
    'handleZoomPanSynchronizeValue',
    'handleSlabThicknessSynchronizeValue',
    "handleChangeSlabThickness",
    "handleArrowHeadSwitch",
  ],
  props:{
    handleReset:{
      type:Function,
      required:false,
    },

    orientationDisable:{
      type:Boolean,
      required:true,
      default:false
    },

    crosshairDisabled:{
      type:Boolean,
      default:true,
    },

  },
  mounted(){
    document.addEventListener('click',this.handleHiddenMenu,false)
  },
  data(){
    return{
      slabThicknessBlendModes:['最大强度投影',"最小强度投影",'平均强度投影'],
      curSlabThicknessBlendMode:"最大强度投影",
      slabThicknessSynchronizeValue:false,
      selected_dropdown_icon:"svg/对.svg",
      el_button_type:"",
      button_color:"",
      zoomPanSynchronizeValue:false,
      voiSynchronizeValue:false,
      // voi
      voiData : voiData,
      curVOIDateName : '默认',

      // 方向
      orientation:'轴向',
      orientationIcon:"svg/axial.svg",
      orientationObjects:
      {
        '轴向':{icon:"svg/axial.svg"},
        '矢向':{icon:"svg/sagittal.svg"},
        '冠向':{icon:"svg/coronal.svg"},
      },

      //=============================窗口===================================
      curWindowName:"single",
      curWindowIcon:"svg/单窗口.svg",
      // 多窗口-窗口名称，窗口数量，窗口ICON
      multiWindows : {
          "single":{windowNumbers:1,icon:"svg/单窗口.svg",},
          "MPR":{windowNumbers:3,icon:"svg/三窗口.svg",},
          '3D':{windowNumbers:1,icon:"svg/3d.svg"},
      },

      ToolsMenu : {
        [LengthTool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示注释',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        [BidirectionalTool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示工具',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        [ArrowAnnotateTool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示工具',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        [RectangleROITool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示工具',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        [EllipticalROITool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示工具',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        [CircleROITool.toolName]:{
          sliderObjects:[
            {title:'线宽',defaultValue:'1',range:['1','10'],step:1,id:0},
            {title:'Dash',defaultValue:'0',range:['0','10'],step:1,id:1}
          ],
          colorWheelObjects : [
            {title:'未选中时的颜色',defaultValue:"#FFFF00",id:0},
            {title:'高亮时的颜色',defaultValue:"#00FF00",id:1},
            {title:'选中时的颜色',defaultValue:"#00DC00",id:2},
            {title:'锁定时的颜色',defaultValue:"#D1C15A",id:3},
          ],
          switchObjects:[
            {id:0,title:'显示文字',defaultValue:'显示',values:['不显示','显示']},
            {id:1,title:'显示工具',defaultValue:'显示',values:['不显示','显示']}
          ],
          buttonObjects:[
            {id:0,title:'删除该工具注释',icon:"svg/删除.svg"},
            {id:1,title:'删除所有工具注释',icon:"svg/删除.svg"}
          ],
        },
        
      },

      windowLevelTool:{
        toolName:WindowLevelTool.toolName,zh:'窗口工具',icon:"svg/窗口窗位.svg",toolSelected:false,
        dropdown:true,dropdownZH:'常用部位',dropdownClickCallback:this.handleWindowLevelClickDropdownCallback,
        showDropdown:false,dropdownCallback:this.handleWindowLevelDropdownCallback,
      },
      crosshairTool:{
        toolName:CrosshairsTool.toolName,zh:'十字工具',icon:"svg/crosshair.svg",toolSelected:false,
      },
      // 基础操作工具
      baseManipulationToolIconObjects:[
        {toolName:PanTool.toolName,zh:'移动工具',icon:"svg/移动.svg",dropdown:false,toolSelected:false},
        {toolName:ZoomTool.toolName,zh:'缩放工具',icon:"svg/缩放.svg",dropdown:false,toolSelected:false},
        {toolName:StackScrollTool.toolName,zh:'翻页工具',icon:"svg/翻页.svg",dropdown:false,toolSelected:false},
        {toolName:DragProbeTool.toolName,zh:'探针工具',icon:"svg/探针.svg",dropdown:false,toolSelected:false},
        {toolName:PlanarRotateTool.toolName,zh:'旋转工具',icon:"svg/旋转.svg",dropdown:false,toolSelected:false},
      ],

      //  基础注释工具，这里的每个工具都需要一个下拉菜单来实现线条粗细的设置，以及颜色的更改
      baseAnnotationToolIconObjects:[
        {
          toolName:LengthTool.toolName,zh:'直线工具',icon:"svg/annotation/直线.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false
        },
        {
          toolName:BidirectionalTool.toolName,zh:'双向工具',icon:"svg/annotation/十字线.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false
        },
        {
          toolName:ArrowAnnotateTool.toolName,zh:'箭头标注工具',icon:"svg/annotation/箭头工具.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false
        },
        {
          toolName:RectangleROITool.toolName,zh:'矩形工具',icon:"svg/annotation/矩形工具.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false,
        },
        {
          toolName:EllipticalROITool.toolName,zh:'椭圆工具',icon:"svg/annotation/椭圆工具.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false,
        },
        {
          toolName:CircleROITool.toolName,zh:'圆形工具',icon:"svg/annotation/圆形工具.svg",menu:true,toolSelected:false,
          menuZH:'配置',menuClickCallback:this.handlClickMenuCallback,
          showMenu:false,
        },
      ],

      arrowSwitchObject:{id:1,title:"头部形状",values:["圆点","箭头"],defaultValue:"箭头"}
    }
  },

  methods: {
    handleChangeSlabThickness(value){
      this.curSlabThicknessBlendMode=value
      this.$emit("handleChangeSlabThickness",value)
    },
    
    handleVoiSynchronizeValue()
    {
      this.$emit('handleVoiSynchronizeValue',this.voiSynchronizeValue)
    },

    handleZoomPanSynchronizeValue()
    {
      this.$emit('handleZoomPanSynchronizeValue',this.zoomPanSynchronizeValue)
    },

    handleSlabThicknessSynchronizeValue(){
      this.$emit('handleSlabThicknessSynchronizeValue',this.slabThicknessSynchronizeValue)
    },

    handMultiWindows(name){
      this.curWindowIcon=this.multiWindows[name].icon
      this.curWindowName=name
      this.$emit('handMultiWindows',name,this.multiWindows[name].windowNumbers)
    },

    handleTest(id){
      console.log(id)
    },
    /**
     * @功能 - 首先修改slider的默认值，这样每次渲染后才是改变后的数值；然后发送一个事件给父组件，提供以下三个参数
     * @param menuId - 菜单的ID号，这里设置成对应的工具的名称，因为一个工具对应一个菜单
     * @param sliderId - 每个菜单中slider的ID号，用于区别slider的功能，比如0表示线宽
     * @param value - 指定菜单号以及指定sliderID的slider的当前数值
     */
    handleMenuSliders(menuId,sliderId,value){
      // 这是为了改变默认值，让工具栏的滑块的数值每次都实时更新
      this.ToolsMenu[menuId].sliderObjects[sliderId].defaultValue = String(value)
      // 发送事件给父组件
      this.$emit('handleMenuSliders',menuId,sliderId,value)
    },

    handleMenuColorWheels(menuId,colorWheelId,value)
    {
      this.ToolsMenu[menuId].colorWheelObjects[colorWheelId].defaultValue = String(value)
      this.$emit('handleMenuColorWheels',menuId,colorWheelId,value)
    },

    handleMenuSwitchs(menuId,switchId,value){
      if(value)
        this.ToolsMenu[menuId].switchObjects[switchId].defaultValue = this.ToolsMenu[menuId].switchObjects[switchId].values[1]
      else
        this.ToolsMenu[menuId].switchObjects[switchId].defaultValue = this.ToolsMenu[menuId].switchObjects[switchId].values[0]
      this.$emit('handleMenuSwitchs',menuId,switchId,value)
    },
    
    handleMenuButton(menuId,buttonid)
    {
      this.$emit('handleMenuButton',menuId,buttonid);
    },

    handleMenuArrowHeadSwitch(value)
    {
      if(value)
        this.arrowSwitchObject.defaultValue = this.arrowSwitchObject.values[1]
      else
        this.arrowSwitchObject.defaultValue = this.arrowSwitchObject.values[0]
      this.$emit("handleArrowHeadSwitch",value)
    },

    /**
     * @功能 - 显示指定工具（由index决定）的菜单
     * @param index - 要显示的菜单的index，类似于标号
     */
    handlClickMenuCallback(index){
      this.baseAnnotationToolIconObjects[index].showMenu = !this.baseAnnotationToolIconObjects[index].showMenu
    },
    
    // ============================== 以下是修改被选中工具的相关代码 ==============================================
    handleChangeActiveManipulationTool(toolName,index){
      // 取消所有工具的选中状态
      this.baseManipulationToolIconObjects.forEach(baseManipulationToolIconObject=>{
        baseManipulationToolIconObject.toolSelected = false
      })
      this.baseAnnotationToolIconObjects.forEach(baseAnnotationToolIconObject=>{
        baseAnnotationToolIconObject.toolSelected = false
      })
      this.windowLevelTool.toolSelected=false
      this.crosshairTool.toolSelected = false
      // 为指定的工具添加选中状态
      this.baseManipulationToolIconObjects[index].toolSelected = true
      this.$emit('handleChangeActiveTool',toolName)
    },
    handleChangeActiveWLTool(toolName){
      // 取消所有工具的选中状态
      this.baseManipulationToolIconObjects.forEach(baseManipulationToolIconObject=>{
        baseManipulationToolIconObject.toolSelected = false
      })
      this.baseAnnotationToolIconObjects.forEach(baseAnnotationToolIconObject=>{
        baseAnnotationToolIconObject.toolSelected = false
      })
      this.crosshairTool.toolSelected = false
      // 为指定的工具添加选中状态
      this.windowLevelTool.toolSelected=true
      this.$emit('handleChangeActiveTool',toolName)
    },
    handleChangeActiveAnnotationTool(toolName,index){
      // 取消所有工具的选中状态
      this.baseManipulationToolIconObjects.forEach(baseManipulationToolIconObject=>{
        baseManipulationToolIconObject.toolSelected = false
      })
      this.baseAnnotationToolIconObjects.forEach(baseAnnotationToolIconObject=>{
        baseAnnotationToolIconObject.toolSelected = false
      })
      this.windowLevelTool.toolSelected=false
      this.crosshairTool.toolSelected = false
      // 为指定的工具添加选中状态
      this.baseAnnotationToolIconObjects[index].toolSelected = true
      this.$emit('handleChangeActiveTool',toolName)
    },
    handleChangeActiveCrosshairTool(toolName){
      // 取消所有工具的选中状态
      this.baseManipulationToolIconObjects.forEach(baseManipulationToolIconObject=>{
        baseManipulationToolIconObject.toolSelected = false
      })
      this.baseAnnotationToolIconObjects.forEach(baseAnnotationToolIconObject=>{
        baseAnnotationToolIconObject.toolSelected = false
      })
      // 为指定的工具添加选中状态
      this.windowLevelTool.toolSelected=false
      this.crosshairTool.toolSelected = true
      this.$emit('handleChangeActiveTool',toolName)
    },


    handleWindowLevelClickDropdownCallback(index){
      // 显示指定位置的下拉列表
      this.baseManipulationToolIconObjects[index].showDropdown = !this.baseManipulationToolIconObjects[index].showDropdown
    },

    handleWindowLevelDropdownCallback(value)
    { 
      // 更新选中的voiDateName
      this.curVOIDateName = value
      // 发射一个事件给父组件，并且传递value。
      this.$emit('handleWindowLevelDropdownCallback',value)
    },

    handleOrientationDropdownClickCallback(){
      this.orientationObject.showDropdown = !this.orientationObject.showDropdown
    },

    handleOrientationDropdownCallback(value){
      this.orientation = value
      this.orientationIcon = this.orientationObjects[value].icon
      // Object.keys(this.orientationObjects)
      this.$emit('handleOrientationDropdownCallback',value)
    },


    handleHiddenMenu(e){
      if(!e.target.closest('.menu_button') && !e.target.closest('.menu'))
      {
        this.baseAnnotationToolIconObjects.forEach(toolObject=>
          toolObject.showMenu = false
        )
      }
    }
  }
};
</script>

<style scoped>
/* 所有图标的样式 */
.icon{
  width: 20px;
}
.icon_left
{
  width: 20px;
  height: 20px;
}
.icon_right{
  width: 10px;
  height: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}

div.button_div{
  display: flex;
  position: relative;
}

.el-button{
  height:100%
}

.tooltiptext_left,
.tooltiptext_right {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  padding: 5px 0;

  /* 位置 */
  position: absolute;
  z-index: 1;
  bottom: 125%; /* 超出图标下方 */
  left: 50%;
  margin-left: -60px;
}

.div_right{
  position: relative;
  width: 13px;
}

.menu{
  position: absolute;
  top: 125%;          /* 子元素的 top 设置为父元素的高度 */
  left: -135px;
  z-index:1000;
  width:300px;
}

/* 工具被选中时的样式 */
.toolSelected {
  box-shadow: 0 0 10px 5px rgba(1, 243, 94, 0.8);
  transition: box-shadow 0.1s ease-in-out;
}

:deep(.selected_dropdown){
  width: 130px;
  display: flex;
  justify-content: space-between;
  padding:10px;
}

:global(.el-popper.is-customized) {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}
:global(.el-popper.is-customized .el-popper__arrow::before) {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}

</style>