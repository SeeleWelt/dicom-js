<template>
    <el-container class="container-layout">
      <el-aside class="side-panel" width="220px">
        <el-row
        :justify="space-around">
          <el-col :span="12">
            <el-tooltip
              effect="customized"
              content="上传DICOM文件和标注"
              placement="top"
              :hide-after='0'
            >
              <el-button @click="handleDescriptionDialogVisible">
                <el-icon><UploadFilled /></el-icon>
              </el-button>
            </el-tooltip>
          </el-col>
          <el-col :span="12">
            <el-tooltip
              effect="customized"
              content="仅上传标注"
              placement="top"
              :hide-after='0'
            >
              <el-button @click="handleUploadAnnotationOnlyFormVisible">
                <el-icon><UploadFilled /></el-icon>
              </el-button>
            </el-tooltip>
          </el-col>
        </el-row>
        
        <router-link to="/dicomsFromServer">导入</router-link>
        <table-input 
        @handleRadioChange="handleRadioChange"
        @handleDbclickTable="handleDbclickTable"
        @handleDICOMDIR="handleDICOMDIR"
        @handleDICOMDIR2="handleDICOMDIR2"
        @handleEnd="handleEnd"
        ></table-input>
      </el-aside>
      <el-main class="main-content">

        <el-tabs
          v-model="curTabDicomsName"
          type="card"
          class="demo-tabs"
          editable
          @edit="handleTabsEdit"
          style="height:100%"
        >
          <el-tab-pane
            :key="fixedTab.name"
            :label="fixedTab.title"
            :name="fixedTab.name"
            style="height: 100%;"
            :closable="false"
          >
          <el-header class="header">
            <el-dropdown split-button>
              窗口选择
              <template #dropdown>
                <el-dropdown-menu>
                  <WindowSelect
                  @handleSendRC="handleSendRC"></WindowSelect>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <img src="svg/工具栏分割线.svg" alt="" class = 'icon'>
            <MulIconToolBar
              :handle-reset="handleReset"
              @handleChangeActiveTool="handleChangeActiveTool"
              @handleWindowLevelDropdownCallback="handleWindowLevelDropdownCallback"
              @handleOrientationDropdownCallback="handleOrientationDropdownCallback"
              @handleVoiSynchronizeValue="handleVoiSynchronizeValue"
              @handle-zoom-pan-synchronize-value="handleZoomPanSynchronizeValue"
            ></MulIconToolBar>

            
          </el-header>
            <GridLayout
              :layout="layout"
              :col-num="columns"
              :row-height="rowHeight"
              :max-rows="rows"
              :is-draggable="false"
              :is-resizable="false"
              :is-mirrored="false"
              :vertical-compact="true"
              :margin="[0, 0]" 
              :use-css-transforms="true"
              :style="{height:totalHeight+'px',width:'80%'}"
              >
              <GridItem
                v-for="item in layout"
                v-show="item.show"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :class="{selected:item.selected}"
                @dblclick="handleDoubleClick(item)"
                @dragover.prevent
                @dragenter.prevent
                @drop="drop($event,item.i)"
                @click="handleClickVueGridItem(item.i)"
                >
                <MulAxisViewport
                @click="handleClickMulAxisViewport(item.i)"
                @handleOrigianlWL="handleOrigianlWL"
                @handleCurViewportId="handleCurViewportId"
                :input_file-set="item.fileSet"
                :input_file-image-ids="item.fileImageIds"
                :original_orientation="item.original_orientation"
                :prefix-id="String(item.i)"
                v-if="item.fileSet.length"
                ></MulAxisViewport>
              </GridItem>
            </GridLayout>
          </el-tab-pane>

          <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
            style="height: 100%;"
          >
          <!-- 要求每个工具组，渲染器，视图ID，volumeID，segmentId都是独立的 -->
            <SingleAxisViewport 
            :input_file-set="dirFileSetObject[item.dir]" 
            :input_fileImageIds="dirFileImageIdsObject[item.dir]"
            :original_orientation="dirOrientationObject[item.dir]"
            :prefixId="item.prefixId"
            v-show="item.show">
            </SingleAxisViewport>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>

        <!-- folder+annotation的表单 -->
    <div>
      <!-- 表单弹窗 -->
      <el-dialog
        v-model="descriptionDialogVisible"
        title="填写描述"
        width="30%"
      >
        <el-form ref="form" :model="uploadFormData" label-position="top">
          <el-form-item label="文件夹名称" required>
            <el-input
              v-model="uploadFormData.folderName"
              placeholder="请输入文件夹名称(默认为当前日期)"
            ></el-input>
          </el-form-item>
          <el-form-item label="文件夹描述">
            <el-input
              v-model="uploadFormData.folderDescription"
              type="textarea"
              placeholder="请输入描述内容"
            ></el-input>
          </el-form-item>
          <el-form-item label="标注名称" required>
            <el-input
              v-model="uploadFormData.annotationName"
              placeholder="请输入文件夹名称(默认为当前日期)"
            >
              <template #append>.json</template>
            </el-input>
          </el-form-item>
          <el-form-item label="标注描述">
            <el-input
              v-model="uploadFormData.annotationDescription"
              type="textarea"
              placeholder="请输入描述内容"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span  class="dialog-footer">
            <el-button @click="descriptionDialogVisible=false">取消</el-button>
            <el-button type="primary" @click="uploadFilesAndAnnotationsToServer">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <!-- annotationOnly的表单 -->
    <div>
      <!-- 表单弹窗 -->
      <el-dialog
        v-model="annotationOnlyFormVisible"
        title="填写描述"
        width="30%"
      >
        <el-form ref="form" :model="uploadAnnotationOnlyFormData" label-position="top">
          <!-- 选择对应的DICOM文件 -->
          <el-form-item label="DICOM文件">
            <el-select v-model="uploadAnnotationOnlyFormData.folderName" placeholder="选择对应的DICOM文件">
              <el-option
                v-for="folderName in this.uploadAnnotationOnlyFolderNames"
                :key="folderName"
                :value="folderName"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标注名称" required>
            <el-input
              v-model="uploadAnnotationOnlyFormData.annotationName"
              placeholder="请输入文件夹名称(默认为当前日期)"
            >
            <template #append>.json</template>
          </el-input>
          </el-form-item>
          <el-form-item label="标注描述">
            <el-input
              v-model="uploadAnnotationOnlyFormData.annotationDescription"
              type="textarea"
              placeholder="请输入描述内容"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span  class="dialog-footer">
            <el-button @click="annotationOnlyFormVisible=false">取消</el-button>
            <el-button type="primary" @click="uploadAnnotationOnlyToServer">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>

  </template>
  
  <script>
  import { GridLayout, GridItem } from 'vue3-grid-layout';
  import { 
      // 同步器
    synchronizers, // 现成的同步器,可以直接使用
    SynchronizerManager, // 同步器管理器

    annotation,
    CrosshairsTool,
    ToolGroupManager,
    Enums as csToolsEnums,
      //contour工具
    PlanarFreehandContourSegmentationTool,
    PlanarFreehandROITool,
    SplineContourSegmentationTool,
    SplineROITool,
    LivewireContourSegmentationTool,
    LivewireContourTool,
   } from '@cornerstonejs/tools';
   import { getRenderingEngine,Enums,CONSTANTS,utilities } from '@cornerstonejs/core';
   import axios from 'axios'
   import { ElMessage } from 'element-plus';
  import WindowSelect from './SingleAxisViewport/WindowSelect.vue';
  import MulAxisViewport from './SingleAxisViewport/MulAxisViewport.vue';
import MulIconToolBar from './SingleAxisViewport/MulIconToolBar.vue';
   axios.defaults.withCredentials = true  //允许跨域携带cookie信息，必须加上

// 工具组的ID，它代表了一个唯一工具组
  const toolGroupId = "SingleAxisViewportToolGroupId"
  const toolGroup3DId = "toolGroup3DId"
  // 定义volumeId,作为类似于ImageLoader的一个Scheme
  const volumeId = "SingleAxisViewportVolumeId"
  const volume3DId = 'volume3DId'
    // 定义引擎的ID
  const renderingEngineId = 'SingleAxisViewportRenderingEngine'
    // 定义viewportId
  const viewportId1 = "SingleAxisViewport_CT_AXIAL"; // 创建轴向视图
  const viewportId2 = "SingleAxisViewport_CT_SAGITTAL"; // 创建矢状视图
  const viewportId3 = "SingleAxisViewport_CT_CORONAL"; // 创建冠状视图
  const viewportId4 = "SingleAxisViewport_CT_3D";
  const {ViewportType} = Enums; //相当于 cosnt ViewportType = Enums.ViewportType
  const segmentationId = "分割1"
  // 一些常见的VOI
  const voiData = {
    "默认":{ WW: 1600, WL: 500 },
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
  const contourTools = [
    PlanarFreehandContourSegmentationTool,
    PlanarFreehandROITool,
    SplineContourSegmentationTool,
    SplineROITool,
    LivewireContourSegmentationTool,
    LivewireContourTool
  ];

  const VOISynchronizerId = "MulVOISynchronizerId"
  const zoomPanSynchronizerId = "MulzoomPanSynchronizerId" 
  const cameraPositionSynchronizerId = "MulCameraPositionSynchronizerId" 

  // 同步器
  let VOISynchronizer;
  let zoomPanSynchronizer;
  let cameraPositionSynchronizer;

  export default {
      mounted(){
        this.updateLayout()
      },
      components:{
        GridLayout,
        GridItem,
        WindowSelect,
        MulAxisViewport,
        MulIconToolBar,
      },
      data() {
        return {
          // ======================== 多视图 ==========================================

          totalHeight:800,
          rows:2,
          columns:4,
          rowHeight:10,
          avg_row:1,
          avg_col:1,
          layout: [],
          originalLayout: [],
          fullScreenItem: null,

          // ========================= END ======================================

          dirFileSetObject:{},
          dirFileImageIdsObject:{},
          dirDicomsObject:{},
          dirOrientationObject:{},
          dicomsDirObject:{},
          DICOMDIRObject:{},
          editableTabsValue: '1',
          END:false,
          editableTabs: [],
          fixedTab:{name:"固定的页面",title:"固定的页面"},
          curTabDicomsName:"固定的页面",

          //  ============================显示描述表单 =====================================
          descriptionDialogVisible:false,    // Annotation+DICOM保存的表单是否显示出来
          annotationOnlyFormVisible:false,   // 仅仅保存Annotation的表单是否显示出来
          uploadFormData:{
            folderDescription:"",
            folderName:"",
            annotationName:"",
            annotationDescription:"",
          },
          uploadAnnotationOnlyFormData:{
            folderName:"",
            annotationName:"",
            annotationDescription:"",
          },
          uploadFilesAndAnnotationLoading:false,

          // 获取已经存入服务器端的DICOM文件夹信息
          uploadAnnotationOnlyFolderNames:[],
          // ====================== END ==============================
          curIndex : 0,
          renderingEngineId,
          // 所有的ID
          toolGroupId:"",
          toolGroup3DId:"",
          volumeId:"",
          volume3DId:"",
          viewportId1:"",
          viewportId2:"",
          viewportId3:"",
          viewportId4:"",
          viewportInputsObjects:{},
          segmentationId:"",
          contourTools:contourTools,
          voiData:voiData,
          // 最开始的窗口窗位
          original_wls:{},
          // ===================== 工具栏 =============================
          VOISynchronizerValue:false,
          zoomPanSynchronizerValue:true,

          // ==================== END =================================
          csrfToken:"",

        };
      },
      methods: {
        // ================== 工具栏 ==================================
        /**
         * @功能 - 切换工具栏的工具，使用鼠标左键可以激活对应工具，所有的窗口的对应工具都被激活
         * @param {String} toolName - 想要切换的工具的名称
         */
         handleChangeActiveTool(toolName){
            this.layout.forEach(item=>{
              const toolGroup = ToolGroupManager.getToolGroup(item.i+":"+toolGroupId);
              if(!toolGroup)
                return
              // 获取当前左键激活的工具
              const nowPrimaryMouseActiveTool = toolGroup.getActivePrimaryMouseButtonTool()
              // 避免重复激活某个工具
              if(nowPrimaryMouseActiveTool === toolName)
              {
                return;
              }
              // 禁用掉已激活的工具
              if (nowPrimaryMouseActiveTool) {
                toolGroup.setToolPassive(nowPrimaryMouseActiveTool);
              }
              // 激活toolName
              toolGroup.setToolActive(toolName,{
                bindings:[
                  { mouseButton:csToolsEnums.MouseBindings.Primary },
                ]
              });
              const contoursToolNames = this.contourTools.map(contourTool=>contourTool.toolName)
              if(!contoursToolNames.includes(toolName))
              {
                this.curContoursToolName = ""
              }
          })
          
        },

        /**
         * @功能 - 处理winodowlevelDropdown（一个下拉列表，可以选择常用部位对应的窗宽窗位）的回调
         * @param {string} value - 在这里指的是部位的名称
         */
        handleWindowLevelDropdownCallback(value){
          const windowData = this.voiData[value]
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports().filter(viewport=>viewport.id.startsWith(String(this.curIndex)))
          if(viewports?.length>0)
          {
            viewports.forEach(viewport=>{
              viewport.setProperties(
                {
                  voiRange:this.getVoiRange(windowData.WW,windowData.WL)
                }
              )
              viewport.render()
            })
          }
        },

        /**
         * @功能 - 处理OrientationDropdown（一个下拉列表，可以指定方向的渲染图）的回调
         * @param {string} value - orientation，只有三个方向
         */
        handleOrientationDropdownCallback(value){
          // 获得此时的viewportInput
          if(!this.layout[this.curIndex].fileSet)
          {
            return
          }
          if(value === "轴向")
          {
            this.layout[this.curIndex].original_orientation = "AXIAL"
            if(this.originalLayout)
              this.originalLayout[this.curIndex].original_orientation = "AXIAL"
          }
          else if(value === "矢向")
          {
            this.layout[this.curIndex].original_orientation = "SAGGITAL"
            if(this.originalLayout)
              this.originalLayout[this.curIndex].original_orientation = "SAGGITAL"
          }
          
          else if(value === "冠向")
          {
            this.layout[this.curIndex].original_orientation = "CORONAL"
            if(this.originalLayout)
              this.originalLayout[this.curIndex].original_orientation = "CORONAL"
          }
        },

        /**
         * @功能 - 根据WW，WL计算VOI的Lower和uper
         * @param WW - 窗口宽度windowWidth（窗宽）
         * @param WL - 宽口中心windowCenter （窗位）
         * @return {object}
         */
         getVoiRange(WW,WL){
          return utilities.windowLevel.toLowHighRange(WW,WL)
        },

        /**
         * @功能 - 重置视图
         */
         handleReset(){
          if(!getRenderingEngine(this.renderingEngineId))
            return
          const Viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports().filter(viewport=>viewport.id.startsWith(String(this.curIndex)));
          const voiRange = this.getVoiRange(this.original_wls[String(this.curIndex)].windowWidth,
          this.original_wls[String(this.curIndex)].windowCenter);
          if(Viewports?.length>0)
          {
            Viewports.forEach(Viewport=>{
              if(Viewport)
              {
                Viewport.setProperties({voiRange})
                Viewport.resetCamera({
                  resetPan:true,
                  resetZoom:true,
                  resetToCenter:true,
                  resetRotation:true,
                })
                Viewport.render();
              }
          })
          }
        },

        handleOrigianlWL(prefixId,original_wl){
          this.original_wls[prefixId] = original_wl
          
        },

        handleCurViewportId(viewportId)
        {
          this.layout[this.curIndex].cur_viewportId = viewportId
          this.updateVOISycronizers()
          this.updateCameraPositionSynchronizer()
        },

        updateVOISycronizers(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          
          if(!SynchronizerManager.getSynchronizer(VOISynchronizerId))
          {
            synchronizers.createVOISynchronizer(VOISynchronizerId)
          }
            
          // 获取这个创建的同步器
          VOISynchronizer = SynchronizerManager.getSynchronizer(VOISynchronizerId)
          this.layout.forEach(()=>{
            VOISynchronizer.destroy()
          })

          // 为同步器添加源视图和目标视图
          this.layout.forEach(item=>{
            if(getRenderingEngine(this.renderingEngineId) && getRenderingEngine(this.renderingEngineId).getViewport(item.cur_viewportId))
              VOISynchronizer.add({renderingEngineId:this.renderingEngineId,viewportId:item.cur_viewportId})
          })
          VOISynchronizer.setEnabled(this.VOISynchronizerValue)
        },

        updateZoomPanSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(zoomPanSynchronizerId))
            synchronizers.createZoomPanSynchronizer(zoomPanSynchronizerId)
          // 获取这个创建的同步器
          zoomPanSynchronizer = SynchronizerManager.getSynchronizer(zoomPanSynchronizerId)
          // 为同步器添加源视图和目标视图
          // this.layout.forEach(item=>{
          //   if(getRenderingEngine(this.renderingEngineId) && getRenderingEngine(this.renderingEngineId).getViewport(item.cur_viewportId))
          //     if(zoomPanSynchronizer.hasSourceViewport(this.renderingEngineId,item.cur_viewportId))
          //       zoomPanSynchronizer.remove({renderingEngineId:this.renderingEngineId,viewportId:item.cur_viewportId})
          // })
          this.layout.forEach(()=>{
            zoomPanSynchronizer.destroy()
          })

          // 为同步器添加源视图和目标视图
          const cur_original_orientation = this.layout[this.curIndex].original_orientation
          const temp_items = this.layout.filter(item=>item.original_orientation===cur_original_orientation)
          console.log("temp_items",temp_items)
          temp_items.forEach(item=>{
            if(getRenderingEngine(this.renderingEngineId) && getRenderingEngine(this.renderingEngineId).getViewport(item.cur_viewportId))
              zoomPanSynchronizer.add({renderingEngineId:this.renderingEngineId,viewportId:item.cur_viewportId})
          })
          console.log("getSourceViewports",zoomPanSynchronizer.getSourceViewports())
          zoomPanSynchronizer.setEnabled(this.zoomPanSynchronizerValue)
        },

        updateCameraPositionSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(cameraPositionSynchronizerId))
            synchronizers.createCameraPositionSynchronizer(cameraPositionSynchronizerId)
          // 获取这个创建的同步器
          cameraPositionSynchronizer = SynchronizerManager.getSynchronizer(cameraPositionSynchronizerId)
          // 为同步器添加源视图和目标视图
          this.layout.forEach(()=>{
            cameraPositionSynchronizer.destroy()
          })

          // 为同步器添加源视图和目标视图
          const cur_original_orientation = this.layout[this.curIndex].original_orientation
          const temp_items = this.layout.filter(item=>item.original_orientation===cur_original_orientation)
          temp_items.forEach(item=>{
            if(getRenderingEngine(this.renderingEngineId) && getRenderingEngine(this.renderingEngineId).getViewport(item.cur_viewportId))
              cameraPositionSynchronizer.add({renderingEngineId:this.renderingEngineId,viewportId:item.cur_viewportId})
          })
          cameraPositionSynchronizer.setEnabled(this.zoomPanSynchronizerValue)
        },

        handleVoiSynchronizeValue(value){
          if(!VOISynchronizer)
            return
          // 初始化同步器
          this.VOISynchronizerValue = value
          VOISynchronizer.setEnabled(value)
        },

        handleZoomPanSynchronizeValue(value){
          if(!cameraPositionSynchronizer)
            return
          this.zoomPanSynchronizerValue = value
          console.log("value",value)
          cameraPositionSynchronizer.setEnabled(value)
        },

        // ================= END ====================================
        // ================= 多窗口 ===================================
        updateLayout(){
          
          this.rowHeight = this.totalHeight/this.rows //每一行的高度
          this.avg_row = 1
          this.avg_col = 1
          const temp_layout = []
          const rows_array = Array.from({ length: this.rows }, (v,i) => i+1);
          const cols_array = Array.from({ length: this.columns }, (v,i) => i+1);
          rows_array.forEach(row =>{
            cols_array.forEach(col=>{
              const index = (row-1)*this.columns+col-1
              const temp={i:index,x:(col-1)*this.avg_col,y:(row-1)*this.avg_row,w:this.avg_col,
                h:this.avg_row,content:`item${index}`,fileSet:[],fileImageIds:[],original_orientation:"",dir:"",
                show:true,selected:false,cur_viewportId:""}
              temp_layout.push(temp)
            })
          })
          this.layout = temp_layout
          this.originalLayout=[]
        },

        async handleDoubleClick(item) {
          if (this.fullScreenItem === item.i) {
            if(VOISynchronizer && zoomPanSynchronizer)
            {
              VOISynchronizer.setEnabled(false)
              zoomPanSynchronizer.setEnabled(false)
            }
            this.layout = this.originalLayout;
            await this.$nextTick()
            this.fullScreenItem = null;
            if(VOISynchronizer && zoomPanSynchronizer)
            {
              VOISynchronizer.setEnabled(this.VOISynchronizerValue)
              zoomPanSynchronizer.setEnabled(this.zoomPanSynchronizerValue)
            }
          } else {
            if (!this.originalLayout.length) {
              this.originalLayout = [...this.layout];
            }
            if(VOISynchronizer && zoomPanSynchronizer)
            {
              VOISynchronizer.setEnabled(false)
              zoomPanSynchronizer.setEnabled(false)
            }
            this.fullScreenItem = item.i;
            this.layout = this.layout.map(it => 
              it.i === item.i ? { ...it, x:0,y:0,w: this.columns, h: this.rows,show:true} : { ...it, w: 0, h: 0,show:false}
            );
          }
          await this.$nextTick();
          if(getRenderingEngine(this.renderingEngineId)){
            getRenderingEngine(this.renderingEngineId).resize(true)
            const viewports = getRenderingEngine(this.renderingEngineId).getViewports()
            viewports.forEach(viewport=>{
              viewport.setZoom(1)
              console.log(viewport.id,viewport.getZoom())
              viewport.render()
            })
          }
        },

        handleSendRC(rows,cols)
        {
          this.rows=rows + 1,
          this.columns = cols + 1
          this.updateLayout()
        },

        async drop(event,index){
          // 阻止默认行为
          event.preventDefault();
          // 获取拖拽的数据
          const dicoms_name = event.dataTransfer.getData('text/plain');
          console.log(index)
          // // 更新目标区域的值
          // targetValue = value;
          if(dicoms_name)
          {
            this.layout[index].dir = this.dicomsDirObject[dicoms_name]
            this.layout[index].fileSet = this.dirFileSetObject[this.dicomsDirObject[dicoms_name]]
            this.layout[index].fileImageIds = this.dirFileImageIdsObject[this.dicomsDirObject[dicoms_name]]
            this.layout[index].original_orientation = this.dirOrientationObject[this.dicomsDirObject[dicoms_name]]
          }
          this.handleClickVueGridItem(index)
          this.handleClickMulAxisViewport(index)
        },

        handleClickMulAxisViewport(i){
          this.curIndex = i
          this.toolGroupId = this.curIndex +":" +toolGroupId
          this.toolGroup3DId = this.curIndex+":"+toolGroup3DId
          this.renderingEngineId = 0 + ":" + renderingEngineId
          this.viewportId1 = this.curIndex+":"+viewportId1
          this.viewportId2 = this.curIndex+":"+viewportId2
          this.viewportId3 = this.curIndex+":"+viewportId3
          this.viewportId4 = this.curIndex+":"+viewportId4
          this.volumeId = this.curIndex +":" +volumeId
          this.volume3DId = this.curIndex + ":" +volume3DId
          this.viewportInputsObjects= {
          '轴向':{
                viewportId:this.viewportId1,
                element:null,
                type:ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.AXIAL
                },
              },
          '矢向':{
                viewportId:this.viewportId2,
                element:null,
                type:ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.SAGITTAL
                },
              },
          '冠向':{
                viewportId:this.viewportId3,
                element:null,
                type:ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.CORONAL
                },
              },
          '3D':{
                viewportId: this.viewportId4,
                type: ViewportType.VOLUME_3D,
                element: null,
                defaultOptions: {
                  orientation: Enums.OrientationAxis.SAGITTAL,
                  background: CONSTANTS.BACKGROUND_COLORS.slicer3D,
                },
              },
          }
          this.segmentationId = this.curIndex+":"+segmentationId
          
          const original_wl = this.original_wls[String(this.curIndex)]
          if(original_wl)
            this.voiData["默认"] = {WW:original_wl.windowWidth,WL:original_wl.windowCenter}
          this.updateVOISycronizers()
          this.updateCameraPositionSynchronizer()
        },

        handleClickVueGridItem(i){
          this.layout.forEach(item=>{
            item.selected = false
          })
          this.layout[i].selected = true
        },

        // ================= END =================================

        // ================= 显示保存对话框 ===============================
        handleDescriptionDialogVisible() {
          this.descriptionDialogVisible = true;
        },

        async handleUploadAnnotationOnlyFormVisible() {
          await this.uploadAnnotationOnlyGetFolderNames()  // 先获取以前的
          this.annotationOnlyFormVisible = true;
        },
        // ==================== END =======================================

        // ==================== 保存到服务器 ========================

        /**
         * @功能 - 更新每次POST需要用到的CSRF箭令
         */
         async getCSRFDToken(){
          const response = await axios.get('http://localhost:8000/get_csrf_token/')
          this.csrfToken = response.data.token
        },

         /**
         * @功能 - 单独保存注释到服务器（这才是我们使用的）
         */
         async saveAnnotations()
        {
          // 将所有的注释保存在一个文件之中，如何发送给后端

          // 为单个Dicom图像保存它的注释，然后返回一个新的Dicom图像
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          const curSaveAnnotations = defaultAnnotationManager.getAllAnnotations()
          // // 如果有注释的话
          if(curSaveAnnotations?.length > 0)
          {
            const tagAnnotationData = []
            for(const Annotation of curSaveAnnotations)
            {
              if(Annotation.metadata.toolName !== CrosshairsTool.toolName)
              {
                tagAnnotationData.push(Annotation)
              }
            }
            const tagAnnotationDataJson = JSON.stringify(tagAnnotationData)
            const blob = new Blob([tagAnnotationDataJson], { type: "application/json" }); // 创建 Blob 对象

            await this.getCSRFDToken()

            // 将这个带有标注的json文件发送出去
            axios.post("http://localhost:8000/saveAnnotations/",blob,{
              headers:{
                'Content-Type': 'application/json', // 上传表单数据，一般使用json格式
                'X-CSRFToken': this.csrfToken,
              },
            })
            .then(response => {
              const type = response.status === 200 ? 'success' : 'warning'
              ElMessage({
                message:response.data.msg,
                type:type
              })
            })
            .catch(err=>{
              console.log(err)
            })
          }else{
            ElMessage({
              message:"没有注释！",
              type:"warning",
            })
          }
          
        },

        /**
         * @功能 - 上传DICOM文件以及对应的注释
         */
         async uploadFilesAndAnnotationsToServer(){
          if(!this.END)
          {
            ElMessage({
              message:"请等待所有文件上传完成后操作!",
              type:'warning',
            })
            return
          }
          const original_name = this.uploadFormData.annotationName
          this.uploadFilesAndAnnotationLoading = true
          this.uploadFormData.annotationName += ".json"
          await this.getCSRFDToken()
          // 先上传文件夹数据
          const response = await axios.post("http://localhost:8000/uploadFormData/",this.uploadFormData,{
            headers:{
              'Content-Type': 'application/json', // 上传表单数据，一般使用json格式
              'X-CSRFToken': this.csrfToken,
            },
          })
          if(response.status !== 200)
          {
            ElMessage.error(response.data.msg)
            this.uploadFormData.annotationName = original_name
            return
          }else{
            ElMessage.success(response.data.msg)
          }
          // 上传标注数据
          await this.saveAnnotations();

          // 上传DICOM文件数据
          const formData = new FormData();
          console.log(this.DICOMDIRObject)
          console.log("fileset",this.dirFileSetObject)
          Object.keys(this.dirFileSetObject).forEach(dir=>{
            const files = this.dirFileSetObject[dir]
            const dir_key = dir+"[]"
            files.forEach(file=>{
              formData.append(dir_key,file)
            })
          })
          formData.append("DICOMDIR",this.DICOMDIRObject.DICOMDIR)
          console.log(formData)
          await this.getCSRFDToken()

          // 使用 axios 或 fetch 上传文件
          axios.post('http://localhost:8000/upload/', formData,{
            headers:{
              'Content-Type': 'multipart/form-data', // 如果是上传文件，需要设置正确的 Content-Type
              'X-CSRFToken': this.csrfToken,
            },
          })
          .then(response => {
              if(response.data.state==="error")
                ElMessage.error(response.data.msg)
              else
                ElMessage.success(response.data.msg)
              this.uploadFilesAndAnnotationLoading = false
            })
          .catch(error => {
            console.log('错误:', error.response ? error.response.data : error.message);
            ElMessage({
              type:'fail',
              message:"上传失败"
            })
          });

          this.uploadFormData.annotationName = original_name
        },

                /**
         * @功能 - 从服务器端获得所有存储的DICOM名称
         */
         async uploadAnnotationOnlyGetFolderNames(){
          axios.get('http://localhost:8000/uploadAnnotationOnlyGetFolderNames/')
          .then(response=>{
            this.uploadAnnotationOnlyFolderNames = response.data.msg
            console.log(this.uploadAnnotationOnlyFolderNames)
          })
        },
        
         /**
         * @功能 - 仅仅上传注释到服务器，需要指定注释对应的DICOM文件
         */
         async uploadAnnotationOnlyToServer(){
          
          if(!this.END)
          {
            ElMessage({
              message:"请等待所有文件上传完成后操作!",
              type:'warning',
            })
            return
          }
          
          this.uploadFilesAndAnnotationLoading = true
          const original_name = this.uploadAnnotationOnlyFormData.annotationName
          this.uploadAnnotationOnlyFormData.annotationName += ".json"
          await this.getCSRFDToken()
          // 上传“仅仅上传标注”的表单数据，包含对应的DICOM文件、标注的名称和标注的描述
          const response = await axios.post("http://localhost:8000/uploadAnnotationOnlyFormData/",this.uploadAnnotationOnlyFormData,{
            headers:{
              'Content-Type': 'application/json', // 上传表单数据，一般使用json格式
              'X-CSRFToken': this.csrfToken,
            },
          })
          if(response.status !== 200)
          {
            ElMessage.error(response.data.msg)
            this.uploadAnnotationOnlyFormData.annotationName = original_name
            this.uploadFilesAndAnnotationLoading = false
            return
          }else{
            ElMessage.success(response.data.msg)
          }
          await this.saveAnnotations()
          this.uploadAnnotationOnlyFormData.annotationName = original_name
          this.uploadFilesAndAnnotationLoading = false
        },

        // ========================= END =========================================
        /**
         * 
         * @param files 这是一个文件夹（序列描述）的所有的dicom文件
         */
        handleRadioChange(dicoms_name,files){
          console.log(dicoms_name)
          this.fileSet=null
          this.fileSet = files
        },

        handleDbclickTable(dicoms_name)
        {
          this.curTabDicomsName = dicoms_name
          const dir = this.dicomsDirObject[dicoms_name]
          // if(!this.dicomsDirObject[dir])
          //   this.dicomsDirObject[dir] = dicoms_name
          if(!this.editableTabs.some(editableTab=>editableTab.name === dicoms_name))
          { 
            const temp_tab = {name:dicoms_name,title:dicoms_name,prefixId:dir,dir:dir,show:true}
            this.editableTabs.push(temp_tab)
          }
        },

        handleDICOMDIR(dir,dicomDirObjects,dicomBodyObjects,
        dirOrientationObjects,fileImageIdsDirObjects){
          this.dirFileSetObject[dir] = dicomDirObjects
          this.dirDicomsObject[dir] = dicomBodyObjects
          this.dirOrientationObject[dir]=dirOrientationObjects
          this.dirFileImageIdsObject[dir] = fileImageIdsDirObjects
        },

        handleDICOMDIR2(DICOMDIRObejct,bodyDicomObjects){
          this.DICOMDIRObject = DICOMDIRObejct
          this.dicomsDirObject = bodyDicomObjects
        },

        handleEnd(){
          this.END = true
          ElMessage.success("所有文件上传成功")
        },

        handleTabsEdit(targetName, action) {
          if (action === 'add') {
            this.addTab();
          } else if (action === 'remove') {
            this.removeTab(targetName);
          }
        },

        removeTab(targetName) {
          const tabs = this.editableTabs;
          let activeName = this.curTabDicomsName;
          const index = tabs.findIndex(tab => tab.name === targetName);
          if (index !== -1) {
            tabs.splice(index, 1);
            if (activeName === targetName) {
              this.curTabDicomsName = tabs.length > 0 ? tabs[0].name : '';
            }
          }
        },

      }
  };
  </script>
  
  <style scoped>
  /* 容器布局 */
  .container-layout {
    height: 100vh;
    display: flex;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  
  /* 侧边栏样式 */
  .side-panel {
    background: linear-gradient(135deg, #56ccf2, #2f80ed);
    color: #fff;
    padding-top: 30px;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background 0.3s;
  }
  .side-panel:hover {
    border:1px solid #1976D2;
  }
  
  /* 标题样式 */
  .aside-title {
    font-size: 20px;
    margin-bottom: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  }
  
  /* 菜单项样式 */
  .menu-list {
    list-style: none;
    padding: 0;
    width: 100%;
  }
  .menu-list li {
    padding: 12px 20px;
    margin-bottom: 12px;
    background-color: rgba(255,255,255,0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
    font-weight: 500;
  }
  .menu-list li:hover {
    background-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  /* 主内容区 */
  .main-content {
    height: 1000px;
    background-color: #f5f7fa;
    flex: 1;
    overflow-y: auto;
  }

  .el-main{
    --el-main-padding:0;
  }
  
  /* Tabs 样式 */
  .demo-tabs {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  .el-tabs__header {
    font-weight: 600;
  }

  .el-tab-pane {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
    min-height: 200px;
  }
  
  /* Tab内容样式 */
  .tab-content {
    font-size: 16px;
    line-height: 1.6;
    color: #333;
  }

  .header {
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
background: linear-gradient(to right, rgb(135, 206, 235), rgb(0, 0, 255));
}
.selected{
  border: 2px solid #0D47A1;
}

.icon{
  width:20px;
  height:20px;
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
  