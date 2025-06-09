<template>
  <el-container class="container" 
   v-loading.fullscreen.lock="uploadFilesAndAnnotationLoading" 
   element-loading-text="正在上传...">
    <!-- 头部区域 -->

      <el-header class="header">
        <el-button type="info"
        @click="handleShowLeftAside">
          <img src="svg/三横线.svg" alt="" class="icon">
        </el-button>
          
        <icon-toolbar
        :orientationDisable="orientationDisable"
        :handle-reset="handleReset"
        :crosshairDisabled="crosshairDisabled"
        @handleChangeActiveTool="handleChangeActiveTool"
        @handleWindowLevelDropdownCallback="handleWindowLevelDropdownCallback"
        @handleOrientationDropdownCallback="handleOrientationDropdownCallback"
        @handleMenuSliders="handleMenuSliders"
        @handleMenuColorWheels="handleMenuColorWheels"
        @handleMenuSwitchs="handleMenuSwitchs"
        @handleMenuButton="handleMenuButton"
        @handMultiWindows="handMultiWindows"
        @handleVoiSynchronizeValue="handleVoiSynchronizeValue"
        @handleZoomPanSynchronizeValue="handleZoomPanSynchronizeValue"
        @handleSlabThicknessSynchronizeValue="handleSlabThicknessSynchronizeValue"
        @handleChangeSlabThickness="handleChangeSlabThickness"
        @handleArrowHeadSwitch="handleArrowHeadSwitch"
      ></icon-toolbar>
        <el-button type="info"
          @click="handleShowRightAside">
          <img src="svg/三横线.svg" alt="" class="icon">
        </el-button>
      </el-header>

    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <transition name="left_aside_fade">
        <el-aside class="left_aside" v-show="showLeftAside">
          <div class="zones">
            <div class="uploadZone" @click="triggerFileInput" v-if="identity==='teacher'">
              点击此处上传图像
              <input type="file" @change="handleChange" style="display:none;" ref="fileInput" multiple webkitdirectory />
            </div>
            <div class="saveToServerZone" @click="handleDescriptionDialogVisible" v-if="identity==='teacher'">
              保存DICOM和标注
            </div>
            <div class="saveToServerZone" @click="handleUploadAnnotationOnlyFormVisible" v-if="identity==='teacher'">
              仅保存标注
            </div>
            <div class="downloadFromServerZone">
              <router-link to="/dicomsFromServer">导入</router-link>
            </div>
            <div class="saveToServerZone" @click="handleExportAsPic">
              导出成图片
            </div>
          </div>
        </el-aside>
      </transition>

      <!-- 主内容区 -->
      <el-main class="main">
        <div class="content">
          <div class="renderZone" v-loading="renderZoneLoading" :style="cursor_style">
            <div class="renderZoneItems"
              v-for="index in curWindowNumbers"
              :style="{ 'width': renderZoneItemsWidth, 'height': renderZoneItemsHeight }"
              :key="index"
              :id="prefixId+':'+`renderZoneItem${index}`"
              v-show="windowIsMaximized && maximizedWindow === index || !windowIsMaximized"
              @dblclick="handleDoubleClickRenderZoneItems(index)">
            </div>
          </div>
        </div>
      </el-main>

      <!-- 侧边栏 -->
      <transition name="right_aside_fade">
        <el-aside class="right_aside" v-show="showRightAside">
          <el-select
            v-model="curSegmentationId"
            @change="handleUpdateSegmentation">
              <el-option
                v-for="Segmentation in Segmentations"
                :key="Segmentation.name"
                :value="Segmentation.name"
              />
          </el-select>
          <el-button
            @click="handleCreateNewSegmentation"
            :disabled="!isCreateNewSegmentation">
              + 创建新的分割
          </el-button>
          <!-- 代表每一个分割 -->
          <el-collapse accordion>
            <el-collapse-item  
            v-for="Segmentation in Segmentations" 
            :key="Segmentation.name"
            :title="Segmentation.name">
              <div class="create_new_segmentation">
              <el-select
              v-model="curSegmentIndex[Segmentation.index]"
              @change="(segmentName)=>handleSegmentIndexChange(segmentName,Segmentation.id,Segmentation.index)">
                <el-option
                  v-for="SegmentIndex in SegmentNumbers[Segmentation.index]"
                  :key="SegmentIndex"
                  :value="`分割段${SegmentIndex}`"
                />
              </el-select>
              <div>
                <el-button
                @click="handleCreateNewSegment(Segmentation.index,Segmentation.id)">
                  <img src="svg/加.svg" alt="" class="icon">
                  &MediumSpace;
                  <el-text>创建新的分割段</el-text>
                </el-button>
              </div>
              <div>
                <el-button
                @click="handleLockSegment(Segmentation.index,Segmentation.id)">
                  <img src="svg/锁定.svg" alt="" class="icon">
                  &MediumSpace;
                  <el-text>锁定当前分割段</el-text>
                </el-button>
              </div>
              <div>
                <el-button
                @click="handleUnLockSegment(Segmentation.index,Segmentation.id)">
                  <img src="svg/解锁.svg" alt="" class="icon">
                  &MediumSpace;
                  <el-text>解锁当前分割段</el-text>
                </el-button>
              </div>
              
            </div>
            <!-- 当前分割段 -->
            <div>
              <el-text>
              当前分割段
              </el-text>
              <el-switch
              v-model="SegmentVisibiity[Segmentation.index][curSegmentNumberIndex[Segmentation.index]-1]"
              active-text="显示"
              inactive-text="隐藏"
              @change="(value)=>handleSegmentVisibility(Segmentation.index,Segmentation.id,value)">
              </el-switch>
            </div>
            <!-- 所有分割段 -->
            <div>
              <!-- 所有分割段 -->
              <el-text>
                所有分割段
              </el-text>
              <el-switch
              v-model="Segmentation.visibility"
              active-text="显示"
              inactive-text="隐藏"
              @change="(value)=>handleSegmentationVisibility(Segmentation.index,Segmentation.id,value)">
              </el-switch>
            </div>
            
            <el-collapse>
            <el-collapse-item title="已经锁定的分割段">
              <el-table :data="lockedSegmentIndexs[Segmentation.index]" :show-header="false" empty-text="无锁定分割段">
                <el-table-column  prop="locked"></el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
            </el-collapse-item>
          </el-collapse>
          
          <div class="contours_select">
            <el-select
            v-model="curContoursToolName"
            placeholder="选择分割类型"
            @change="handleContousToolNameChange">
              <el-option
                v-for="contourToolName in contourTools.map(contourTool=>contourTool.toolName)"
                :key="contourToolName"
                :value="contourToolName"
                :label="contourZHTools[contourToolName]"
              />
            </el-select>
          </div>

          <div class="segmentationDel">
            <el-button
            @click="handleSegmentationDel">
              <img src="svg/删除.svg" alt="" class="icon">
              删除所有的分割
            </el-button>
          </div>

          
        </el-aside>
      </transition>

       <!-- folder+annotation的表单 -->
       <div>
        <!-- 表单弹窗 -->
        <el-dialog
          v-model="descriptionDialogVisible"
          title="填写描述"
          width="30%"
          :before-close="handleClose"
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
              <el-button @click="cancel">取消</el-button>
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
          :before-close="handleUploadAnnotationOnlyFormClose"
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
              <el-button @click="uploadAnnotationOnlyFormCancel">取消</el-button>
              <el-button type="primary" @click="uploadAnnotationOnlyToServer">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <!-- 导出成图像的页面 -->
      <!-- 导出对话框 -->
      <el-dialog
        title="导出成图像"
        width="30%"
        v-model="exportDialogVisible"
        align-center
      >
        <el-form label-width="100px" :model="exportForm" >
          <el-form-item label="导出格式">
            <el-radio-group v-model="exportForm.exportFormat">
              <el-radio-button label="jpg">JPG</el-radio-button>
              <el-radio-button label="png">PNG</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="导出质量" v-if="exportForm.exportFormat === 'jpg'">
            <el-slider v-model="exportForm.exportQuality" :min="0.1" :max="1" :step="0.1"></el-slider>
          </el-form-item>
          <el-form-item :label=orientation v-for="orientation,index in exportForm.exportOrientation" :key="orientation">
            <el-input v-model="exportForm.exportNames[index]" placeholder="输入文件名称"></el-input>
          </el-form-item>
          <el-form-item label="选择图像">
            <el-checkbox-group v-model="exportForm.exportOrientation">
                <el-checkbox label="轴向"  :disabled="!orientationDisable">轴状</el-checkbox>
                <el-checkbox label="矢向"  :disabled="!orientationDisable">失状</el-checkbox>
                <el-checkbox label="冠向"  :disabled="!orientationDisable">冠状</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="exportDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="exportAsPic">
                导出
              </el-button>
            </div>
          </template>
        
      </el-dialog>
    </el-container>
  </el-container>
</template>
<script>
import {h,render } from 'vue'
import * as dcmjs from 'dcmjs'
import axios from 'axios'
import JSZip from 'jszip';
//===========================cornerstone3d============================
// import initCornerstone from '@/cornerstone/helper/initCornerstone';
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"
import {
  cache,
  RenderingEngine,
  Enums,
  volumeLoader,
  CONSTANTS,
//   setVolumesForViewports,
  metaData,
  getRenderingEngine,
  utilities,
  imageLoader,
} from '@cornerstonejs/core';
import {
  // 3D视图工具
  TrackballRotateTool,
  // 同步器
  synchronizers, // 现成的同步器,可以直接使用
  SynchronizerManager, // 同步器管理器

  cancelActiveManipulations,// 取消绘制操作
  segmentation, // 管理分割类工具
  annotation, // 管理注释类工具
  Enums as csToolsEnums,
  utilities as csToolUtilities,
  addTool,
  ToolGroupManager,
  // 操作类工具
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  PanTool,
  DragProbeTool,
  PlanarRotateTool,
  CrosshairsTool,
  // 注释类工具
  LengthTool,
  BidirectionalTool,
  ArrowAnnotateTool,
  RectangleROITool,
  EllipticalROITool,
  CircleROITool,
  AdvancedMagnifyTool,
  // 分割类
  //labelmap工具
  BrushTool,
  RectangleScissorsTool,
  SphereScissorsTool,
  CircleScissorsTool,
  PaintFillTool,
  //contour工具
  PlanarFreehandContourSegmentationTool,
  PlanarFreehandROITool,
  SplineContourSegmentationTool,
  SplineROITool,
  LivewireContourSegmentationTool,
  LivewireContourTool,


} from '@cornerstonejs/tools';
// colorBar
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
//========================== 组件 ========================================
import IconToolbar from './IconToolbar.vue';
import ColorbarControlMenu from './ColorbarControlMenu.vue';
import { ElMessageBox,ElMessage,ElButton } from 'element-plus';
import TextWithSlider from './TextWithSlider.vue';
import SelectToolFor3d from './SelectToolFor3d.vue';
import html2canvas from 'html2canvas';


const {ViewportType} = Enums; //相当于 cosnt ViewportType = Enums.ViewportType
const { ViewportColorbar } = csToolUtilities.voi.colorbar;
const { ColorbarRangeTextPosition } = csToolUtilities.voi.colorbar.Enums;
// colormaps，用于映射colorbar的名称和对应的颜色
const colormaps = vtkColorMaps.rgbPresetNames.map((presetName) =>
  vtkColorMaps.getPresetByName(presetName)
);
// 当前的colormap名称
const currentPTColormapName = 'Grayscale';

// 工具组的ID，它代表了一个唯一工具组
const toolGroupId = "SingleAxisViewportToolGroupId"
const toolGroup3DId = "toolGroup3DId"
let toolGroupIs = []
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

// 同步器ID
const cameraPositionSynchronizerId = "cameraPositionSynchronizerId" // 没用到
const VOISynchronizerId = "VOISynchronizerId"
const zoomPanSynchronizerId = "zoomPanSynchronizerId" 
const imageSliceSynchronizerId = "imageSliceSynchronizerId" //没用到
const slabThicknessSynchronizerId = 'SLAB_THICKNESS_SYNCHRONIZER_ID';

// 同步器
let VOISynchronizer;
let zoomPanSynchronizer;
let slabThicknessSynchronizer;

// 分割的ID
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


// 基础工具的类
const baseManipulationTools=[  
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  PanTool,
  DragProbeTool,
  PlanarRotateTool,
];

// 注释工具的类
const baseAnnotationTools=[
  LengthTool,
  BidirectionalTool,
  ArrowAnnotateTool,
  RectangleROITool,
  EllipticalROITool,
  CircleROITool,
];

const contourTools = [
  PlanarFreehandContourSegmentationTool,
  PlanarFreehandROITool,
  SplineContourSegmentationTool,
  SplineROITool,
  LivewireContourSegmentationTool,
  LivewireContourTool
]

const contourZHTools = {
  [PlanarFreehandContourSegmentationTool.toolName]: "平面自由手绘轮廓分割工具",
  [PlanarFreehandROITool.toolName]: "平面自由手绘兴趣区工具",
  [SplineContourSegmentationTool.toolName]: "样条曲线轮廓分割工具",
  [SplineROITool.toolName]: "样条曲线兴趣区工具",
  [LivewireContourSegmentationTool.toolName]: "活线轮廓分割工具",
  [LivewireContourTool.toolName]: "活线轮廓工具"
};


axios.defaults.withCredentials = true  //允许跨域携带cookie信息，必须加上
export default {
    props:{
      input_fileSet:{
        type:Array,
        required:true,
      },
      input_fileImageIds:{
        type:Array,
        required:true,
      },
      original_orientation:{
        type:String,
        required:true,
      },
      prefixId:{
        type:String,
        required:true,
      },

    },
    components:{
        IconToolbar,
    },
    data(){
        return{
            // 所有的ID
            toolGroupId:"",
            toolGroup3DId:"",
            volumeId:"",
            volume3DId:"",
            viewportId1:"",
            viewportId2:"",
            viewportId3:"",
            viewportId4:"",
            VOISynchronizerId:"",
            zoomPanSynchronizerId:"",
            slabThicknessSynchronizerId:"",
            segmentationId:"",
            // CrossHaris工具的线条颜色
            viewportColors:{},
            // 三种ViewportInput
            viewportInputsObjects:[],

            // 最开始的窗口窗位
            original_wl:{},
            voiData:voiData,

            // 导出部分
            exportForm:{
              exportFormat:"jpg",
              exportQuality:1,
              exportOrientation:["轴向"],
              exportNames:["","",""],
            },
            exportDialogVisible:false,
            
            // 用于存储导入的文件(类型是Blob)，是一个数组
            fileSet:null,
            // 用于存储fileImageIds，这些imageId是将图像渲染出来的关键数据
            fileImageIds:null,
            // 用到的视图元素
            elements:{},
            // annotation.config.style的默认配置
            annotationConfigStyleDefaultConfig : {
              color: 'rgb(255, 255, 0)',
              colorHighlighted: 'rgb(0, 255, 0)',
              colorSelected: 'rgb(0, 220, 0)',
              colorLocked: 'rgb(209, 193, 90)',
              lineWidth: '1',
              lineDash: '',
              shadow: true,
              textBoxVisibility: true,
              textBoxFontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              textBoxFontSize: '14px',
              textBoxColor: 'rgb(255, 255, 0)',
              textBoxColorHighlighted: 'rgb(0, 255, 0)',
              textBoxColorSelected: 'rgb(0, 255, 0)',
              textBoxColorLocked: 'rgb(209, 193, 90)',
              textBoxBackground: '',
              textBoxLinkLineWidth: '1',
              textBoxLinkLineDash: '2,3',
              textBoxShadow: true,
              markerSize: '15',
            },
            // defaultAnnotationManager:null,
            // 用于保存每次POST需要的的箭令
            csrfToken : "",
            // 上传进度条
            uploadProgress : 0,
            // 显示文件模块
            showDicomInformationMenu:false,
            // DICOM信息的列表
            DicomInformationLists : {
              id:0,
              name:"",
              downloadFolderProcess:0,
              downloadFolderDCMProcess:0,
            },
            // 显示当前
            // 这是方向选择工具禁用标志
            orientationDisable:false,
            // 当前的方向
            curOrientation:"轴向",
            // 当前的显示窗口个数
            curWindowNumbers:1,
            maximizedWindow:null,
            windowIsMaximized:false,
            renderZoneItemsWidth:"100%",
            renderZoneItemsHeight:'95%',

            // renderZone区域的加载动画
            renderZoneLoading:false,

            // 存储所有的视图(viewport)放大倍数，sliceIndex,,角度，窗口窗位
            zoomScales:{},
            sliceIndexs:{},
            rotateAngles:{},
            windowLevels:{},

            textSliderElements:{},
            volumeViewportIds:[],

            // 是否渲染slider,拉动slider的时候不需要渲染
            isRenderSlider:false,
            // 判断是否是slider发生了改变
            isChangeSlider:{},
            // 此时是否触发
            zoomFlag:true,

            // 只有在MPR的时候才有crosshairTool
            crosshairDisabled:true,

            // 显示colorBar的flag
            showColorbarsMenus:{},
            // 所有colorbars
            ctColorbars:{},
            colorbarControlBoxs:{},
            colorbarControlMenus:{},
            colorbarControlZones:{},
            colorbarContainers:{},
            colorbarNames:{},
            isShowColorbars:{},
            curRenderZone:null,
            curViewportId:"",

            // 显示描述表单
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

            showLeftAside:false,
            showRightAside:false,
            // 分割部分
            contourTools:contourTools,
            curContoursToolName:"",

            curSegmentIndex:["分割段1"],
            curSegmentNumberIndex:[1],
            lockedSegmentIndexs:[[]],
            SegmentNumbers:[1],
            curSegmentationId:"",
            SegmentationNumber:1,
            SegmentVisibiity:[[true]],
            Segmentations:[
              {id:segmentationId,index:0,name:"分割1",visibility:true},
            ],
            isCreateNewSegmentation:false,

            // contoursTools对应的中文名称
            contourZHTools:contourZHTools,
            cursor_style:{
              cursor: "default"
            },

            // 箭头的config
            arrowAnnotationConfig:{},

            // 身份信息
            identity:"",
        }
    },
    watch:{
      showColorbarsMenus:{
        handler(){
          if(this.colorbarControlZones&&this.curRenderZone)
          {
            this.renderColorbarMenu(this.curViewportId,this.curRenderZone);
          }
        },
        deep:true
      },
      sliceIndexs:{
        handler(){
          if(this.curViewportId!=="" && this.elements && this.isRenderSlider)
          {
            this.volumeViewportIds.forEach(id=>{this.renderTextSlider(id,this.elements[id])})
          }
        },
        deep:true
      },
      zoomScales:{
        handler(){
          if(this.curViewportId!=="" && this.elements)
          {
            this.volumeViewportIds.forEach(id=>{this.renderTextSlider(id,this.elements[id])})
          }
        },
        deep:true
      },
      windowLevels:{
        handler(){
          if(this.curViewportId!=="" && this.elements)
          {
            this.volumeViewportIds.forEach(id=>{this.renderTextSlider(id,this.elements[id])})
          }
        },
        deep:true
      },
      rotateAngles:{
        handler(){
          if(this.curViewportId!=="" && this.elements)
          {
            this.volumeViewportIds.forEach(id=>{this.renderTextSlider(id,this.elements[id])})
          }
        },
        deep:true
      },
    },

    async mounted(){
        // 初始化所有的ID
        this.toolGroupId = this.prefixId+":"+toolGroupId
        this.toolGroup3DId = this.prefixId+":"+toolGroup3DId
        this.volumeId=this.prefixId+":"+volumeId
        this.volume3DId=this.prefixId+":"+volume3DId
        this.renderingEngineId=this.prefixId+":"+renderingEngineId
        this.viewportId1=this.prefixId+":"+viewportId1,
        this.viewportId2=this.prefixId+":"+viewportId2,
        this.viewportId3=this.prefixId+":"+viewportId3,
        this.viewportId4=this.prefixId+":"+viewportId4,
        this.viewportIds=[this.viewportId1,this.viewportId2,this.viewportId3,this.viewportId4]
        this.VOISynchronizerId = this.prefixId+":"+VOISynchronizerId
        this.zoomPanSynchronizerId = this.prefixId+":"+zoomPanSynchronizerId
        this.slabThicknessSynchronizerId = this.prefixId+":"+slabThicknessSynchronizerId
        this.segmentationId = this.prefixId+"-"+segmentationId
        this.curSegmentationId =this.segmentationId
        this.Segmentations = [{id:this.segmentationId,index:0,name:this.segmentationId,visibility:true}]
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
        // CrossHaris工具的线条颜色
        this.viewportColors={
          [this.viewportId1]: 'rgb(200, 0, 0)',
          [this.viewportId2]: 'rgb(200, 200, 0)',
          [this.viewportId3]: 'rgb(0, 200, 0)',
        }
        
        this.init()
        document.addEventListener('keydown',this.selectedAnnotationDelect)
        document.addEventListener('click',this.handleClickRenderzone)
        document.addEventListener('click',this.handleSingleClickHideColorbarMenu)
        if(!this.fileSet)
          this.fileSet=this.input_fileSet
        if(!this.fileImageIds)
          this.fileImageIds=this.input_fileImageIds
        
        this.renderZoneLoading = true
        // 主程序，生成视图的整个流程
        await this.run()

        let temp_arr=[]
        let index = 0
        segmentation.state.getSegmentations().forEach((Segmentation)=>{
          if(Segmentation.segmentationId.startsWith(this.prefixId))
          {
            temp_arr.push({id:Segmentation.segmentationId,index:index,name:Segmentation.segmentationId,visibility:true})
            index+=1
          }

        })
        this.Segmentations = temp_arr
        console.log(this.Segmentations)

        // 初始化窗口窗位
        const viewport = getRenderingEngine(this.renderingEngineId).getViewports()[0]
        const voiRange = viewport.getProperties().voiRange
        this.original_wl = this.getWindowData(voiRange.lower,voiRange.upper)
        console.log("original_wl",this.original_wl)
        this.voiData["默认"]={WW:this.original_wl.windowWidth,WL:this.original_wl.windowCenter}
    },
    methods: {
        /**
         * @功能 - 初始化数据
         */
        async init(){
            // // 初始化所有的cornerstone依赖
            // await initCornerstone();
            // 准备一个rendringEngine，之后获取他就行
            if(!getRenderingEngine(this.renderingEngineId))
              new RenderingEngine(this.renderingEngineId)

            // this.defaultAnnotationManager = annotation.state.getAnnotationManager()
        },

        async identityFunction(){
          try{
            const response = await axios.get("http://localhost:8000/identity")
            const data = response.data.message
            if(data.is_student && !data.is_teacher)
                this.identity= "student"
            else if(!data.is_student && data.is_teacher)
                this.identity= "teacher"
            else
                this.identity = ""
            if(this.identity === "")
            {
                ElMessage.error("该账号为无效账号，请重新登录!")
                this.$router.push("/")
            }
          }
          catch(err){
            ElMessage.error("尚未登录")
            this.$router.push("/")
          }
        },

        // 导出部分
        handleExportAsPic()
        {
          this.exportDialogVisible = true
        },
        exportAsPic()
        {
          if(Object.keys(this.elements).length===0)
          {
            ElMessage.error("还没有导入任何图像！")
            return
          }
          this.exportForm.exportOrientation.forEach((orientation,index)=>
          {
            const exportId = this.viewportInputsObjects[orientation].viewportId
            const exportElement = this.elements[exportId].firstElementChild
            html2canvas(exportElement).then((canvasElement)=>{
              let imageData
              if(this.exportForm.exportFormat == "jpg")
              {
                imageData = canvasElement.toDataURL("image/jpeg",this.exportForm.exportQuality)
              }else if(this.exportForm.exportFormat=="png")
              {
                imageData = canvasElement.toDataURL("image/png")
              }
              const link = document.createElement('a')
              link.href = imageData
              link.download=this.exportForm.exportNames[index]
              link.click()
              // 在触发点击后移除
              link.remove();
            })
          }) 

        },

        handleArrowHeadSwitch(value){
          if(value)
          {
            this.arrowAnnotationConfig = {...this.arrowAnnotationConfig,arrowHeadStyle:'legacy',}
          }else{
            this.arrowAnnotationConfig = {...this.arrowAnnotationConfig,arrowHeadStyle:'standard',}
          }
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          toolGroup.setToolConfiguration(ArrowAnnotateTool.toolName,this.arrowAnnotationConfig)
        },

        handleContousToolNameChange(value){
          this.handleChangeActiveTool(value)

          // this.cursor_style.cursor = '';
          // // 可选：在工具切换为其他工具时，移除圆形光标样式
          // const removeCircleCursor = () => {
          //   targetElement.classList.remove('circle-cursor');
          // };
          
        },

        handleChange3dPreset(value){
          const viewport3d = getRenderingEngine(this.renderingEngineId).getViewport(this.viewportId4)
          if(viewport3d)
            viewport3d.setProperties({preset:value})
        },
        
        /**
         * 
         * @param {string} segmentName 
         */
        handleSegmentIndexChange(segmentName,id,index){
          const curIndex = Number(segmentName.split("分割段")[1])
          this.curSegmentNumberIndex[index] = curIndex
          segmentation.segmentIndex.setActiveSegmentIndex(
            id,
            curIndex,
          );
        },

        handleCreateNewSegment(index){
          this.SegmentNumbers[index] += 1
          this.SegmentVisibiity[index].push(true)
        },

        handleLockSegment(index,id){
          const curIndex = Number(this.curSegmentIndex[index].split("分割段")[1])
          segmentation.segmentLocking.setSegmentIndexLocked(
            id,
            curIndex,
            true,
          );
          console.log("锁定",segmentation.segmentLocking.isSegmentIndexLocked(id,curIndex))
          this.lockedSegmentIndexs[index] = segmentation.segmentLocking.getLockedSegmentIndices(id).map(
            value=>{
              return {locked:`分割段${value}`}  
            }
          )
        },

        handleUnLockSegment(index,id){
          
          const curIndex = Number(this.curSegmentIndex[index].split("分割段")[1])
          segmentation.segmentLocking.setSegmentIndexLocked(
            id,
            curIndex,
            false,
          );
          this.lockedSegmentIndexs[index] = segmentation.segmentLocking.getLockedSegmentIndices(id).map(
            value=>{
              return {locked:`分割段${value}`}
            }
          )
        },
        
        async handleCreateNewSegmentation() {
          
          this.SegmentationNumber += 1
          const newSegmentationId = this.prefixId+":"+`分割${this.SegmentationNumber}`;
          const index = this.SegmentationNumber-1
          const curSegmentation = {id:newSegmentationId,index:index,name:newSegmentationId,visibility:true}

          if(! segmentation.state.getSegmentation(curSegmentation.id))
          {
            segmentation.addSegmentations([
            {
                segmentationId: curSegmentation.id,
                representation: {
                  type: csToolsEnums.SegmentationRepresentations.Contour,
                },
              },
            ]);
          }
          

          // Add the segmentation representation to the viewport
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
          for (let i = 0; i < viewports.length; i++) {
            const viewportId = viewports[i].id;
            await segmentation.addSegmentationRepresentations(viewportId, [
              {
                segmentationId: newSegmentationId,
                type: csToolsEnums.SegmentationRepresentations.Contour,
              },
            ]);
          }

          this.curSegmentationId = newSegmentationId

          let temp_arr=[]
          let idx = 0
          segmentation.state.getSegmentations().forEach((Segmentation)=>{
            if(Segmentation.segmentationId.startsWith(this.prefixId))
            {
              temp_arr.push({id:Segmentation.segmentationId,index:idx,name:Segmentation.segmentationId,visibility:true})
              idx+=1
            }

          })
          this.Segmentations = temp_arr
          this.SegmentNumbers[index] = 1
          this.curSegmentNumberIndex[index] = 1
          this.SegmentVisibiity[index] = [true]
        },

        handleUpdateSegmentation(value){
          // 激活
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
          for (let i = 0; i < viewports.length; i++) {
            const viewportId = viewports[i].id;
            segmentation.activeSegmentation.setActiveSegmentation(viewportId,value)
          }
        },

        handleSegmentVisibility(index,id,value){
          // 当前分割段的索引
          const curIndex = Number(this.curSegmentIndex[index].split("分割段")[1])
          console.log("value",value)
          console.log("curIndex",curIndex)
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
          viewports.forEach(viewport=>{
            segmentation.config.visibility.setSegmentIndexVisibility(
              viewport.id,
              {
                segmentationId:id,
                type:csToolsEnums.SegmentationRepresentations.Contour
              },
              curIndex,
              value
            )
          })
        },

        handleSegmentationVisibility(index,id,value){
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
          for(let i =0;i<this.SegmentNumbers[index];i++)
          {
            console.log("i",i)
            viewports.forEach(viewport=>{
              try{
                segmentation.config.visibility.setSegmentIndexVisibility(
                    viewport.id,
                    {
                      segmentationId:id,
                      type:csToolsEnums.SegmentationRepresentations.Contour
                    },
                    i+1,
                    value
                  )
                
              }catch(err){
                ElMessage.error("发生错误")
              }
            })
          }
        },

        handleSegmentationDel(){
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          const allAnnotations = annotation.state.getAllAnnotations()
          // 获取contoursTool的工具名称
          const contoursToolNames = this.contourTools.map(contourTool=>contourTool.toolName)
          if(allAnnotations?.length > 0)
          {
            console.log(allAnnotations)
            allAnnotations.forEach((nowAnnotation)=>{
              // 只删除contourTool产生的分割
              if(contoursToolNames.includes(nowAnnotation.metadata.toolName))
              {
                if(nowAnnotation.metadata.volumeId.startsWith(this.prefixId))
                  annotation.state.removeAnnotation(nowAnnotation.annotationUID)
              }
            })
          }
          this.viewportReRender(this.renderingEngineId);
        },

        // =========================== 关于布局的 =====================================
        handleShowLeftAside(){
          this.showLeftAside=!this.showLeftAside
        },

        handleShowRightAside(){
          this.showRightAside = !this.showRightAside
        },
        
        //========================== 以下是于服务器有关的，之后可以单独整成一个网页 ==========================================
        /**
         * @功能 - 将file(Blob类型)转化为 arraybuffer
         * @param file - 文件
         */
        fileToArrayBuffer(file)
        {
          return new Promise((resolve,reject)=>{
            const reader = new FileReader()
            reader.onload = (e)=>{
              resolve(e.target.result)
            }
            reader.onerror = (e)=>{
              reject(e.target.error)
            }
            // readAsArrayBuffer函数完成后，onload函数被触发，如何返回结果
            reader.readAsArrayBuffer(file)
          })
        },

        ArrayBufferToFile(Array, fileName) {
            // 创建 Blob 对象
            const blob = new Blob([Array]);
            // 创建 File 对象
            const file = new File([blob], fileName);
            return file;
        },

        /**
         * @功能 - 将Dicom文件转化为特殊格式dataset
         * @param file - 文件
         */
        async getDicomdict(file){
          const arrayBuffer = await this.fileToArrayBuffer(file)
          // const uint8Array = new Uint8Array(arrayBuffer);
          const dataset = dcmjs.data.DicomMessage.readFile(arrayBuffer)
          return dataset
        },

        /**
         * @功能 - 保存标注到DICOM文件中
         */
        async saveAnnotationsForDicom()
        {
          // 将所有的Annnotation都存在第一个文件之中
          const dicom = this.fileSet[0]
          const fileName = dicom.name
          console.log("first file",dicom)
          console.log("first file name",fileName)
          // 为单个Dicom图像保存它的注释，然后返回一个新的Dicom图像
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          const curSaveAnnotations = defaultAnnotationManager.getAllAnnotations()
          console.log(curSaveAnnotations)
          const dataset = await this.getDicomdict(dicom)
          // // 如果有注释的话
          if(curSaveAnnotations?.length > 0)
          {
            const tagAnnotationData = []
            for(const Annotation of curSaveAnnotations)
            {
              console.log(Annotation)
              if(Annotation.metadata.toolName !== CrosshairsTool.toolName)
              {
                tagAnnotationData.push(Annotation)
              }
            }
            console.log("tagAnnotationData",tagAnnotationData)
            const tagAnnotationDataJson = JSON.stringify(tagAnnotationData)
            dataset.upsertTag('10010010','UT',tagAnnotationDataJson)
          }
          const newDicomArrayBuffer = dataset.write()
          console.log("newfile",newDicomArrayBuffer)
          // 返回的是ArrayBuffer类型
          this.fileSet[0] = this.ArrayBufferToFile(newDicomArrayBuffer,fileName)
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
         * @功能 - 更新每次POST需要用到的CSRF箭令
         */
        async getCSRFDToken(){
          const response = await axios.get('http://localhost:8000/get_csrf_token/')
          this.csrfToken = response.data.token
        },

        async renderAnnotationsForDicom()
        {
          const contourToolsNames = contourTools.map(contourTool=>contourTool.toolName)
          if(!this.$globalData.annotations || this.$globalData.annotations.length <= 0)
          {
            console.log("没有注释")
              return
          }
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          let segmentationIndexs=[]
          let segmentIndexs=[]
          this.$globalData.annotations.forEach(async (Annotation)=>{
            if(Annotation.metadata.volumeId.startsWith(this.prefixId))
            {
              if(contourToolsNames.includes(Annotation.metadata.toolName))
              {
                const segmentationId = Annotation.data.segmentation.segmentationId
                const segmentationId_split = segmentationId.split("分割")
                const segmentationIndex = parseInt(segmentationId_split[segmentationId_split.length-1])
                const segmentIndex = parseInt(Annotation.data.segmentation.segmentIndex)
                // console.log("segmentationId",segmentationId)
                // console.log("segmentationIndex",segmentationIndex)
                // console.log("segmentIndex",segmentIndex)
                if(!segmentationIndexs.includes(segmentationIndex))
                  segmentationIndexs.push(segmentationIndex)
                segmentationIndexs.forEach(index=>{
                  let temp=[]
                  if(segmentIndexs[index-1])
                    temp = segmentIndexs[index-1]
                  else
                    temp = [] 
                  if(index === segmentationIndex)
                  {
                    if(!temp.includes(segmentIndex) && segmentIndex!==1)
                      temp.push(segmentIndex)
                  }
                  segmentIndexs[index-1] = temp
                })
              }
            } 
          })
          console.log("segmentationIndexs",segmentationIndexs)
          console.log("segmentIndexs",segmentIndexs)
          for(let i=0;i<segmentationIndexs.length;i++)
          {
            if(segmentationIndexs[i] === 1)
            {
              segmentIndexs[i].forEach(()=>{
                this.handleCreateNewSegment(i)
              })
            }else{
              await this.handleCreateNewSegmentation()
              segmentIndexs[i].forEach(()=>{this.handleCreateNewSegment(i)})
            }
          }
          this.$globalData.annotations.forEach(Annotation=>{
            if(Annotation.metadata.volumeId.startsWith(this.prefixId))
              defaultAnnotationManager.addAnnotation(Annotation)
          })
          this.viewportReRender(this.renderingEngineId);
          // 可能需要激活工具
        },

        // -------------------------------- 关于上传文件添加描述的 ----------------------------------
        handleDescriptionDialogVisible() {
          this.descriptionDialogVisible = true;
        },
        handleClose(done) {
          // 点击弹窗右上角的关闭按钮时触发
          this.$confirm("确认关闭？")
            .then(() => {
              done();
            })
            .catch(() => {});
        },
        cancel() {
          // 点击取消按钮
          this.descriptionDialogVisible = false;
        },
        submit() {
          this.descriptionDialogVisible = false;
        },

        async handleUploadAnnotationOnlyFormVisible() {
          await this.uploadAnnotationOnlyGetFolderNames()
          this.annotationOnlyFormVisible = true;
        },
        handleUploadAnnotationOnlyFormClose(done) {
          // 点击弹窗右上角的关闭按钮时触发
          this.$confirm("确认关闭？")
            .then(() => {
              done();
            })
            .catch(() => {});
        },
        uploadAnnotationOnlyFormCancel() {
          // 点击取消按钮
          this.annotationOnlyFormVisible = false;
        },
        uploadAnnotationOnlyFormSubmit() {
          this.annotationOnlyFormVisible = false;
        },

        // -------------------------------------- 关于上传文件添加描述的结束 --------------------------------

        /**
         * @功能 - 上传DICOM文件以及对应的注释
         */
        async uploadFilesAndAnnotationsToServer(){
          if(!this.fileSet)
          {
            ElMessage({
              message:"还未导入任何文件!",
              type:'warning',
            })
            this.submit()
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
          const type = response.status === 200 ? 'success' : 'warning';
          ElMessage({
            message: response.data.msg,
            type: type,
          });
          // 上传标注数据
          await this.saveAnnotations();
          // 上传DICOM文件数据
          const formData = new FormData();
          this.fileSet.forEach(file=>formData.append(file.name,file))
          
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
          this.submit()
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
          
          if(!this.fileSet)
          {
            ElMessage({
              message:"还未导入任何文件!",
              type:'warning',
            })
            this.uploadAnnotationOnlyFormSubmit()
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
          const type = response.status === 200 ? 'success' : 'warning'
          ElMessage({
            message:response.data.msg,
            type:type
          })
          await this.saveAnnotations()
          this.uploadAnnotationOnlyFormSubmit()
          this.uploadAnnotationOnlyFormData.annotationName = original_name
          this.uploadFilesAndAnnotationLoading = false
        },

        async getDicomInformationFromServer(){
          // 从服务器导入文件夹信息（列表），GET 请求即可
          // 显示folderModal
          this.showDicomInformationMenu = true
          axios.get("http://localhost:8000/FolderModal/")
          .then(response=>{
            const datas = response.data.data
            console.log(datas)
            const _DicomInformationLists = []
            datas.forEach((data,index)=>{
              const tempobj = {}
              tempobj['id'] = index
              tempobj['name'] = data
              tempobj['downloadFolderProcess'] = 0
              tempobj['downloadFolderDCMProcess'] = 0
              _DicomInformationLists.push(tempobj)
            })
            this.DicomInformationLists = _DicomInformationLists
            console.log("DicomInformationLists",this.DicomInformationLists)
          })
        }, 
        
        /**
         * 无效函数
         * @param folderId 
         */
        async downloadDicomsToWebFromServer(folderId){
          /*  从指定文件夹中导入文件，并且获得的最开始是zip文件，然后解压zip文件获得所有dcm文件
              之后将所有dcm文件处理后存储到this.fileSet和this.imageIds中
          */

          // 这里是为了提醒已经开始导入了。
          this.DicomInformationLists[folderId].downloadFolderProcess = 1

          const response = await axios.get('http://localhost:8000/get_csrf_token/')
          this.csrfToken = response.data.token
          await axios.post("http://localhost:8000/getFolderModalFiles/",String(folderId),{
            headers:{
              'Content-Type':"application/plain",
              'X-CSRFToken': this.csrfToken,
            }
          })
          const response1 = await axios.get(`http://localhost:8000/getFolderModalFiles/`,{
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
              const total = progressEvent.total;
              const current = progressEvent.loaded;
              const process = Math.round((current / total) * 100);
              if(process === 0)
                this.DicomInformationLists[folderId].downloadFolderProcess = 1
              else if(process === 100)
                this.DicomInformationLists[folderId].downloadFolderProcess = 99
              else
                this.DicomInformationLists[folderId].downloadFolderProcess = process
            }
          })
          // 获取zip数据
          const zipdata = response1.data
          // 创建一个zip实例
          const zip = new JSZip()
          // 载入 ZIP 文件
          const zipContent = await zip.loadAsync(zipdata);
          // 获取 ZIP 文件中的所有文件的promise
          const filePromises = Object.keys(zipContent.files).map(async (filename) => {
            const fileData = await zipContent.files[filename].async("blob"); // 你可以选择不同的类型："string" , "uint8array", "blob", "base64" 等
            return fileData
          });
          // 获取所有的文件
          const files = await Promise.all(filePromises);
          await this.handleFilesAndImageIds(files)
          await this.run()
          this.DicomInformationLists[folderId].downloadFolderProcess  = 100
          this.DicomInformationLists[folderId].downloadFolderProcess  = 0
        },
        //===================================== 服务器部分结束 ===============================================

        //===================================== 以下是于DICOM文件的显示相关的 =======================================
        /**
         * @功能 - 重新渲染renderingEngineId上已经建立的所有viewport
         * @param renderingEngineId 渲染引擎的ID
         */
        viewportReRender(renderingEngineId)
        {
          const renderingEngine = getRenderingEngine(renderingEngineId)
          if (renderingEngine)
          {
            const viewports = renderingEngine.getViewports()
            if(viewports?.length > 0){
              viewports.forEach(viewport=>
              {
                viewport.render()
              })
            } 
          }
        },

        /**
         * @功能 - 删除选中的注释，这是为document添加的事件
         * @param evt - 为document添加的事件的对象
         */
        selectedAnnotationDelect(evt){
          if(evt.key === 'Delete')
          {
            evt.preventDefault()
            const annotationUIDs = annotation.selection.getAnnotationsSelected()
            if(annotationUIDs?.length > 0 && 
            annotation.state.getAnnotation(annotationUIDs[0])?.metadata?.toolName !== CrosshairsTool.toolName)
            {
              annotation.state.removeAnnotation(annotationUIDs[0])
              this.viewportReRender(this.renderingEngineId)
            }
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
         * @功能 - 根据lower和uper计算WW,WL
         * @param lower 下限
         * @param upper 上限
         * @return {object}   
         */
        getWindowData(lower,upper)
        {
          return utilities.windowLevel.toWindowLevel(lower,upper);
        },

        /**
         * @功能 - 这是一个回调函数，可以实现Crosshairs工具的颜色变化。
         * @param viewportId 
         */
        getReferenceLineColor(viewportId) {
          return this.viewportColors[viewportId];
        },

        // ==================================== 同步器的函数 ========================================
        addCameraPositionSycronizers(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          synchronizers.createCameraPositionSynchronizer(cameraPositionSynchronizerId)
          // 获取这个创建的同步器
          const cameraPositionSynchronizer = SynchronizerManager.getSynchronizer(cameraPositionSynchronizerId)
          // 为同步器添加源视图和目标视图
          cameraPositionSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId1 });
          cameraPositionSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId2 });
          cameraPositionSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId3 });
          // cameraPositionSynchronizer.
        },

        addVOISycronizers(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(this.VOISynchronizerId))
            synchronizers.createVOISynchronizer(this.VOISynchronizerId)
          // 获取这个创建的同步器
          VOISynchronizer = SynchronizerManager.getSynchronizer(this.VOISynchronizerId)
          // 为同步器添加源视图和目标视图
          VOISynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId1 });
          VOISynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId2 });
          VOISynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId3 });
          VOISynchronizer.setEnabled(false)
        },

        addZoomPanSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(this.zoomPanSynchronizerId))
            synchronizers.createZoomPanSynchronizer(this.zoomPanSynchronizerId)
          // 获取这个创建的同步器
          zoomPanSynchronizer = SynchronizerManager.getSynchronizer(this.zoomPanSynchronizerId)
          // 为同步器添加源视图和目标视图
          zoomPanSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId1 });
          zoomPanSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId2 });
          zoomPanSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId3 });
          // 默认情况下是不使用同步器的
          zoomPanSynchronizer.setEnabled(false);
          // cameraPositionSynchronizer.
        },

        addImageSliceSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          synchronizers.createImageSliceSynchronizer(imageSliceSynchronizerId)
          // 获取这个创建的同步器
          const imageSliceSynchronizer = SynchronizerManager.getSynchronizer(imageSliceSynchronizerId)
          // 为同步器添加源视图和目标视图
          imageSliceSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId1 });
          imageSliceSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId2 });
          imageSliceSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId3 });
          // cameraPositionSynchronizer.
        },

        addSlabThicknessSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(this.slabThicknessSynchronizerId))
            synchronizers.createSlabThicknessSynchronizer(this.slabThicknessSynchronizerId)
          // 获取这个创建的同步器
          slabThicknessSynchronizer = SynchronizerManager.getSynchronizer(this.slabThicknessSynchronizerId)
          // 为同步器添加源视图和目标视图
          slabThicknessSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId1 });
          slabThicknessSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId2 });
          slabThicknessSynchronizer.add({ renderingEngineId:this.renderingEngineId, viewportId: this.viewportId3 });
          slabThicknessSynchronizer.setEnabled(false)

        },

        handleVoiSynchronizeValue(value){
          if(!VOISynchronizer)
            return
          // 初始化同步器
          VOISynchronizer.setEnabled(value)
        },

        handleZoomPanSynchronizeValue(value){
          if(!zoomPanSynchronizer)
            return
          zoomPanSynchronizer.setEnabled(value)
        },

        handleSlabThicknessSynchronizeValue(value){
          if(!slabThicknessSynchronizer)
            return
          slabThicknessSynchronizer.setEnabled(value)
        },
        // ==================================== 同步器结束 =========================================
        // ===================================== 文字信息的 =======================================
        handleSliceChange(viewportId,value){
          this.isChangeSlider[viewportId] = true
          this.curViewportId=viewportId
          const viewport = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
          .find(viewport=>viewport.id===viewportId)
          const viewRef = viewport.getViewReference()
          if(viewRef)
          {
            viewport.setViewReference({...viewRef,sliceIndex:value})
            this.sliceIndexs[viewportId] = value
            viewport.render()
          }   
        },

        renderTextSlider(viewportId,element){
          render(null, element); // 清空容器
          const viewport = getRenderingEngine(this.renderingEngineId).getViewport(viewportId)
          this.textSliderElements[viewportId] = h(TextWithSlider,{
            min:1,
            max:viewport.getNumberOfSlices(),
            curSliceIndex:this.sliceIndexs[viewportId],
            onHandleSliceChange:(value)=>{this.handleSliceChange(viewportId,value)},
            zoomScale:this.zoomScales[viewportId],
            WW:this.windowLevels[viewportId].windowWidth,
            WL:this.windowLevels[viewportId].windowCenter,
            rotation:this.rotateAngles[viewportId],
          },{ default:()=>[]})
          render(this.textSliderElements[viewportId],element)
        }, 

        // ==================================== colorBar的 =========================================
        renderColorbarMenu(viewportId,renderZoneItem)
        {
          render(null, renderZoneItem); // 清空容器
          // 创建一个控制颜色条的菜单
          this.colorbarControlMenus[viewportId] =h(ColorbarControlMenu, { class: "ColorbarControlMenu",
          isShow:this.showColorbarsMenus[viewportId],
          isShowColorbar:this.isShowColorbars[viewportId],
          colorbarName:this.colorbarNames[viewportId],
          onHandleShowColorbar:(value)=>{this.handleShowColorbar(viewportId,value)},
          onHandleSelectColorbar:(value)=>{this.handleSelectColorbar(viewportId,value)},
          }, { default:()=>[]})
          this.colorbarControlZones[viewportId] = h('div',{class:'colorbarControlZone'},[this.colorbarControlBoxs[viewportId],
          this.colorbarControlMenus[viewportId]])

          // 使用 Vue 的 render 方法将虚拟节点渲染到 DOM 中
          render(this.colorbarControlZones[viewportId], renderZoneItem);
        },

        handleColorbarControlBox(evt,viewportId,renderZoneItem){
          evt.stopPropagation()
          this.curRenderZone  = renderZoneItem
          this.curViewportId = viewportId
          if(this.showColorbarsMenus[viewportId] !== null)
            this.showColorbarsMenus[viewportId] = !this.showColorbarsMenus[viewportId]
        },

        handleShowColorbar(viewportId,value)
        {
          // 更新控制颜色条显示的按钮的显示情况
          this.isShowColorbars[viewportId] = value
          if(value)
          {
            this.colorbarContainers[viewportId].style.display='block'
          }
          else
          {
            this.colorbarContainers[viewportId].style.display='none'

          }
            
        },

        handleSelectColorbar(viewportId,value)
        { 
          this.ctColorbars[viewportId].activeColormapName=value
          this.setViewportColormap(viewportId,value)
          this.colorbarNames[viewportId]=value
        },

        // Change the colormap of an specific viewport
        setViewportColormap(viewportId,colormapName) {
          // Get the rendering engine
          const renderingEngine = getRenderingEngine(this.renderingEngineId);

          // Get the volume viewport
          const viewport = (
            renderingEngine.getVolumeViewports().find(viewport=>viewport.id === viewportId) // 这里先用viewportId1测试一下
          );
          viewport.setProperties({ colormap: { name: colormapName } });
          viewport.render();
        },

        handleSingleClickHideColorbarMenu(event)
        {
          // 如果点击的位置不在菜单内部，则隐藏菜单
          if (!event.target.closest('.ColorbarControlMenu')) {
            Object.keys(this.colorbarControlMenus).forEach(viewportId=>{
              this.showColorbarsMenus[viewportId] = false
            })
          }
        },

        // ==================================== colorbar结束 ============================================

        /**
         * @功能 - 处理相机变化事件，这是为了获得一些参数
         * @param e - 回调事件对象
         */
        handleCameraModified(e){
          const renderingEngine = getRenderingEngine(this.renderingEngineId)
          const viewport = renderingEngine.getViewport(e.detail.viewportId)
          
          if( viewport && this.zoomFlag)
          {
            this.curViewportId = viewport.id
            if(viewport.id === viewportId4)
              return
            this.isRenderSlider = this.isChangeSlider[this.curViewportId] ? false : true
            this.isChangeSlider[this.curViewportId]=false
            this.zoomScales[viewport.id]= viewport.getZoom()
            this.sliceIndexs[viewport.id] = viewport.getSliceIndex()
            this.rotateAngles[viewport.id] = viewport.getRotation()
          }
        },

        handleVOIModified(e){
          // VOI_MODIFIED
          
          const renderingEngine = getRenderingEngine(this.renderingEngineId)
          const viewport = renderingEngine.getViewport(e.detail.viewportId)
          
          if(viewport)
          {
            if(viewport.id === viewportId4)
              return
          }
            
          if(e.detail.range)
            this.windowLevels[viewport.id] = this.getWindowData(e.detail.range.lower,e.detail.range.upper)
        },

        /**
         * @功能 - 重置视图
         */
        handleReset(){
          const Viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports();
          const voiRange = this.getVoiRange(this.original_wl.windowWidth,this.original_wl.windowCenter);
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

        /**
         * @功能 - 切换工具栏的工具，使用鼠标左键可以激活对应工具
         * @param {String} toolName - 想要切换的工具的名称
         */
        handleChangeActiveTool(toolName){
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId);
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
        },

        /**
         * @功能 - 处理winodowlevelDropdown（一个下拉列表，可以选择常用部位对应的窗宽窗位）的回调
         * @param {string} value - 在这里指的是部位的名称
         */
        handleWindowLevelDropdownCallback(value){
          const windowData = this.voiData[value]
          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
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
          if(!this.fileImageIds)
          {
            return
          }
          this.curOrientation = value

          const temparr = []
          temparr.push(this.curOrientation)
          this.exportForm.exportOrientation = temparr

          const viewportInput = this.viewportInputsObjects[value]
          const Id = this.prefixId+":"+'renderZoneItem1'
          this.createViewport(
            Id,
            this.renderingEngineId,
            viewportInput,
            this.toolGroupId,
            this.fileImageIds,
            this.segmentationId,
            this.volumeId
          )
        },

        handleChangeSlabThickness(value){
          console.log(value)
          let blendModeToUse;
          switch (value) {
            case "最大强度投影":
              blendModeToUse = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND;
              break;
            case "最小强度投影":
              blendModeToUse = Enums.BlendModes.MINIMUM_INTENSITY_BLEND;
              break;
            case "平均强度投影":
              blendModeToUse = Enums.BlendModes.AVERAGE_INTENSITY_BLEND;
              break;
            default:
              throw new Error('undefined orientation option');
          }
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId);
          if(!toolGroup)
            return
          const crosshairsInstance = toolGroup.getToolInstance(
            CrosshairsTool.toolName
          );
          // 获取旧版配置
          const oldConfiguration = crosshairsInstance.configuration;
          // 将旧版配置与新的配置融合
          crosshairsInstance.configuration = {
            ...oldConfiguration,
            slabThicknessBlendMode: blendModeToUse,
          };
          // Update the blendMode for actors to instantly reflect the change
          const renderingEngine = getRenderingEngine(this.renderingEngineId)
          renderingEngine.getVolumeViewports().forEach((viewport)=>{
            viewport.setBlendMode(blendModeToUse)
            viewport.render()
          })
        },

        /**
         * @功能 - 以下是所有关于Annotations工具的配置
         */
        handleAnnotationToolsLineWidth(toolName,value)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          this.annotationConfigStyleDefaultConfig.lineWidth = String(value)
          const styles ={
            [toolName]:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(this.toolGroupId,styles);
          this.viewportReRender(this.renderingEngineId)
        },
        handleAnnotationToolsLineDash(toolName,value)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          this.annotationConfigStyleDefaultConfig.lineDash = String(value)
          const styles ={
            [toolName]:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(this.toolGroupId,styles);
          this.viewportReRender(this.renderingEngineId)
        },
        handleAnnotationColors(toolName,colorWheelId,value,)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          if(colorWheelId === 0)
          {
            this.annotationConfigStyleDefaultConfig.color = value
            this.annotationConfigStyleDefaultConfig.textBoxColor = value
          }else if(colorWheelId === 1)
          {
            this.annotationConfigStyleDefaultConfig.colorHighlighted = value
            this.annotationConfigStyleDefaultConfig.textBoxColorHighlighted = value
          }else if(colorWheelId === 2)
          {
            this.annotationConfigStyleDefaultConfig.colorSelected = value
            this.annotationConfigStyleDefaultConfig.textBoxColorSelected = value
          }else if(colorWheelId === 3)
          {
            this.annotationConfigStyleDefaultConfig.colorLocked = value
            this.annotationConfigStyleDefaultConfig.textBoxColorLocked = value
          }
          const styles ={
            [toolName]:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(this.toolGroupId,styles);
          this.viewportReRender(this.renderingEngineId)
        },
        handleAnnotationShowText(toolName,value)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          this.annotationConfigStyleDefaultConfig.textBoxVisibility = value
          const styles ={
            [toolName]:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(this.toolGroupId,styles);
          this.viewportReRender(this.renderingEngineId)
        },
        handleAnnotaionShowTool(toolName,value)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          const FrameOfReferenceUID = defaultAnnotationManager.getFramesOfReference()[0]
          const annotations = defaultAnnotationManager.getAnnotations(FrameOfReferenceUID,toolName)
          if(annotations?.length>0)
          {
            annotations.forEach(Annotation=>{
              if(Annotation.metadata.volumeId.startsWith(this.prefixId))
                annotation.visibility.setAnnotationVisibility(Annotation.annotationUID,value)
            })
          }
          this.viewportReRender(this.renderingEngineId)
        },
        handleAnnotationDelete(toolName)
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          const FrameOfReferenceUID = defaultAnnotationManager.getFramesOfReference()[0]
          const annotations = defaultAnnotationManager.getAnnotations(FrameOfReferenceUID,toolName)
          if(annotations?.length>0)
          {
            annotations.forEach(Annotation=>{
              // 不要删除CrosshairsTool的annotation
              if(Annotation.metadata.toolName !== CrosshairsTool.toolName)
                if(Annotation.metadata.volumeId.startsWith(this.prefixId))
                  annotation.state.removeAnnotation(Annotation.annotationUID)
            })
          }     
          this.viewportReRender(this.renderingEngineId)
        },
        handleAllAnnotationDelete()
        {
          const toolGroup = ToolGroupManager.getToolGroup(this.toolGroupId)
          if(!toolGroup)
            return
          const allAnnotations = annotation.state.getAllAnnotations()
          // 获取contoursTool的工具名称
          const contoursToolNames = this.contourTools.map(contourTool=>contourTool.toolName)
          if(allAnnotations?.length > 0)
          {
            console.log(allAnnotations)
            allAnnotations.forEach((nowAnnotation)=>{
              // 不要删除CrosshairsTool的注释，也不要删除contoursTool生成的分割
              if(
                nowAnnotation.metadata.toolName !== CrosshairsTool.toolName
                && !contoursToolNames.includes(nowAnnotation.metadata.toolName)
              )
              {
                if(nowAnnotation.metadata.volumeId.startsWith(this.prefixId))
                  annotation.state.removeAnnotation(nowAnnotation.annotationUID)
              }
            })
          }
          this.viewportReRender(this.renderingEngineId);
        },

        /**
         * @功能 - 根据slider的ID修改工具的线宽以及Dash
         * @param menuId - 菜单的ID号，这里设置成对应的工具的名称，因为一个工具对应一个菜单
         * @param sliderId - 每个菜单中slider的ID号，用于区别slider的功能，比如0表示线宽
         * @param {Number} value - 指定菜单号下的指定sliderID的slider的当前数值
         */
        handleMenuSliders(menuId,sliderId,value){
          if(sliderId === 0)
          {
            this.handleAnnotationToolsLineWidth(menuId,value)
          }
          else if(sliderId === 1)
          {
            this.handleAnnotationToolsLineDash(menuId,value)
          }
        },

        /**
         * @功能 - 根据colorwheel的ID修改工具颜色
         * @param menuId - 菜单的ID号，这里设置成对应的工具的名称，因为一个工具对应一个菜单
         * @param colorWheelId - 每个菜单中colorwheel的ID号，用于区别colorwheel的功能，比如0表示为选中时的颜色
         * @param {String} value - 指定菜单号下的指定colorWheelId的colorwheel的当前数值
         */
        handleMenuColorWheels(menuId,colorWheelId,value){
          this.handleAnnotationColors(menuId,colorWheelId,value)
        },

        /**
         * @功能 - 根据switch的ID修改工具显示
         * @param menuId - 菜单的ID号，这里设置成对应的工具的名称，因为一个工具对应一个菜单
         * @param switchId - 每个菜单中switch的ID号，用于区别switch的功能，比如0表示为文本显示
         * @param {bool} value - 指定菜单号下的指定switchId的switch的当前数值
         */
        handleMenuSwitchs(menuId,switchId,value)
        {
          if(switchId === 0)
            this.handleAnnotationShowText(menuId,value)
          else if(switchId === 1)
            this.handleAnnotaionShowTool(menuId,value)
        },

        handleMenuButton(menuId,buttonId)
        {
          if(buttonId === 0)
            this.handleAnnotationDelete(menuId)
          else if(buttonId === 1)
            this.handleAllAnnotationDelete()
        },

        /**
         * @参数 evt - 触发的事件对象
         * @功能 - 处理文件导入事件
         */
        async handleChange(evt) {
          // 阻止事件冒泡
          evt.stopPropagation();
          evt.preventDefault();
          // 用户传入获得文件数组
          // 将文件数组转化成ImageIds
          // 对imageIds 进行排序
          const filelist = evt.target.files; // filelist
          // 判断输入的iamgeIds1是否为空，或者不符合其他要求
          if(filelist.length === 0)
          {
            alert("导入的文件夹不能为空！");
            return;
          }else if(filelist.length < 5){
            alert("请至少选择5张dicom图片进行MPR展示");
            return;
          }
          this.renderZoneLoading=true;
          
          this.fileSet = Array.from(filelist) // 转换成存储file对象的数组
         
          // 主程序，生成视图的整个流程
          await this.run()
          // 渲染注释（如果有的话）
          // this.renderAnnotations()
        },

        mySort(a,b){
          // 创建一个索引数组
          const indices = a.map((value, index) => index);
          // 根据 a 的值对 indices 进行排序
          indices.sort((i, j) => a[i] - a[j]);
          // 根据排序后的 indices 重新排列 b
          const sortedB = indices.map(index => b[index]);
          return sortedB
        },

        /**
         * (不会用到了)
         * @param files - 文件数组，每个文件的类型是Blob
         * @功能 - 获得对应files的filesImageIds，用于渲染
         */
        async handleFilesAndImageIds(files){
            // 存储可以用于排序的元数据信息
          let image_array = []
          // 排序前的ImageIds
          const imageIds = [];
          // 使用已有库的函数获得files对应的fileImageIds
          files.forEach(file => {
            const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
            imageIds.push(imageId);
          });
          // 加载图像信息，这样才可以获得dcm元数据
          await this.prefetchMetadataInformation(imageIds)
          
          // 获取元数据中的sliceLocation,用于对dcm进行排序，正确的顺序才能够被Volume正常显示
          imageIds.forEach(image => {          
            image_array.push(metaData.get("imagePlaneModule",image).sliceLocation)
          })
          // 获得排序后的数组imageIds
          this.fileImageIds= this.mySort(image_array,imageIds)
          // 获得排序后的文件
          this.fileSet = this.mySort(image_array,files)
          // 更新最新的文件集
          this.$globalData.fileSet = this.fileSet
        },

        /**
         * 
         * @param imageIdsToPrefetch - imageIds数组
         * @功能 - 将imageId对应的image数据缓存起来
         */
        async prefetchMetadataInformation(imageIdsToPrefetch) {
          for (let i = 0; i < imageIdsToPrefetch.length; i++) {
            await imageLoader.loadAndCacheImage(imageIdsToPrefetch[i])
          }
        },

        /**
         * @功能 - 初始化所有的工具，这样之后才可以使用toolGroup.addTool()函数
         */
        addTools(){
          // 这行代码是用来检测当前设备是否是移动设备（如手机或平板电脑）的一种方法,是则true,不是则返回false
          // const isMobile = window.matchMedia('(any-pointer:coarse)').matches; 
          // ================================工具========================================
          // 创建toolGroup
          let toolGroup = ToolGroupManager.createToolGroup(this.toolGroupId)
          // 如果已经创建了Group，就不能再创建工具租了，所以这里就直接获取该toolGroup就行
          if(!toolGroup)
          {
            ToolGroupManager.destroyToolGroup(this.toolGroupId)
            toolGroup = ToolGroupManager.createToolGroup(this.toolGroupId)
          }
          
            
          //=================================注册tool======================================
          // 操作类
          addTool(PanTool);
          addTool(ZoomTool);
          addTool(WindowLevelTool);
          addTool(StackScrollTool);
          addTool(DragProbeTool);
          addTool(PlanarRotateTool);
          addTool(CrosshairsTool);
          // 注释类
          addTool(LengthTool);
          addTool(BidirectionalTool);
          addTool(ArrowAnnotateTool);
          addTool(RectangleROITool);
          addTool(EllipticalROITool);
          addTool(CircleROITool);
          addTool(AdvancedMagnifyTool);
          // 分割类
          // labelmapTools
          addTool(BrushTool);
          addTool(RectangleScissorsTool);
          addTool(CircleScissorsTool);
          addTool(SphereScissorsTool);
          addTool(PaintFillTool);
          // contourTools
          addTool(PlanarFreehandContourSegmentationTool);
          addTool(PlanarFreehandROITool);
          addTool(SplineContourSegmentationTool);
          addTool(SplineROITool);
          addTool(LivewireContourSegmentationTool);
          addTool(LivewireContourTool);

          // 3D视图工具
          addTool(TrackballRotateTool);
          return toolGroup
        },

        activeToolsToSpecificToolGroup(toolGroupId,toolNames,modes)
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(toolNames?.length > 0)
          {
            toolNames.forEach((toolName,index)=>{
              // 只有工具组中已经添加了对应的工具才能够进行状态处理
              if(toolGroup.hasTool(toolName))
              {
                // 添加工具名称以及对应的配置
                if(modes?.length === 1)
                {
                  if(modes[0].mode === 'active')
                    toolGroup.setToolActive(toolName,{bindings:modes[0].bindings})
                  else if(modes[0].mode === 'passive')
                    toolGroup.setToolPassive(toolName)
                  else if(modes[0].mode === 'enabled')
                    toolGroup.setToolEnabled(toolName)
                  else if(modes[0].mode === 'disabled')
                    toolGroup.setToolDisabled(toolName)
                }else{
                  if(modes[index])
                  {
                    if(modes[index].mode === 'active')
                        toolGroup.setToolActive(toolName,{bindings:modes[index].bindings})
                    else if(modes[index].mode === 'passive')
                        toolGroup.setToolPassive(toolName)
                    else if(modes[index].mode === 'enabled')
                        toolGroup.setToolEnabled(toolName)
                    else if(modes[index].mode === 'disabled')
                        toolGroup.setToolDisabled(toolName)
                  }
                }
              }
            })
          }
        },

        addToolsToSpecificToolgroup(toolGroupId,toolNames,configurations=[],toolInstanceObjects=[])
        {
          if(!toolGroupIs.includes(toolGroupId))
            toolGroupIs.push(toolGroupId)
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(toolNames?.length > 0)
          {
            toolNames.forEach((toolName,index)=>{
              // 添加工具名称以及对应的配置
              if(configurations[index])
                toolGroup.addTool(toolName,configurations[index])
              else
                toolGroup.addTool(toolName)
            })
          }
          if(toolInstanceObjects?.length > 0)
          {
            toolInstanceObjects.forEach(toolInstanceObject=>{
              toolGroup.addToolInstance(toolInstanceObject.toolName,toolInstanceObject.parentClassName,toolInstanceObject.configuration)
            })
          }   
        },

        async initializeVolumeViewport(
          viewport,
          volumeId,
          segmentationId,
          imageIds,
        ) {
          let volume = cache.getVolume(volumeId);
          if(!volume)
          {
            volume = await volumeLoader.createAndCacheVolume(volumeId, {
              imageIds,
            });
          }
          await this.initSegmentation(volumeId,segmentationId,viewport)
          // Set the volume on the viewport
          await viewport.setVolumes([
            { volumeId },
          ]);

          viewport.render()
          // 初始化所有的数据
          this.zoomScales[viewport.id] = viewport.getZoom()
          this.sliceIndexs[viewport.id] = viewport.getSliceIndex()
          this.rotateAngles[viewport.id] = viewport.getRotation()
          this.isChangeSlider[viewport.id] = false
          if(!this.volumeViewportIds.includes[viewport.id])
            this.volumeViewportIds.push(viewport.id)
          return volume;
        },

        async initialze3DViewport(
          viewport,
          volumeId,
          imageIds,
        ){
          let volume = cache.getVolume(volumeId);
          if(!volume)
          {
            volume = await volumeLoader.createAndCacheVolume(volumeId, {
              imageIds,
            });
          }
          // Set the volume to load
          volume.load();
          // Set the volume on the viewport
          await viewport.setVolumes([
            { volumeId },
          ]);

          viewport.setProperties({
            preset : 'CT-Bone',
          })
          viewport.render()
          return volume;
        },

        async initSegmentation(volumeId,segmentationId,viewport){
          let segmentationVolume = cache.getVolume(segmentationId);
          if(!segmentationVolume)
          {
            // Create a segmentation of the same resolution as the source data
            segmentationVolume = volumeLoader.createAndCacheDerivedLabelmapVolume(
              volumeId,
              {
                volumeId: segmentationId,
              }
            );
          }
          
          // Add the segmentations to state
          if(!segmentation.state.getSegmentation(segmentationId))
          {
            segmentation.addSegmentations([
            {
              segmentationId: segmentationId,
              representation: {
                // The type of segmentation
                type: csToolsEnums.SegmentationRepresentations.Contour,
                // The actual segmentation data, in the case of labelmap this is a
                // reference to the source volume of the segmentation.
                data: {
                  volumeId: segmentationId,
                },
              },
            },
            ]);

            // // 添加contous分割的数据
            // segmentation.addRepresentationData({
            //   segmentationId,
            //   type: csToolsEnums.SegmentationRepresentations.Contour,
            //   data: {},
            // });
          }
          
          segmentation.addSegmentationRepresentations(viewport.id, [
            {
              segmentationId: segmentationId,
              type: csToolsEnums.SegmentationRepresentations.Contour,
            },
          ]);
            console.log('初始化',viewport.id)
          // await segmentation.addContourRepresentationToViewport(
          //   viewport.id, 
          //   [
          //     {
          //       segmentationId,
          //       type: csToolsEnums.SegmentationRepresentations.Contour,
          //     },
          //   ],
          // )
        },

        /**
         * @功能 - 取消正在绘制（仍未绘制完成）的Annotation类工具
         * @param {object} evt 
         */
        cancelDrawingEventListener(evt){
          const { element, key } = evt.detail;
          if (key === 'Escape') {
            const annotationUID = cancelActiveManipulations(element);
            if(annotationUID)
              annotation.state.removeAnnotation(annotationUID)
          }
        },

        // ================================= 以下与视图相关 ===================================
        
        async handleDoubleClickRenderZoneItems(index){
          this.zoomFlag = false
          const renderingEngine = getRenderingEngine(this.renderingEngineId)
          
          // 最小化
          if(this.windowIsMaximized && index === this.maximizedWindow)
          {
            if(this.curWindowNumbers>1)
            {
              this.renderZoneItemsWidth=Math.trunc(1/this.curWindowNumbers*100)+"%"
              this.windowIsMaximized=false
              this.maximizedWindow=null
              // 等待所有组件渲染完成
              await this.$nextTick();
            }  
          }else{
            if(this.curWindowNumbers>1)
            {
              this.renderZoneItemsWidth='100%'
              this.windowIsMaximized=true
              this.maximizedWindow=index
              // 等待所有组件渲染完成
              await this.$nextTick();
            }
          }
          console.log(this.zoomScale)
          
          renderingEngine.resize(true); 

          const viewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports();
          viewports.forEach(viewport=>{
            const preCamera = viewport.getCamera()
            console.log("Pre",preCamera)
            viewport.resetCameraForResize()
            viewport.render()
            const nowCamera = viewport.getCamera()
            console.log("after reset,",nowCamera)
            const parallelScale = (nowCamera.parallelScale)
            // 如果对应的zoomScale存在的话
            if(this.zoomScales[viewport.id])
              preCamera.parallelScale = parallelScale/this.zoomScales[viewport.id]
            viewport.setCamera(preCamera)
            viewport.render()
          })
          // 可以触发缩放事件
          this.zoomFlag=true
        },

        /**
         * @功能 - 根据用户的选择改变窗口类型（即窗口个数和排版）
         * @param {string} name - 视图窗口类型，根据这个类型可以进行viewport的创建
         * @param winodwNumbers - 视图窗口个数
         */
        async handMultiWindows(name,winodwNumbers)
        {
          this.renderZoneItemsWidth=Math.trunc(1/winodwNumbers*100) +'%'
          this.curWindowNumbers=winodwNumbers;
          // 等待所有组件渲染完成
          await this.$nextTick();

          if(name==='single')
          {
            this.orientationDisable=false
            const temparr = []
            temparr.push(this.curOrientation)
            this.exportForm.exportOrientation = temparr
            // 不可以使用crosshair工具
            this.crosshairDisabled = true
            if(!this.fileImageIds)
              return
            const id = this.prefixId+":"+'renderZoneItem1'
            await this.createViewport(
              id,
              this.renderingEngineId,
              this.viewportInputsObjects[this.curOrientation],
              this.toolGroupId,
              this.fileImageIds,
              this.segmentationId,
              this.volumeId,
            )
          }
          // 渲染MPR的时候，记得crosshairs工具
          else if(name === 'MPR')
          {
            // 禁用方向选择工具，因为这个模式就是三个方向都显示了。
            this.orientationDisable=true
            // 可以使用crosshair工具
            this.crosshairDisabled = false
            
            if(!this.fileImageIds)
              return
            const IdNumbers = Array.from({length:this.curWindowNumbers},(_,index)=>index+1)
            const Ids = IdNumbers.map(val=>this.prefixId+`:renderZoneItem${val}`)
            const viewportInputsObjectsNames = Object.keys(this.viewportInputsObjects)
            for(let [index,id] of Ids.entries())
            {
              await this.createViewport(
                id,
                this.renderingEngineId,
                this.viewportInputsObjects[viewportInputsObjectsNames[index]],
                this.toolGroupId,
                this.fileImageIds,
                this.segmentationId,
                this.volumeId,
              )
            }
            // 激活十字交叉工具
            const toolGroup=ToolGroupManager.getToolGroup(this.toolGroupId)
            toolGroup.addTool(CrosshairsTool.toolName,{getReferenceLineColor:this.getReferenceLineColor})
            toolGroup.setActivePrimaryTool(CrosshairsTool.toolName)

            // 添加同步器
            this.addVOISycronizers()
            this.addZoomPanSynchronizer()
            this.addSlabThicknessSynchronizer()

            // 这个是必须的，否则不能正确地slabThickness同步
            const volumeViewports = getRenderingEngine(this.renderingEngineId).getVolumeViewports()
            volumeViewports.forEach((volumeViewport)=>{
              volumeViewport.setBlendMode(Enums.BlendModes.MAXIMUM_INTENSITY_BLEND)
              volumeViewport.render()
            })

            // 对所有的baseAnnotaionTool加上一个passive
            this.activeToolsToSpecificToolGroup(this.toolGroupId,
            contourTools.map(baseAnnotationTool=>baseAnnotationTool.toolName),
            [{mode:'passive'}],
            )
          }

          // 渲染3D图像
          else if(name === '3D')
          {
            // 这个模式下不能导出任何东西
            this.exportForm.exportOrientation = []
            // 禁用方向选择工具，因为这个模式就是三个方向都显示了。
            this.orientationDisable=true
            // 禁用crosshair工具
            this.crosshairDisabled = true
            if(!this.fileImageIds)
              return
            
            const id = this.prefixId+":"+'renderZoneItem1'
            await this.createViewport(
              id,
              this.renderingEngineId,
              this.viewportInputsObjects['3D'],
              this.toolGroup3DId,
              this.fileImageIds,
              this.segmentationId,
              this.volume3DId,
            )
            const toolGroup=ToolGroupManager.getToolGroup(this.toolGroup3DId)
            toolGroup.addTool(TrackballRotateTool.toolName)
            toolGroup.addTool(ZoomTool.toolName)
            toolGroup.setActivePrimaryTool(TrackballRotateTool.toolName)
            toolGroup.setToolActive(ZoomTool.toolName,{
              bindings:[
                {
                  mouseButton:csToolsEnums.MouseBindings.Wheel
                }
              ]
            })
          }

          // 把所有的annotation工具设置为消极状态
          this.activeToolsToSpecificToolGroup(this.toolGroupId,
            baseAnnotationTools.map(baseAnnotationTool=>baseAnnotationTool.toolName),
            [{mode:'passive'}],
          )
        },

        /**
         * @功能 - 从头创建一个新的viewport，可以是Stack，也可以是Volume
         * @param {String} id - 建立的viewport的父元素的ID号
         * @param {String} renderingEngineId - 渲染引擎的ID
         * @param {Objec} viewportInput - 视图的参数
         * @param {String} toolGroupId - 绑定的工具组的名称
         * @param {array} imageIds - 存储imageId的数组
         * @param {String} segmentationId - 分割的ID
         * @param {String || null} volumeId - volumeId，如果选择的是Stack类型的视图，就没有这个参数
         * @param {String} width - 每个Element的宽度，默认是100%
         */
        async createViewport(
          id,
          renderingEngineId,
          viewportInput,
          toolGroupId,
          imageIds,
          segmentationId,
          volumeId=null,
        )
        {
          const renderZoneItem = document.getElementById(id)
          const element = document.createElement('div');
          const renderingEngine = getRenderingEngine(renderingEngineId);
          const viewportId = viewportInput.viewportId;
          // 先删除之前对应的Viewport
          if(renderingEngine.getViewports()?.length>0)
          {
            renderingEngine.getViewports().forEach(viewport=>{
              if(viewport.id === viewportId)
              {
                renderingEngine.disableElement(viewport.id)
              }
               // 对应的Element也要一并删除
               if(renderZoneItem.contains(viewport.element))
                  renderZoneItem.removeChild(viewport.element)
            })
          }
          // Disable right click context menu so we can have right click tools
          element.oncontextmenu = (e) => e.preventDefault();
          element.id = id+"_child";
          element.style.width='100%';
          element.style.height='100%'
          // 为每个element添加取消绘制事件
          element.addEventListener(csToolsEnums.Events.KEY_DOWN,this.cancelDrawingEventListener)
          // 为每个element添加相机改变的事件
          element.addEventListener(Enums.Events.CAMERA_MODIFIED,this.handleCameraModified)
          element.addEventListener(Enums.Events.VOI_MODIFIED,this.handleVOIModified)
          renderZoneItem.appendChild(element)

          viewportInput.element = element;
          this.elements[viewportId] = element
          
          let toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
          if(!toolGroup)
            toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          renderingEngine.enableElement(viewportInput)

          // Set the tool group on the viewport
          toolGroup.addViewport(viewportId, renderingEngineId);
          
          if (viewportInput.type === ViewportType.STACK) {
            const viewport = renderingEngine.getViewport(viewportId)
            // Set the stack on the viewport
            await viewport.setStack(imageIds,0);
          } else if (viewportInput.type === ViewportType.ORTHOGRAPHIC) {
            console.log("viewports",renderingEngine.getVolumeViewports())
            const viewport = renderingEngine.getVolumeViewports().find(viewport=>viewport.id===viewportId)
            await this.initializeVolumeViewport(
              viewport,
              volumeId,
              segmentationId,
              imageIds
            );
            this.showColorbarsMenus[viewportId] = false;

            // 创建一个控制颜色条的按钮
            this.colorbarControlBoxs[viewportId] = h('div',{class:'colorbarControlBox'},
            [h(ElButton,{onClick:(event)=>this.handleColorbarControlBox(event,viewportId,renderZoneItem),circle:true,type:'success'},
            [h('img',{src:'svg/颜色条.svg',style:{width:'20px',height:'20px'}}),[]])])            

            // 颜色条的容器,它应该作为renderZoneItem的子元素
            const colorbarContainer = document.createElement('div')
            colorbarContainer.classList.add('colorbarContainer')
            colorbarContainer.style.display = 'none'
            renderZoneItem.appendChild(colorbarContainer)
            this.colorbarContainers[viewportId] = colorbarContainer
            
            this.ctColorbars[viewportId] = new ViewportColorbar({
              orientation:'vertical',
              id: 'ctColorbar',
              element:element,
              container: colorbarContainer,
              colormaps:colormaps,
              activeColormapName: currentPTColormapName,
              volumeId:volumeId,
              ticks: {
                position: ColorbarRangeTextPosition.Left,
                style: {
                  font: '12px Arial',
                  color: '#fff',
                  maxNumTicks: 8,
                  tickSize: 5,
                  tickWidth: 1,
                  labelMargin: 3,
                },
              },
            });

            this.renderTextSlider(viewportId,element);
            this.renderColorbarMenu(viewportId,renderZoneItem);

            // 添加文字信息
            
            this.viewportReRender(renderingEngineId)
          } else if(viewportInput.type === ViewportType.VOLUME_3D){
            const viewport = renderingEngine.getVolumeViewports().find(viewport=>viewport.id === viewportId)
            await this.initialze3DViewport(viewport,volumeId,imageIds)
            const select3D = h(SelectToolFor3d,{onHandleChange3dPreset:this.handleChange3dPreset},{default:()=>[]})
            render(select3D,renderZoneItem)
          }else{
            throw new Error('Invalid viewport type');
          }
         
        },

        async run(){
            // 更新文件前清除之前的缓存
            // cache.purgeCache();
            // cache.purgeVolumeCache();

            const toolGroup = this.addTools();
            if(toolGroup.hasTool(CrosshairsTool.toolName))
            {
              toolGroup.setToolDisabled(CrosshairsTool.toolName)
              // toolGroup.setToolPassive(CrosshairsTool.toolName)
            }
            // 配置窗口窗位的初始值
            this.viewportIds.forEach(viewportId=>{
              this.windowLevels[viewportId] = {WW:1600,WL:500}
            })
            // 箭头工具的配置
            this.arrowAnnotationConfig = {
              allowEmptyLabel: false,
              getTextCallback: (doneChangingTextCallback) => {
                // 使用 Element Plus 的 MessageBox 弹窗替代原生 prompt
                ElMessageBox.prompt('输入文本名称', '标注文本', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  inputPlaceholder: '请输入文本',
                  inputPattern: /.+/, // 确保输入不为空
                  inputErrorMessage: '文本不能为空'
                })
                .then(({ value }) => {
                  doneChangingTextCallback(value); // 将用户输入的文本传递给回调函数
                  ElMessage({
                    type: 'success',
                    message: `成功写入:${value}`,
                  })
                })
                .catch(() => {
                  ElMessage({
                    type: 'info',
                    message: '输入被取消！',
                  })
                });
              },
              changeTextCallback: (data, eventData, doneChangingTextCallback) => {
                console.log(data)
                // 检测双击事件
                if (eventData.event.type === 'dblclick') {
                  ElMessageBox.prompt('请输入新的文本', '修改标注文本', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPlaceholder: '请输入文本',
                    inputPattern: /.+/, // 确保输入不为空
                    inputErrorMessage: '文本不能为空',
                    inputValue: data.data.text // 默认值为当前文本
                  })
                  .then(({ value }) => {
                    doneChangingTextCallback(value); // 将用户输入的新文本传递给回调函数
                    ElMessage({
                      type: 'success',
                      message: `成功更改:${value}`,
                    })
                  })
                  .catch(() => {
                    ElMessage({
                      type: 'info',
                      message: '输入被取消！',
                    })
                  });
                }
              },
              arrowHeadStyle:'standard',
            }
            let viewportInput
            if(this.original_orientation==="AXIAL")
              viewportInput = this.viewportInputsObjects['轴向']
            else if(this.original_orientation==="SAGGITAL")
              viewportInput = this.viewportInputsObjects['矢向']
            else if(this.original_orientation==="CORONAL")
              viewportInput = this.viewportInputsObjects['冠向']
            const id = this.prefixId+":"+"renderZoneItem1"
            await this.createViewport(id,this.renderingEngineId,viewportInput,this.toolGroupId,this.fileImageIds,this.segmentationId,this.volumeId)
            this.addToolsToSpecificToolgroup(
                this.toolGroupId,
                baseManipulationTools.map(baseManipulationTool=>baseManipulationTool.toolName),
                [],[]
            );
            this.addToolsToSpecificToolgroup(
                this.toolGroupId,
                baseAnnotationTools.map(baseAnnotationTool=>baseAnnotationTool.toolName),
                [null,null,this.arrowAnnotationConfig],[]
            );
            this.addToolsToSpecificToolgroup(
                this.toolGroupId,
                contourTools.map(contourTool=>contourTool.toolName),
                [],[]
            );

            // 左键平移，中间滚动，ctrl+左键放大
            this.activeToolsToSpecificToolGroup(this.toolGroupId,
                baseManipulationTools.map(baseManipulationTool=>baseManipulationTool.toolName),
                [ null,
                  {
                    mode: 'active',bindings:[{
                      mouseButton:csToolsEnums.MouseBindings.Primary,
                      modifierKey:csToolsEnums.KeyboardBindings.Alt,
                  }]},
                  {
                    mode:'active',bindings:[{mouseButton:csToolsEnums.MouseBindings.Wheel}]
                  },
                  {
                    mode:'active',bindings:[{
                      mouseButton:csToolsEnums.MouseBindings.Primary,
                      modifierKey:csToolsEnums.KeyboardBindings.Ctrl,
                    }]
                  }
                ]
            );
            
            // 对所有的baseAnnotaionTool加上一个passive
            this.activeToolsToSpecificToolGroup(this.toolGroupId,
            baseAnnotationTools.map(baseAnnotationTool=>baseAnnotationTool.toolName),
            [{mode:'passive'}],
            )
            // 对所有的baseAnnotaionTool加上一个passive
            this.activeToolsToSpecificToolGroup(this.toolGroupId,
            contourTools.map(contourTool=>contourTool.toolName),
            [{mode:'passive'}],
            )
            
            // 渲染annotations
            await this.renderAnnotationsForDicom()

            // 取消loading框
            this.renderZoneLoading=false
            // 允许创建新的分割
            this.isCreateNewSegmentation=true
            
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        }
    }
};
</script>

<style scoped>
.icon{
  width: 20px;
  height: 20px;
}


.uploadZone,
.saveToServerZone,
.downloadFromServerZone {
    width: 150px;
    height: 50px;   
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    cursor: pointer;
    margin: 20px;
}

.zones {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.uploadZone, .saveToServerZone, .downloadFromServerZone {
  padding: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
  text-align: center; /* 居中文本 */
}

.el-container{
  width: 100%;
}

.header {
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgb(144, 147, 153);
}

.left_aside {
  
  width:10%;
  background-color: #ffffff; /* 侧边栏背景色 */
  border-right: 1px solid #eaeaea; /* 添加右侧边框 */
}

.right_aside{
  width:10%;
  background-color: #ffffff; /* 侧边栏背景色 */
  border-left: 1px solid #eaeaea; /* 添加左侧边框 */
  position: absolute;
  right: 0%;
  display: flex;
  flex-direction: column;
  padding:20px;
  gap:10px;

}

.main {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 800px;
}

/* 主内容区域 */
.el-main {
  position: absolute;
  left: 10%;
  width: 80%;
  background-color: #f9f9f9; /* 浅灰色背景，更显简洁 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影，增强立体感 */
  border-radius: 8px; /* 添加圆角，更显柔和 */
}

.content {
  background-color: #ffffff; /* 内容区域背景色 */
  border-radius: 8px; /* 添加圆角 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  width: 100%;
  height:100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploadZone:hover {
    border-color: #999;
}

.renderZone {
  width: 98%;
    height: 95%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap:5px;
}

.renderZoneItems{
  position:relative;
  border:2px solid blue;
  padding:10px;
  background-color:black;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.create_new_segmentation{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:5px;
}

.segmentationDel{
  text-align: center;
}

/* 定义淡入淡出动画 */
.left_aside_fade-enter-active, .left_aside_fade-leave-active {
  transition: opacity 0.5s ease; /* 定义过渡效果 */
}

.left_aside_fade-enter-from, .left_aside_fade-leave-to {
  opacity: 0; /* 定义初始和结束状态的透明度 */
}

/* 定义淡入淡出动画 */
.right_aside_fade-enter-active, .right_aside_fade-leave-active {
  transition: opacity 0.5s ease; /* 定义过渡效果 */
}

.right_aside_fade-enter-from, .right_aside_fade-leave-to {
  opacity: 0; /* 定义初始和结束状态的透明度 */
}


:global(.colorbarControlBox){
  flex:0 0 100%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
:global(.colorbarControlZone){
  display: flex;
  position: absolute;
  flex-direction: column;
  flex-wrap: wrap; /* 允许换行 */
  left:5%;
  top:5%;
}
:global(.colorbarContainer){
  position:absolute;
  height :50%;
  width:10px;
  right:10%;
  top:25%;
}
:global(.ColorbarControlMenu){
  background-color: white;
  padding:10px;
  border-radius: 15px;
}
</style>