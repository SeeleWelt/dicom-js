 <template>
  <div id="demo-wrap">
    <h3>加载本地文件</h3>
    <div class="form">
      <label for="">点击上传文件：</label>
      <input
        type="file"
        webkitdirectory
        multiple
        @change="handleChange"
      >
      <button
        @click="saveFilesToServer"
      >保存至服务端</button>
      {{ this.uploadProgress }}%
      <button
        @click="downloadFromServer"
      >从服务器导入</button>
      <folder-modal v-if="showfolderModal" :isVisible='true' :folders="folderModalFolders" 
      @close = "showfolderModal=false"
      @downloadFilesFromServer = "downloadFilesFromServer"
      @downloadFilesFromServerDCM = 'downloadFilesFromServerDCM'
      @downloadFilesFromServerDelete = 'downloadFilesFromServerDelete'
      ></folder-modal>
      <button @click = 'show3D=true'>显示3d</button>
      <test3-dim v-if = 'show3D' @close = 'show3D=false' :image-ids="fileImageIds"></test3-dim>
    </div>
    <div class="toolbar">
      <h4>工具栏</h4>
      <div class="tools">
        <button
          v-for="(toolObj, index) in baseTools"
          :key="index"
          @click="changeActiveTool(toolObj.tool.toolName)"
          class="tool-button"
        >
          {{ toolObj.zh }}
        </button>
        <dropdown-tool-bar :title="'十字准线工具强度投影选择'" :default-value="intensityProjectionValues[0]" :value="intensityProjectionValues"
        :onSelectedValueChange="handleIntensityProjection"></dropdown-tool-bar>
        <button
          @click="handleRest"
          class="tool-button"
        >
          重置视图
        </button>
      </div>
      <div class="tools">
        <button
          v-for="(toolObj, index) in annotationTools"
          :key="index"
          @click="changeActiveTool(toolObj.tool.toolName)"
          class="tool-button"
        >
          {{ toolObj.zh }}
        </button>
        <button
          @click="handleAnnotationRemove"
          class="tool-button"
        >
          删除所有注释
        </button>
        <slider-tool-bar :title="'宽度'" :default-value="2" :range="[1,10]" 
        :onSelectedValueChange="handleAnnotationToolsWidth"></slider-tool-bar>
        <!-- 添加三个色轮 -->
        <colorwheel-tool-bar :title = "'未选中时的颜色'" :default-value="'#FFFF00'"
        :onSelectedValueChange = 'handleAnnotationColors' :type-flag="0"></colorwheel-tool-bar>
        <colorwheel-tool-bar :title = "'高亮时的颜色'" :default-value="'#00FF00'"
        :onSelectedValueChange = 'handleAnnotationColors' :type-flag="1"></colorwheel-tool-bar>
        <colorwheel-tool-bar :title = "'选中时的颜色'" :default-value="'#00DC00'"
        :onSelectedValueChange = 'handleAnnotationColors' :type-flag="2"></colorwheel-tool-bar>
      </div>
      <div class="tools">
        <div>
          <dropdown-tool-bar :title="'分割段：'" :default-value="1" :value="[1,2,3,4,5]"
          :onSelectedValueChange="handleSegmentationIndex" :type-flag="0"></dropdown-tool-bar>
          <dropdown-tool-bar :title="''" :default-value="SegmentationLabelmapToolsName[0]" :value="SegmentationLabelmapToolsName"
          :onSelectedValueChange="changeActiveTool" :type-flag="0"></dropdown-tool-bar>
          <button
            @click="handleSegmentationDelete()"
            class="tool-button"
          >
          删除分割
          </button>
          <slider-tool-bar :title="'刷子大小'" :default-value="25" :range="[5,50]"
          :onSelectedValueChange="handleBrushSize"></slider-tool-bar>
          <slider-tool-bar :title="'背景色透明度'" :default-value="0.05" :range="[0,1]" :step="0.05"
          :onSelectedValueChange="handleSegmentationFillAlpha"></slider-tool-bar>
          <colorwheel-tool-bar :title="'颜色'" :onSelectedValueChange="handleSegmentationColor"></colorwheel-tool-bar>
        </div>
        <div>
          <dropdown-tool-bar :title="'插值工具：'" :default-value="SegmentationContoursToolsName[0]" :value="SegmentationContoursToolsName"
          :onSelectedValueChange="changeActiveTool" :type-flag="0"></dropdown-tool-bar>
          <slider-tool-bar :title="'轮廓线宽度'" :default-value="1" :range="[1,10]" :step="1"
          :onSelectedValueChange="handleSegmentationContourOutlineWidth"></slider-tool-bar>
          <slider-tool-bar :title="'轮廓短线长度'" :default-value="1" :range="[1,10]" :step="1"
          :onSelectedValueChange="handleSegmentationContourLineDash"></slider-tool-bar>
          <slider-tool-bar :title="'背景色透明度'" :default-value="0.05" :range="[0,1]" :step="0.05"
          :onSelectedValueChange="handleSegmentationContourFillAlpha"></slider-tool-bar>
          
        </div>
      </div>
    </div>
    <div>
      <h2>请选择同步方式</h2>
      <div>
        <input 
          type="checkbox" 
          v-model="isSynchronous" 
          @change='handleSynchronizeChange'
          class = 'checkmark'
          />
          <span style="font-size: 20px;">{{ isSynchronous ? '同步' : '不同步' }}</span>
      </div>
    </div>
    <h3>渲染Volume图像</h3>
    <div style="font-size: 20px;">
      常用部位:<voi-dropdown :options = 'this.voiDropdown' @selectVoi = 'handleVoiDropdowm'></voi-dropdown>
      颜色:<colorbar-dropdown :options ='this.ColorbarNames' @select = 'handleColorbarDropdown'></colorbar-dropdown>
    </div>
    <div class="viewports">
      <div
        id="element2"
        class="cornerstone-item"
      ></div>
      <div
        id="element3" 
        class="cornerstone-item"
      ></div>
      <div
        id="element4" 
        class="cornerstone-item"
      ></div>
      <div class = 'colorbarContainer'></div>
    </div>
    <resizable-text v-if = 'showTextForElement1' :element="element1" :texts="[`WW:${this.windowLevelData.windowWidth}`,
      `WL:${this.windowLevelData.windowCenter}`,`SliceIndex:${this.viewport1SliceIndex}`]" :position="'top'"></resizable-text>
  </div>
</template>

<style  scoped>
.colorbarContainer{
  display: inline-block;
  width: 50px;
  height: 512px; 
}
.cornerstone-item {
  position: relative;
  display: inline-block;
  width: 512px;
  height: 512px; 
  margin-top: 20px;
  border: 2px solid #96CDF2;
  border-radius: 10px;
}
.tool-button{
  background-color: #4CAF50; /*绿色背景 */
 border: none; /* 无边框 */
 color: white; /* 白色文字 */
 padding:15px32px; /* 内边距 */
 text-align: center; /*文字居中 */
 text-decoration: none; /* 无下划线 */
 display: inline-block; /* 行内块元素 */
 font-size:16px; /* 字体大小 */
 margin:4px 5px; /* 外边距 */
 cursor: pointer; /* 鼠标指针 */
 border-radius:8px; /* 圆角 */
 transition: background-color0.3s; /* 背景色过渡效果 */
}
.tool-button:hover {
 background-color: #45a049; /* 悬停时的背景色 */
}
input.checkmark {
  width: 20px;
  height: 20px;
  background-color: #eee;
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: transform 0.2s; /* 添加平滑过渡效果 */
}
.checkmark:hover {
  cursor: pointer;
  transform: scale(1.1); /* hover 时放大 */
}
</style>

<script lang = 'js'>
// colorBar
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
// 压缩文件zip
import JSZip from 'jszip';
//==============================组件==================================
import FolderModal from './FolderModal.vue';
import ColorbarDropdown from './ColorbarDropdown.vue';
import VoiDropdown from './VoiDropdown.vue';
import Test3Dim from './Test3Dim.vue';
import SliderToolBar from './SliderToolBar.vue';
import DropdownToolBar from './DropdownToolBar.vue';
import ColorwheelToolBar from './ColorwheelToolBar.vue';
// import ButtonToolBar from './ButtonToolBar.vue';
import ResizableText from './ResizableText.vue';
//===========================cornerstone3d============================
import initCornerstone from '@/cornerstone/helper/initCornerstone';
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"
import {
  cache,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  metaData,
  getRenderingEngine,
  utilities,
  imageLoader,
} from '@cornerstonejs/core';
// Tools
import {
  cancelActiveManipulations,// 取消绘制操作
  segmentation, // 管理分割类工具
  annotation, // 管理注释类工具
  Enums as csToolsEnums,
  addTool,
  ToolGroupManager,
  utilities as csToolUtilities,
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
  // 同步器
  synchronizers,
  SynchronizerManager,

} from '@cornerstonejs/tools';
import axios from 'axios';
// import * as dicomParser from 'dicom-parser'
import * as dcmjs from 'dcmjs'


const {ViewportType} = Enums; //相当于 cosnt ViewportType = Enums.ViewportType
// colorBar
const { ViewportColorbar } = csToolUtilities.voi.colorbar;
const { ColorbarRangeTextPosition } = csToolUtilities.voi.colorbar.Enums;
// 创建的colorbar
let ctColorbar = null;
// colormaps，用于映射colorbar的名称和对应的颜色
const colormaps = vtkColorMaps.rgbPresetNames.map((presetName) =>
vtkColorMaps.getPresetByName(presetName)
);
// 当前的colormap名称
const currentPTColormapName = 'Grayscale';
// 工具组的ID，它代表了一个唯一工具组
const toolGroupId = "seeleTool"
const toolGroupForStackId = 'seeleTool2'
let toolGroupIs = []
// 定义volumeId,作为类似于ImageLoader的一个Scheme
const volumeId = "myVolumeId"
// 定义引擎的ID
const renderingEngineId = 'myRenderingEngine'
// 定义viewportId
const viewportId1 = "CT_AXIAL"; // 创建轴向视图
const viewportId2 = "CT_SAGITTAL"; // 创建矢状视图
const viewportId3 = "CT_CORONAL"; // 创建冠状视图
const viewportIds = [viewportId1,viewportId2,viewportId3]
const viewportReferenceLineControllable = [
  viewportId1,
  viewportId2,
  viewportId3,
];
const viewportReferenceLineDraggableRotatable = [
  viewportId1,
  viewportId2,
  viewportId3,
];
const viewportReferenceLineSlabThicknessControlsOn = [
  viewportId1,
  viewportId2,
  viewportId3,
];
// CrossHaris工具的线条颜色
const viewportColors={
  [viewportId1]: 'rgb(200, 0, 0)',
  [viewportId2]: 'rgb(200, 200, 0)',
  [viewportId3]: 'rgb(0, 200, 0)',
}
// 同步器ID
const cameraPositionSynchronizerId = "cameraPositionSynchronizerId"
const VOISynchronizerId = "VOISynchronizerId"
const zoomPanSynchronizerId = "zoomPanSynchronizerId"
const imageSliceSynchronizerId = "imageSliceSynchronizerId"
const slabThicknessSynchronizerId = 'SLAB_THICKNESS_SYNCHRONIZER_ID';
// 同步器
let VOISynchronizer;
let zoomPanSynchronizer;
let slabThicknessSynchronizer;
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
// 分割Labmap的ID
const segmentationId = 'segmentationId'
// 分割contour的ID
// const segmentationContourId = 'segmentationContourId'
// 基础工具的类
// const baseManipulationTools=[  
//   WindowLevelTool,
//   ZoomTool,
//   StackScrollTool,
//   PanTool,
//   DragProbeTool,
//   PlanarRotateTool,
// ];
// // 注释工具的类
// const baseAnnotationTools=[
//   LengthTool,
//   BidirectionalTool,
//   ArrowAnnotateTool,
//   RectangleROITool,
//   EllipticalROITool,
//   CircleROITool,
// ];
// 分割Labelmap工具的类
const baseSegmentationLabelmapTools=[
  BrushTool,
  RectangleScissorsTool,
  SphereScissorsTool,
  CircleScissorsTool,
  PaintFillTool,
];
// 分割Contour工具的类
const baseSegmentationContourTools=[
  PlanarFreehandContourSegmentationTool,
  PlanarFreehandROITool,
  SplineContourSegmentationTool,
  SplineROITool,
  LivewireContourSegmentationTool,
  LivewireContourTool,
];
const interpolation = {
  enabled: true,
  showInterpolationPolyline: true,
};
const interpolationInstanceObjectsConfiguration = {
  interpolation,
  // actions,
};
const brushInstanceObjects = [
  {toolName:'CircularBrush',parentClassName:BrushTool.toolName,
  configuration:{activeStrategy: 'FILL_INSIDE_CIRCLE',}},
  {toolName:'CircularEraser',parentClassName:BrushTool.toolName,
  configuration:{activeStrategy: 'ERASE_INSIDE_CIRCLE',}},
  {toolName:'SphereBrush',parentClassName:BrushTool.toolName,
  configuration:{activeStrategy: 'FILL_INSIDE_SPHERE',}},
  {toolName:'SphereEraser',parentClassName:BrushTool.toolName,
  configuration:{activeStrategy: 'ERASE_INSIDE_SPHERE',}},
  {toolName:'ThresholdCircle',parentClassName:BrushTool.toolName,
  configuration:{activeStrategy: 'THRESHOLD_INSIDE_CIRCLE',}},
  {toolName:'ScissorsEraser',parentClassName:SphereScissorsTool.toolName,
  configuration:{activeStrategy: 'ERASE_INSIDE',}},
]
// interpolationInstanceObjects，适用于addToolInstance函数
const interpolationInstanceObjects =[
  {toolName:'SplineInterpolation',parentClassName:SplineContourSegmentationTool.toolName,configuration:interpolationInstanceObjectsConfiguration},
  {toolName:'FreeformInterpolation',parentClassName:PlanarFreehandContourSegmentationTool.toolName,configuration:interpolationInstanceObjectsConfiguration},
  {toolName:'LivewireInterpolation',parentClassName:LivewireContourSegmentationTool.toolName,configuration:interpolationInstanceObjectsConfiguration},
  {toolName:'LivewireInterpolationNearest3',parentClassName:LivewireContourSegmentationTool.toolName,
  configuration:{interpolation: { ...interpolation, nearestEdge: 3 },}},
  {toolName:'LivewireInterpolationNearest3RepeatInterpolation',parentClassName:LivewireContourSegmentationTool.toolName,configuration:{...interpolationInstanceObjectsConfiguration,
    interpolation: { enabled: true, nearestEdge: 3, repeatInterpolation: true },}},
]

// 是否显示颜色条
let showColorbar = true
axios.defaults.withCredentials = true  //允许跨域携带cookie信息，必须加上

export default {
    name: 'DicomVolume',
    components:{
      FolderModal,
      ColorbarDropdown,
      VoiDropdown,
      Test3Dim,
      SliderToolBar,
      DropdownToolBar,
      ColorwheelToolBar,
      ResizableText,
      // ButtonToolBar,
    },
    data(){
      return{
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
          markerSize: '10',
        },
        // 定义工具栏
        baseTools:[
          {
            tool: PanTool,
            zh: '平移工具',
          }, {
            tool: DragProbeTool,
            zh: '探针工具',
          }, {
            tool: WindowLevelTool,
            zh: '窗宽窗距调整工具',
          }, {
            tool: ZoomTool,
            zh: '缩放',
          }, {
            tool: StackScrollTool,
            zh: '鼠标点击及拖动切换层级',
          }, {
            tool: PlanarRotateTool,
            zh: '2D旋转工具',
          }, {
            tool:CrosshairsTool,
            zh: '十字准线工具'
          },{
            tool:AdvancedMagnifyTool,
            zh : '放大镜工具',
          },
        ],
        // 操作类
        annotationTools:[
          {
            tool: LengthTool,
            zh: '长度测量工具',
          }, {
            tool: BidirectionalTool,
            zh: '双向测量工具',
          }, 
          {
            tool:ArrowAnnotateTool,
            zh:'箭头标注工具',
          },
          {
            tool:RectangleROITool,
            zh:'矩形工具',
          },
          {
            tool:EllipticalROITool,
            zh:'椭圆工具',
          },
          {
            tool:CircleROITool,
            zh:'圆形工具',
          },
        ],
        // 分割类
        segmentTools:[
          {
            tool: BrushTool,
            zh: '分割工具',
          }, 
        ],
        SegmentationLabelmapToolsName : [
          ...(brushInstanceObjects.map(brushInstanceObject=>brushInstanceObject.toolName)),
          ...(baseSegmentationLabelmapTools.map(baseSegmentationLabelmapTool=>baseSegmentationLabelmapTool.toolName))
        ],
        // ViewportInfo Array
        viewportInput:null,
        // 元数据
        windowLevelData:this.getWindowData(this.getVoiRange(1600,500)),
        // SliceIndex
        viewport1SliceIndex:0,
        // 文件集
        fileSet:null,
        // 存放文件ImageIds
        fileImageIds:null,
        // 文件进度
        uploadProgress:0,
        // CSRF箭牌
        csrfToken:null,
        // 服务器的文件夹
        folderModalFolders:null,
        // 是否显示FolderModal
        showfolderModal:false,
        // 是否显示3d图像
        show3D:false,
        // 是否同步
        isSynchronous:false,
        // colorbar的所有names
        ColorbarNames:vtkColorMaps.rgbPresetNames,
        // voi的一些常用部位
        voiDropdown:Object.keys(voiData),
        // 分割段索引号
        segmentationIndex:1,
        // 插值（Interpolate contours）工具
        interpolationTools:{},
        SegmentationContoursToolsName:[],
        // CrossHairsTool光强度选择
        intensityProjectionValues:[
          '最大强度投影',
          '最小强度投影',
          '平均强度投影',
        ],
        // 测试在element上面显示文字
        element1:null,
        showTextForElement1:false,
      }
    },
    mounted() {
        this.init();
        // 监听全局键盘事件
        document.addEventListener('keydown',this.selectedAnnotationDelect)
        // document.addEventListener('keydown', this.handleUndo);
        // document.addEventListener('keydown', this.handleRedo);
    },
    methods: {
        async init(){
            // 初始化所有的cornerstone依赖
            await initCornerstone();
            // 准备一个rendringEngine，之后获取他就行
            new RenderingEngine(renderingEngineId)
        },
        addTextToElement(element, texts, position='top') {
          // 检查输入参数
          if (!element || !Array.isArray(texts) || typeof position !== 'string') {
            console.error('Invalid arguments');
            return;
          }
          // 定义文本的样式
          const textContainer = document.createElement('div');
          textContainer.style.position = 'absolute';
          textContainer.style.whiteSpace = 'pre'; // 保留换行
          textContainer.style.textAlign = 'center'; // 文本居中对齐
          // 根据传入的数组生成多行文本
          texts.forEach((text) => {
            const textLine = document.createElement('div');
            textLine.textContent = text;
            textContainer.appendChild(textLine);
          });
          // 根据指定的位置设置样式
          switch (position.toLowerCase()) {
            case 'top':
              textContainer.style.top = '0';
              textContainer.style.left = '50%';
              textContainer.style.transform = 'translateX(-50%)';
              break;
            case 'bottom':
              textContainer.style.bottom = '0';
              textContainer.style.left = '50%';
              textContainer.style.transform = 'translateX(-50%)';
              break;
            case 'left':
              textContainer.style.left = '0';
              textContainer.style.top = '50%';
              textContainer.style.transform = 'translateY(-50%)';
              textContainer.style.textAlign = 'right'; // 靠右对齐
              break;
            case 'right':
              textContainer.style.right = '0';
              textContainer.style.top = '50%';
              textContainer.style.transform = 'translateY(-50%)';
              textContainer.style.textAlign = 'left'; // 靠左对齐
              break;
            case 'top-left':
              textContainer.style.top = '0';
              textContainer.style.left = '0';
              break;
            case 'top-right':
              textContainer.style.top = '0';
              textContainer.style.right = '0';
              break;
            case 'bottom-left':
              textContainer.style.bottom = '0';
              textContainer.style.left = '0';
              break;
            case 'bottom-right':
              textContainer.style.bottom = '0';
              textContainer.style.right = '0';
              break;
            default:
              console.warn('Invalid position. Defaulting to "top".');
              textContainer.style.top = '0';
              textContainer.style.left = '50%';
              textContainer.style.transform = 'translateX(-50%)';
          }
          // 将文本容器添加到目标元素中
          element.appendChild(textContainer);
        },
        activeToolsToSpecificToolGroup(toolGroupId,toolNames,modes)
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(toolNames?.length > 0)
          {
            toolNames.forEach((toolName,index)=>{
              // 添加工具名称以及对应的配置
              if(modes[index].mode === 'active')
                toolGroup.setToolActive(toolName,{bindings:modes[index].bindings})
              else if(modes[index].mode === 'passive')
                toolGroup.setToolPassive(toolName)
              else if(modes[index].mode === 'enabled')
                toolGroup.setToolEnabled(toolName)
              else if(modes[index].mode === 'disabled')
                toolGroup.setToolDisabled(toolName)
            })
          }
        },
        addToolsToSpecificToolgroup(toolGroupId,toolNames,configurationWithToolName=[],toolInstanceObjects=[])
        {
          if(!toolGroupIs.includes(toolGroupId))
            toolGroupIs.push(toolGroupId)
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(toolNames?.length > 0)
          {
            toolNames.forEach((toolName,index)=>{
              // 添加工具名称以及对应的配置
              if(configurationWithToolName[index])
                toolGroup.addTool(toolName,configurationWithToolName.toolName)
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
          imageIds,
        ) {
          let volume = cache.getVolume(volumeId);
          if (!volume) {
            volume = await volumeLoader.createAndCacheVolume(volumeId, {
              imageIds,
            });

            // Set the volume to load
            volume.load();
          }

          // Set the volume on the viewport
          await viewport.setVolumes([
            { volumeId},
          ]);

          return volume;
        },
        async createViewport(
          renderingEngineId,
          viewportInput,
          toolGroupId,
          imageIds,
          volumeId=null
        )
        {
          const viewports = document.querySelector('.viewports')
          const element = document.createElement('div');
          // Disable right click context menu so we can have right click tools
          element.oncontextmenu = (e) => e.preventDefault();
          element.id = viewportInput.viewportId;
          element.style.overflow = 'hidden';
          element.style.width = '512px';
          element.style.height = '512px';
          element.addEventListener(csToolsEnums.Events.KEY_DOWN,this.cancelDrawingEventListener)
          viewportInput.element = element;
          viewports.appendChild(element)

          const renderingEngine = getRenderingEngine(renderingEngineId);
          const viewportId = viewportInput.viewportId;
          let toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
          if(!toolGroup)
            toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          renderingEngine.enableElement(viewportInput)
          console.log("viewportId",viewportId)
          // Set the tool group on the viewport
          toolGroup.addViewport(viewportId, renderingEngineId);
          const viewport = renderingEngine.getViewport(viewportId)
          if (viewportInput.type === ViewportType.STACK) {
            // Set the stack on the viewport
            await viewport.setStack(imageIds,123);
          } else if (viewportInput.type === ViewportType.ORTHOGRAPHIC) {
            await this.initializeVolumeViewport(
              viewport,
              volumeId,
              imageIds
            );
            // Add the segmentation representations to toolgroup1
            await segmentation.addSegmentationRepresentations(viewport.id, [
              {
                segmentationId,
                type: csToolsEnums.SegmentationRepresentations.Labelmap,
              },
            ]);
          } else {
            throw new Error('Invalid viewport type');
          }
        },
        handleIntensityProjection(value)
        {
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
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
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
          const renderingEngine = getRenderingEngine(renderingEngineId)
          renderingEngine.getVolumeViewports().forEach((viewport)=>{
            viewport.setBlendMode(blendModeToUse)
            viewport.render()
          })
        },
        handleRedo(event)
        {
          if(event.altKey && event.key === 'z')
          {
            console.log('redo')
            utilities.HistoryMemo.DefaultHistoryMemo.redo()
          }  
        },
        handleUndo(event){
          if(event.ctrlKey && event.key === 'z')
          {
            console.log('undo')
            utilities.HistoryMemo.DefaultHistoryMemo.undo()
          }  
        },
        async initSegmentationContour(viewportIds,segmentationId)
        {
            segmentation.addRepresentationData({
              segmentationId,
              type: csToolsEnums.SegmentationRepresentations.Contour,
              data: {},
            });
            await segmentation.addContourRepresentationToViewportMap({
              [viewportIds[0]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Contour,
                },
              ],
              [viewportIds[1]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Contour,
                },
              ],
              [viewportIds[2]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Contour,
                },
              ],
            });
        },
        async initSegmentationLabelmap(viewportIds,segmentationId)
        {
            // Add the segmentations to state. As seen the labelmap data
            // which is the cached volumeId is provided to the state
            if (segmentation.state.getSegmentationRepresentationsBySegmentationId(segmentationId).length === 0)
            {
              console.log("labelmap")
              segmentation.addSegmentations([
                {
                  segmentationId,
                  representation: {
                    // The type of segmentation
                    type: csToolsEnums.SegmentationRepresentations.Labelmap,
                    // The actual segmentation data, in the case of labelmap this is a
                    // reference to the source volume of the segmentation.
                    data: {
                      volumeId: segmentationId,
                    },
                  },
                },
              ]);
            }
            await segmentation.addLabelmapRepresentationToViewportMap({
              [viewportIds[0]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Labelmap,
                },
              ],
              [viewportIds[1]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Labelmap,
                },
              ],
              [viewportIds[2]]: [
                {
                  segmentationId,
                  type: csToolsEnums.SegmentationRepresentations.Labelmap,
                },
              ],
            });
        },
        addSegmentationContourFreehandTools(toolGroup)
        {
          // const actions = {
          //   acceptCurrent: {
          //     method: acceptCurrent,
          //     bindings: [
          //       {
          //         key: 'Enter',
          //       },
          //     ],
          //   },
          // };
          const interpolation = {
            enabled: true,
            showInterpolationPolyline: true,
          };
          const configuration = {
            interpolation,
            // actions,
          };
          const interpolationTools ={
            SplineInterpolation:{
              baseTool: SplineContourSegmentationTool.toolName,
              configuration,
            },
            FreeformInterpolation:{
              baseTool: PlanarFreehandContourSegmentationTool.toolName,
              configuration,
              passive: true,
            },
            LivewireInterpolation:{
              baseTool: LivewireContourSegmentationTool.toolName,
              configuration,
            },
            LivewireInterpolationNearest3:{
              baseTool: LivewireContourSegmentationTool.toolName,
              configuration: {
                ...interpolation,
                interpolation: { ...interpolation, nearestEdge: 3 },
              },
            },
            LivewireInterpolationNearest3RepeatInterpolation:{
              baseTool: LivewireContourSegmentationTool.toolName,
              configuration: {
                ...configuration,
                interpolation: { enabled: true, nearestEdge: 3, repeatInterpolation: true },
              },
            },
            [PlanarFreehandContourSegmentationTool.toolName]:{
              passive: true,
            }
          }
          this.interpolationTools = interpolationTools
          this.SegmentationContoursToolsName = [  
            ...Object.keys(interpolationTools),
            PlanarFreehandROITool.toolName,
            SplineContourSegmentationTool.toolName,
            SplineROITool.toolName,
            LivewireContourSegmentationTool.toolName,
            LivewireContourTool.toolName,
          ]
          for (const [toolName, config] of Object.entries(interpolationTools)) {
            if (config.baseTool) {
              toolGroup.addToolInstance(
                toolName,
                config.baseTool,
                config.configuration
              );
            } else {
              toolGroup.addTool(toolName, config.configuration);
            }
            if (config.passive) {
              // This can be applied during add/remove contours
              toolGroup.setToolPassive(toolName);
            }
          }
          toolGroup.addTool(PlanarFreehandROITool.toolName);
          toolGroup.addTool(SplineContourSegmentationTool.toolName);
          toolGroup.addTool(SplineROITool.toolName);
          toolGroup.addTool(LivewireContourSegmentationTool.toolName);
          toolGroup.addTool(LivewireContourTool.toolName);

        },
        handleSegmentationFillAlpha(value)
        {
          const val = Number(value)
          this.updateCurrentSegmentationConfig({ fillAlpha:val })
        },
        updateCurrentSegmentationConfig(config) {
          const style = segmentation.config.style.getStyle({
            segmentationId: segmentationId,
            type: csToolsEnums.SegmentationRepresentations.Labelmap,
          });
          const mergedConfig = { ...style, ...config };
          segmentation.config.style.setStyle(
            {
              segmentationId: segmentationId,
              type: csToolsEnums.SegmentationRepresentations.Labelmap,
            },
            mergedConfig
          );
        },
        handleSegmentationContourOutlineWidth(value)
        {
          const outlineWidth = value;
          this.updateCurrentSegmentationContourConfig({outlineWidth:outlineWidth})
        },
        handleSegmentationContourLineDash(value)
        {
          const outlineDash = `${value},${value}`;
          this.updateCurrentSegmentationContourConfig({outlineDash:outlineDash})
        },
        handleSegmentationContourFillAlpha(value)
        {
          const val = Number(value)
          this.updateCurrentSegmentationContourConfig({ fillAlpha:val })
        },
        updateCurrentSegmentationContourConfig(config) {
          const style = segmentation.config.style.getStyle({
            segmentationId: segmentationId,
            type: csToolsEnums.SegmentationRepresentations.Contour,
          });
          const mergedConfig = { ...style, ...config };
          segmentation.config.style.setStyle(
            {
              segmentationId: segmentationId,
              type: csToolsEnums.SegmentationRepresentations.Contour,
            },
            mergedConfig
          );
        },
        cancelDrawingEventListener(evt){
          const { element, key } = evt.detail;
          if (key === 'Escape') {
            const annotationUID = cancelActiveManipulations(element);
            if(annotationUID)
              annotation.state.removeAnnotation(annotationUID)
          }
        },
        handleSegmentationIndex(value)
        {
          const index = Number(value)
          this.segmentationIndex = index
          segmentation.segmentIndex.setActiveSegmentIndex(segmentationId,index)
        },
        handleSegmentationColor(value)
        {
          const val = String(value)
          const hex = val.replace("#", "");
          console.log(hex)
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          segmentation.config.color.setSegmentIndexColor(viewportId1,segmentationId,this.segmentationIndex,[r,g,b,255]);
        },
        handleBrushSize(value)
        {
          const val = Number(value)
          if(ToolGroupManager.getToolGroup(toolGroupId))
            csToolUtilities.segmentation.setBrushSizeForToolGroup(toolGroupId,val)
          else
            return
        },
        handleAnnotationColors(value,typeFlag)
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(!toolGroup)
            return
          if(typeFlag === 0)
          {
            this.annotationConfigStyleDefaultConfig.color = value
          }else if(typeFlag === 1)
          {
            this.annotationConfigStyleDefaultConfig.colorHighlighted = value
          }else if(typeFlag === 2)
          {
            this.annotationConfigStyleDefaultConfig.colorSelected = value
          }
          const styles ={
            global:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(toolGroupId,styles);
          this.reRenderViewport()
        },
        handleAnnotationToolsWidth(value)
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(!toolGroup)
            return
          this.annotationConfigStyleDefaultConfig.lineWidth = String(value)
          const styles ={
            global:this.annotationConfigStyleDefaultConfig,
          }
          annotation.config.style.setToolGroupToolStyles(toolGroupId,styles);
          this.reRenderViewport()
        },
        handleShow3d(){
          this.show3D = true
        },
        // 关于segmentation
        handleSegmentationDelete(){
          // 删除所有分割标志
          console.log(segmentation.state.getSegmentation(segmentationId))
          console.log(segmentation.state.getSegmentationRepresentationsBySegmentationId(segmentationId))
          console.log(segmentation.state.getSegmentationRepresentation(viewportId1,{segmentationId:segmentationId,
          type:csToolsEnums.SegmentationRepresentations.Labelmap}))
          segmentation.removeAllSegmentationRepresentations();
          console.log(segmentation.state.getSegmentation(segmentationId))
        },
        // 
        handleVoiDropdowm(voiName){
          const voiRange = this.getVoiRange(voiData[voiName].WW,voiData[voiName].WL)
          const viewport = getRenderingEngine(renderingEngineId).getVolumeViewports()[0]
          viewport.setProperties({
            voiRange:voiRange
          })
          this.reRenderViewport()
        },
        getVoiRange(WW,WL){
          return utilities.windowLevel.toLowHighRange(WW,WL)
        },
        // 解决colorbar选择的问题:重新渲染colorbar的图像，并且视图也变成对应的colormap
        handleColorbarDropdown(colormapName){
          // 重新渲染colorbar
          ctColorbar.activeColormapName = colormapName
          // 改变当前视图的colormap
          this.setViewportColormap(colormapName)
        },
        // Change the colormap of an specific viewport
        setViewportColormap(colormapName) {
          // Get the rendering engine
          const renderingEngine = getRenderingEngine(renderingEngineId);

          // Get the volume viewport
          const viewport = (
            renderingEngine.getVolumeViewports()[0] // 这里先用viewportId1测试一下
          );
          viewport.setProperties({ colormap: { name: colormapName } });
          viewport.render();
        },
        handleSynchronizeChange(){
          // 用于解决同步与不同步问题，用户点击checkbox之后会修改同步状态
          if(!VOISynchronizer || !zoomPanSynchronizer)
          {
            console.log("不存在同步器")
            return
          }
          console.log("this.isSynchronous",this.isSynchronous)
          VOISynchronizer.setEnabled(this.isSynchronous);
          zoomPanSynchronizer.setEnabled(this.isSynchronous)
        },
        addCameraPositionSycronizers(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          synchronizers.createCameraPositionSynchronizer(cameraPositionSynchronizerId)
          // 获取这个创建的同步器
          const cameraPositionSynchronizer = SynchronizerManager.getSynchronizer(cameraPositionSynchronizerId)
          // 为同步器添加源视图和目标视图
          cameraPositionSynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          cameraPositionSynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          cameraPositionSynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          // cameraPositionSynchronizer.
        },
        addVOISycronizers(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(VOISynchronizerId))
            synchronizers.createVOISynchronizer(VOISynchronizerId)
          // 获取这个创建的同步器
          VOISynchronizer = SynchronizerManager.getSynchronizer(VOISynchronizerId)
          // 为同步器添加源视图和目标视图
          VOISynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          VOISynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          VOISynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          VOISynchronizer.setEnabled(false)
        },
        removeVOISycronizers(){
          //================ 删除同步器 ==========================
          // 获取这个创建的同步器
          const VOISynchronizer = SynchronizerManager.getSynchronizer(VOISynchronizerId)
          // 为同步器添加源视图和目标视图
          if(VOISynchronizer)
          {
            VOISynchronizer.remove({ renderingEngineId, viewportId: viewportIds[0] });
            VOISynchronizer.remove({ renderingEngineId, viewportId: viewportIds[1] });
            VOISynchronizer.remove({ renderingEngineId, viewportId: viewportIds[2] });
            // cameraPositionSynchronizer.
          }
          
        },
        addZoomPanSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(zoomPanSynchronizerId))
            synchronizers.createZoomPanSynchronizer(zoomPanSynchronizerId)
          // 获取这个创建的同步器
          zoomPanSynchronizer = SynchronizerManager.getSynchronizer(zoomPanSynchronizerId)
          // 为同步器添加源视图和目标视图
          zoomPanSynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          zoomPanSynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          zoomPanSynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          // 默认情况下是不使用同步器的
          zoomPanSynchronizer.setEnabled(false);
          // cameraPositionSynchronizer.
        },
        removeZoomPanSynchronizer(){
          //================ 删除同步器 ==========================
          // 获取这个创建的同步器
          const zoomPanSynchronizer = SynchronizerManager.getSynchronizer(zoomPanSynchronizerId)
          if(zoomPanSynchronizer)
        {// 为同步器添加源视图和目标视图
          zoomPanSynchronizer.remove({ renderingEngineId, viewportId: viewportIds[0] });
          zoomPanSynchronizer.remove({ renderingEngineId, viewportId: viewportIds[1] });
          zoomPanSynchronizer.remove({ renderingEngineId, viewportId: viewportIds[2] });
        }
          // cameraPositionSynchronizer.
        },
        addImageSliceSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          synchronizers.createImageSliceSynchronizer(imageSliceSynchronizerId)
          // 获取这个创建的同步器
          const imageSliceSynchronizer = SynchronizerManager.getSynchronizer(imageSliceSynchronizerId)
          // 为同步器添加源视图和目标视图
          imageSliceSynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          imageSliceSynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          imageSliceSynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          // cameraPositionSynchronizer.
        },
        addSlabThicknessSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          if(!SynchronizerManager.getSynchronizer(slabThicknessSynchronizerId))
            synchronizers.createSlabThicknessSynchronizer(slabThicknessSynchronizerId)
          // 获取这个创建的同步器
          slabThicknessSynchronizer = SynchronizerManager.getSynchronizer(slabThicknessSynchronizerId)
          // 为同步器添加源视图和目标视图
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          slabThicknessSynchronizer.setEnabled(false)

        },
        getReferenceLineColor(viewportId) {
          return viewportColors[viewportId];
        },
        getReferenceLineControllable(viewportId) {
          const index = viewportReferenceLineControllable.indexOf(viewportId);
          return index !== -1;
        },
        getReferenceLineDraggableRotatable(viewportId) {
          const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
          return index !== -1;
        },
        getReferenceLineSlabThicknessControlsOn(viewportId) {
          const index = viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
          return index !== -1;
        },
        addTools(){
          // 这行代码是用来检测当前设备是否是移动设备（如手机或平板电脑）的一种方法,是则true,不是则返回false
          // const isMobile = window.matchMedia('(any-pointer:coarse)').matches; 
          // ================================工具========================================
          // 创建toolGroup
          let toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
          // 如果已经创建了Group，就不能再创建工具租了，所以这里就直接获取该toolGroup就行
          if(!toolGroup)
            toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
          if(toolGroup.hasTool(PanTool))
            return;
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
          // ==================================添加工具============================
          // 操作类
          toolGroup.addTool(PanTool.toolName)
          toolGroup.addTool(ZoomTool.toolName)
          toolGroup.addTool(WindowLevelTool.toolName)
          toolGroup.addTool(StackScrollTool.toolName)
          toolGroup.addTool(DragProbeTool.toolName);
          toolGroup.addTool(PlanarRotateTool.toolName);
          // 注释类
          const toolProps = {
            configuration: {
              allowEmptyLabel: false,
              getTextCallback: (doneChangingTextCallback) => {
                const text = prompt("输入文本名称")
                doneChangingTextCallback(text);
              },
              changeTextCallback: (data, eventData, doneChangingTextCallback) => {
                // 检测双击事件
                if (eventData.event.type === 'dblclick') {
                  const newText = prompt("请输入新的文本", data.text); // 弹出输入框获取新文本
                  if (newText !== null) {
                    doneChangingTextCallback(newText); // 更新文本
                  }
                }
              },
              arrowHeadStyle: 'standard',
            }
          };
          toolGroup.addTool(LengthTool.toolName)
          toolGroup.addTool(BidirectionalTool.toolName)
          toolGroup.addTool(ArrowAnnotateTool.toolName,toolProps.configuration)
          toolGroup.addTool(RectangleROITool.toolName,
            {
              // 是否开启阴影
              shadow: true,
              getTextLines:(data, targetId)=>{
                const cachedVolumeStats = data.cachedStats[targetId];
                const { area, mean, max, stdDev, areaUnit, modalityUnit } = cachedVolumeStats;

                if (mean === undefined) {
                  return;
                }

                const textLines = [];

                textLines.push(`面积: ${utilities.roundNumber(area)} ${areaUnit}`);
                textLines.push(`Mean: ${utilities.roundNumber(mean)} ${modalityUnit}`);
                textLines.push(`Max: ${utilities.roundNumber(max)} ${modalityUnit}`);
                textLines.push(`Std Dev: ${utilities.roundNumber(stdDev)} ${modalityUnit}`);

                return textLines;
              },

            }
          );
          toolGroup.addTool(EllipticalROITool.toolName);
          toolGroup.addTool(CircleROITool.toolName);
          toolGroup.addTool(AdvancedMagnifyTool.toolName);
          // 分割类
          toolGroup.addTool(BrushTool.toolName)
          toolGroup.addTool(RectangleScissorsTool.toolName);
          toolGroup.addTool(CircleScissorsTool.toolName);
          toolGroup.addTool(SphereScissorsTool.toolName);
          toolGroup.addTool(PaintFillTool.toolName);
          this.addToolsToSpecificToolgroup(toolGroup.id,[],[],brushInstanceObjects)
          this.addToolsToSpecificToolgroup(toolGroup.id,
          baseSegmentationContourTools.map(baseSegmentationContourTool=>baseSegmentationContourTool.toolName),
          [],interpolationInstanceObjects)
          this.SegmentationContoursToolsName = [
            ...(interpolationInstanceObjects.map(interpolationInstanceObject=>interpolationInstanceObject.toolName)),
            ...(baseSegmentationContourTools.map(baseSegmentationContourTool=>baseSegmentationContourTool.toolName)),
          ]
                    // 通过修改drawRectrangleByCoordinates中的svg元素的fill属性，可以修改背景色
          const styles = {
              [LengthTool.toolName]: {
                colorHighlighted: 'rgb(255, 0, 0)',
              },
              [RectangleROITool.toolName]:{
                color:'rgb(255, 0, 0)', 
                colorHighlighted: 'rgb(0, 0, 255)',
                textBoxBackground: 'rgba(255, 255, 0, 0.3)', // 填充颜色（半透明黄色）
              },
              global: {
                  lineWidth: '2',
              },
          }
          // 对工具组进行配置API
          annotation.config.style.setToolGroupToolStyles(toolGroupId, styles);
        },
        bindTools(viewportIds,renderingEngineId)
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
          viewportIds.forEach(viewportId=>{
            toolGroup.addViewport(viewportId,renderingEngineId)
          })
        },
        activeTools()
        {
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
          //激活基础工具
          toolGroup.setToolActive(PanTool.toolName,{
            bindings:[
              {
                mouseButton:csToolsEnums.MouseBindings.Primary,
                modifierKey:csToolsEnums.KeyboardBindings.Ctrl,
              }
            ]
          })
          toolGroup.setToolActive(StackScrollTool.toolName,{
            bindings:[
              {
                mouseButton:csToolsEnums.MouseBindings.Primary,
                modifierKey:csToolsEnums.KeyboardBindings.Alt,
              }
            ]
          })
          toolGroup.setToolActive(ZoomTool.toolName,{
            bindings:[
              {
                mouseButton:csToolsEnums.MouseBindings.Primary,
                modifierKey:csToolsEnums.KeyboardBindings.Shift,
              },
            ]
          })
          toolGroup.setToolPassive(CrosshairsTool.toolName,{
            bindings:[
              {
                mouseButton:csToolsEnums.MouseBindings.Primary,
              },
            ]
          })
          // 其他的工具全部都要设置成passive，否则AdvancedMagnifyTool工具用不了
          toolGroup.setToolPassive(LengthTool.toolName)
          toolGroup.setToolPassive(BidirectionalTool.toolName)
          toolGroup.setToolPassive(ArrowAnnotateTool.toolName)
          toolGroup.setToolPassive(RectangleROITool.toolName)
          toolGroup.setToolPassive(EllipticalROITool.toolName)
          toolGroup.setToolPassive(AdvancedMagnifyTool.toolName)
          toolGroup.setToolPassive(DragProbeTool.toolName)
          toolGroup.setToolPassive(PlanarRotateTool.toolName)
          toolGroup.setToolPassive(CircleROITool.toolName)
          toolGroup.setToolPassive(BrushTool.toolName)
          toolGroup.setToolPassive(RectangleScissorsTool.toolName)
          toolGroup.setToolPassive(SphereScissorsTool.toolName)
          toolGroup.setToolPassive(CircleScissorsTool.toolName)
          toolGroup.setToolPassive(PaintFillTool.toolName)
          toolGroup.setToolPassive(PlanarFreehandContourSegmentationTool.toolName)
          toolGroup.setToolPassive(PlanarFreehandROITool.toolName)
          toolGroup.setToolPassive(SplineContourSegmentationTool.toolName)
          toolGroup.setToolPassive(SplineROITool.toolName)
          toolGroup.setToolPassive(LivewireContourSegmentationTool.toolName)
          toolGroup.setToolPassive(LivewireContourTool.toolName)
          interpolationInstanceObjects.forEach(interpolationInstanceObject=>{
            toolGroup.setToolPassive(interpolationInstanceObject.toolName)
          })
        },
        changeActiveTool(toolName){
          const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
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
        },
        handleRest(){
          const Viewports = getRenderingEngine(renderingEngineId).getVolumeViewports()[0];
          const voiRange = this.getVoiRange(1600,500)
          Viewports.resetCamera({
            resetPan:true,
            resetZoom:true,
            resetToCenter:true,
            resetRotation:true,
          })
          Viewports.setProperties({voiRange})
          Viewports.render();
        },
        handleCameraReset(){
          const Viewports = getRenderingEngine(renderingEngineId).getVolumeViewports();
          if(!Viewports || Viewports.length ===0)
            return;
          Viewports.forEach(Viewport => {
            Viewport.resetCamera();
            Viewport.setViewPresentation({rotation:0});
            Viewport.render();
          });
        },
        viewportRender(renderingEngineId)
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
        reRenderViewport()
        {
          this.viewportRender(renderingEngineId)
        },
        handleAnnotationRemove(){
          const allAnnotations = annotation.state.getAllAnnotations()
          if(allAnnotations?.length > 0)
          {
            console.log(allAnnotations)
            allAnnotations.forEach((nowAnnotation)=>{
              // 不要删除CrosshairsTool的注释
              if(nowAnnotation.metadata.toolName !== CrosshairsTool.toolName)
              {
                annotation.state.removeAnnotation(nowAnnotation.annotationUID)
              }
            })
          }
          this.viewportRender(renderingEngineId)
        },
        selectedAnnotationDelect(evt){
          if(evt.key === 'Delete')
          {
            const annotationUIDs = annotation.selection.getAnnotationsSelected()
            if(annotationUIDs?.length > 0 && 
            annotation.state.getAnnotation(annotationUIDs[0])?.metadata?.toolName !== CrosshairsTool.toolName)
            {
              annotation.state.removeAnnotation(annotationUIDs[0])
              this.viewportRender(renderingEngineId)
            }
          }
        },
        windowLevelEvent(element1){
          element1.addEventListener(Enums.Events.VOI_MODIFIED,this.voiCallback)
        },
        voiCallback(e){
          if(e.detail.range)
            this.windowLevelData = this.getWindowData(e.detail.range.lower,e.detail.range.upper);
        },
        getWindowData(lower,upper)
        {
          return utilities.windowLevel.toWindowLevel(lower,upper);
        },
        cameraModifiedEvent(element){
          element.addEventListener(Enums.Events.CAMERA_MODIFIED,this.cameraModifiedCallback)
        },
        cameraModifiedCallback(){
          const viewports = getRenderingEngine(renderingEngineId).getVolumeViewports()
          if(viewports?.length>0)
          {
            this.viewport1SliceIndex = viewports[0].getSliceIndex()
          }
        },
        annotationAddEvent(element){
          element.addEventListener(csToolsEnums.Events.ANNOTATION_COMPLETED,this.annotationAddCallback);
        },
        annotationAddCallback(e){
          console.log(e.detail)
          console.log(annotation.state.getAllAnnotations())
          console.log(annotation.state.getAnnotationManager())
          // console.log(annotation.state.getAnnotations(LengthTool.toolName,))
        },
        async handleChange(evt) {
          // 阻止事件冒泡
          evt.stopPropagation();
          evt.preventDefault();
          // 用户传入获得文件数组
          // 将文件数组转化成ImageIds
          // 对imageIds 进行排序
          const filelist = evt.target.files; // filelist
          // 判断输入的iamgeIds1是否为空，或者不符合其他要求
          if(filelist?.length === 0)
          {
            alert("导入的文件夹不能为空！");
            return;
          }else if(filelist?.length < 5){
            alert("请至少选择5张dicom图片进行MPR展示");
            return;
          }
          // 更新文件前清除之前的缓存
          cache.purgeCache();
          this.fileSet = Array.from(filelist) // 转换成存储file对象的数组
          await this.handleFilesAndImageIds(this.fileSet)
          this.run()
          this.renderAnnotations()
        },
        async handleFilesAndImageIds(files){
          // 为了获取this.files和this.fileimageIds
        // 输入的参数是表示文件的Blob数据
          let image_array = []
          const imageIds = [];
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
        },
        typedArrayToFile(pixelData, fileName) {
            // 创建 Blob 对象
            const blob = new Blob([pixelData]);
            // 创建 File 对象
            const file = new File([blob], fileName);
            return file;
        },
        convertToGrayScale(pixelData, width, height) {
          const grayScaleData = new Uint16Array(width * height);
          for (let i = 0, j = 0; i < pixelData.length; i += 4, j++) {
              const r = pixelData[i];
              const g = pixelData[i + 1];
              const b = pixelData[i + 2];
              // 计算灰度值并转换为 uint16
              grayScaleData[j] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          }
          return grayScaleData;
        },
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
        async getDicomdict(file){
          const arrayBuffer = await this.fileToArrayBuffer(file)
          // const uint8Array = new Uint8Array(arrayBuffer);
          const dataset = dcmjs.data.DicomMessage.readFile(arrayBuffer)
          return dataset
        },
        async saveAnnotationsForSingleDicom(dicom,AnnotationManager,imageId)
        {
          // 为单个Dicom图像保存它的注释，然后返回一个新的Dicom图像
          const annotationDataObject = Object.values(AnnotationManager.saveAnnotations())[0]
          const dataset = await this.getDicomdict(dicom)
          // 如果有注释的话
          if(annotationDataObject)
          {
            const tagAnnotationData = []
            for(const toolName in annotationDataObject)
            {
              if(toolName !== CrosshairsTool.toolName)
              {
                const annotationDataAarray = annotationDataObject[toolName] // 返回每个toolName对应的工具的数组，每个数据都是

                annotationDataAarray.forEach((annotationData)=>{
                  // 对应的注释存放在对应的图像上，这里只能解决Axisal，Sagittal和Conoral没办法
                  if(annotationData.metadata.referencedImageId === imageId)
                    tagAnnotationData.push(annotationData)
                })
              }
            }
            console.log("tagAnnotationData",tagAnnotationData)
            const tagAnnotationDataJson = JSON.stringify(tagAnnotationData)
            dataset.upsertTag('10010010','UT',tagAnnotationDataJson)
          }
          const newDicom = dataset.write()
          // 返回的是ArrayBuffer类型
          return newDicom
        },
        async renderAnnotationsForSingleDicom(dicom,imageId)
        {
          const arrayBuffer = await new Promise((resolve)=>{
            const reader = new FileReader()
            reader.onload = (e)=>{
              resolve(e.target.result)
            }
            reader.readAsArrayBuffer(dicom)
          })
          const dataset = dcmjs.data.DicomMessage.readFile(arrayBuffer)
          const annotationData = dataset.dict['10010010']
          if(!annotationData)
          {
            return
          }
          const annotationsJson = annotationData.Value
          const annotationsArray = JSON.parse(annotationsJson)
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          annotationsArray.forEach(Annotation=>{
            Annotation.metadata.referencedImageId = imageId
            Annotation.invalidated = true; // 标记为无效以重新渲染
            annotation.locking.setAnnotationLocked(Annotation.annotationUID,false)
            defaultAnnotationManager.addAnnotation(Annotation)
          })
          this.reRenderViewport()
        },
        renderAnnotations(){
          this.fileSet.forEach((file,index)=>{
            this.renderAnnotationsForSingleDicom(file,this.fileImageIds[index])
          })
        },
        async saveFilesToServer(){
          const saveFileSet = []
          const annotationManager = annotation.state.getAnnotationManager()
          for(let i =0;i<this.fileSet.length;i++)
          {
            const saveDicomArrayBuffer = await this.saveAnnotationsForSingleDicom(this.fileSet[i],annotationManager,this.fileImageIds[i])
            saveFileSet.push(this.typedArrayToFile(saveDicomArrayBuffer,`${i}.dcm`))
          }
          // 保存到服务器
          const formData = new FormData();
          formData.append('savePath','test1')
          saveFileSet.forEach(file=>formData.append(file.name,file))
          const response = await axios.get('http://localhost:8000/get_csrf_token/')
          this.csrfToken = response.data.token
          // 使用 axios 或 fetch 上传文件
          axios.post('http://localhost:8000/upload/', formData,{
            headers:{
              'Content-Type': 'multipart/form-data', // 如果是上传文件，需要设置正确的 Content-Type
              'X-CSRFToken': this.csrfToken,
            },
            onUploadProgress: (progressEvent) => {
              this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            },
          })
          .then(response => {
            console.log('上传成功', response.data);
            this.uploadProgress = 0
          })
          .catch(error => {
            console.log('错误:', error.response ? error.response.data : error.message);
            this.uploadProgress = 0
          });
                    //=======================下载成jpg/png=============================
          // this.handleCameraReset()
          // const saveViewport = getRenderingEngine(renderingEngineId).getViewports()[0]
          // if (this.viewport1SliceIndex > 0)
          // {
          //   utilities.scroll(saveViewport,
          //   {
          //     delta:-this.viewport1SliceIndex,
          //   }
          //   )
          // }
          // for(let i = 0;i< 1;i++)
          // {
          //   const canvas = saveViewport.canvas
          //   this.getNewDicom(this.fileSet[i],canvas)
          //   utilities.scroll(saveViewport,
          //   {
          //     delta:1,
          //   })
          // }
        },
        async downloadFromServer(){
          // 从服务器导入文件夹信息（列表），GET 请求即可
          // 显示folderModal
          this.showfolderModal = true
          axios.get("http://localhost:8000/FolderModal/")
          .then(response=>{
            const datas = response.data.data
            console.log(datas)
            this.folderModalFolders = []
            datas.forEach((data,index)=>{
              const tempobj = {}
              tempobj['id'] = index
              tempobj['name'] = data
              tempobj['downloadFolderProcess'] = 0
              tempobj['downloadFolderDCMProcess'] = 0
              this.folderModalFolders.push(tempobj)
            })
            console.log(this.folderModalFolders)
          })
        },      
        async downloadFilesFromServer(folderId){
          // 从指定文件夹中导入文件，并且获得的最开始是zip文件，然后解压zip文件获得所有dcm文件
          // 之后将所有dcm文件处理后存储到this.fileSet和this.imageIds中
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
              this.folderModalFolders[folderId]['downloadFolderProcess'] = Math.round((current / total) * 100);
            }
          })
          this.folderModalFolders[folderId]['downloadFolderProcess'] = 0
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
          this.run()
          this.renderAnnotations()
        },
        async downloadFilesFromServerDCM(folderId){
          // 从指定文件夹中下载dcm文件，下载的是zip文件
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
              this.folderModalFolders[folderId]['downloadFolderDCMProcess']= Math.round((current / total) * 100);
            },
          })
          this.folderModalFolders[folderId]['downloadFolderDCMProcess'] = 0
          // 获取zip数据
          const zipdata = response1.data
          // 创建一个zip实例
          const zip = new JSZip()
          // 载入 ZIP 文件
          const zipContent = await zip.loadAsync(zipdata);
          // 提供下载链接
          const zipBlob = await zipContent.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);

          // 创建一个链接元素并触发下载
          const a = document.createElement('a');
          a.href = url;
          let forlderName = ""
          this.folderModalFolders.forEach(obj=>{
            if (obj['id'] === folderId)
            {
              forlderName = obj['name']
            }
          })
          a.download = forlderName+'.zip'; // 指定下载文件名
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a); // 下载完成后移除链接元素

          // 取消对 URL 的引用
          URL.revokeObjectURL(url);
        },   
        async downloadFilesFromServerDelete(folderId){
          // 删除指定的文件夹
          // 先将ID号传为后端
          const response = await axios.get('http://localhost:8000/get_csrf_token/')
          this.csrfToken = response.data.token
          await axios.post("http://localhost:8000/deleteSpecificDir/",String(folderId),{
            headers:{
              'Content-Type':"application/plain",
              'X-CSRFToken': this.csrfToken,
            }
          })
          // 发送删除请求
          await axios.get("http://localhost:8000/deleteSpecificDir/")
          // 重新获取文件夹列表
          await this.downloadFromServer()
          
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
        async prefetchMetadataInformation(imageIdsToPrefetch) {
          for (let i = 0; i < imageIdsToPrefetch.length; i++) {
            await imageLoader.loadAndCacheImage(imageIdsToPrefetch[i])
          }
        },
        async run(){
            // 添加工具
            this.addTools();
            // 创建两个容器，这两个容器用于存放视图 ViewPort
            this.element1 = document.querySelector('#element2')
            const element2 = document.querySelector('#element3')
            const element3 = document.querySelector('#element4')
            // Disable right click context menu so we can have right click tools
            this.element1.oncontextmenu = (e) => e.preventDefault();
            element2.oncontextmenu = (e) => e.preventDefault();
            element3.oncontextmenu = (e) => e.preventDefault();
            this.element1.addEventListener(csToolsEnums.Events.KEY_DOWN,this.cancelDrawingEventListener)
            element2.addEventListener(csToolsEnums.Events.KEY_DOWN,this.cancelDrawingEventListener)
            element3.addEventListener(csToolsEnums.Events.KEY_DOWN,this.cancelDrawingEventListener)

            // 添加事件
            this.windowLevelEvent(this.element1)
            // this.annotationAddEvent(element1)
            this.cameraModifiedEvent(this.element1)
            // 在缓存中删除上一次加载的影像
            if (cache.getVolume(volumeId)) {
              cache.removeVolumeLoadObject(volumeId);
            }
            // 创建并缓存一个volume，这是一个具有物理尺寸和空间方向的3D数据阵列，通过VolumeLoader创建
            const volume = await volumeLoader.createAndCacheVolume(volumeId,{
              imageIds:this.fileImageIds,
            })
             // 准备一个渲染引擎 => renderingEngine
            const renderingEngine = getRenderingEngine(renderingEngineId);
            //在渲染引擎中创建并加载视图，使视图与HTML元素绑定
            this.viewportInput = [
              // 每个视图包含视图ID、视图容器 Element、视图类型、基本选择
              {
                viewportId: viewportId1,
                element: this.element1,
                type: ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.AXIAL, // 轴向视图
                  background:[0,0,0],
                },
              },
              {
                viewportId: viewportId2,
                element: element2,
                type: ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.SAGITTAL, // 矢状视图
                  background:[0,0,0],
                },
              },
              {
                viewportId: viewportId3,
                element: element3,
                type: ViewportType.ORTHOGRAPHIC,
                defaultOptions:{
                  orientation:Enums.OrientationAxis.CORONAL, // 矢状视图
                  
                },
              }
            ];
             // Create a segmentation of the same resolution as the source data for the CT volume
            volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
              volumeId: segmentationId,
            });

            // 渲染viewport视图
            renderingEngine.setViewports(this.viewportInput);
            // 加载Volume的数据
            volume.load();
            // 将视图和Volume结合起来
            await setVolumesForViewports(
              renderingEngine,
              [{ 
                volumeId,
                // blendMode:Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                // callback: ({ volumeActor }) => {
                  // // set the windowLevel after the volumeActor is created
                  // volumeActor
                  //   .getProperty()
                  //   .getRGBTransferFunction(0)
                  //   .setMappingRange(-180, 220);
                // },
              }],
              [viewportId1,viewportId2,viewportId3]
            );
            // 创建一个新的视图
            this.createViewport(renderingEngineId,{
              viewportId: "CT_STACK_TEST",
              element: null,
              type: ViewportType.STACK,
            },toolGroupForStackId,this.fileImageIds)
            // 为这个视图绑定的工具组添加工具
            this.addToolsToSpecificToolgroup(toolGroupForStackId,[AdvancedMagnifyTool.toolName])
            this.activeToolsToSpecificToolGroup(toolGroupForStackId,[AdvancedMagnifyTool.toolName],[{
              mode:'active',bindings:[ { mouseButton:csToolsEnums.MouseBindings.Primary} ],
            }])
            // 绑定工具
            this.bindTools(viewportIds,renderingEngineId)
            const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
            toolGroup.addTool(CrosshairsTool.toolName,
              {
                getReferenceLineColor:this.getReferenceLineColor,
                getReferenceLineControllable:this.getReferenceLineControllable,
                getReferenceLineDraggableRotatable:this.getReferenceLineDraggableRotatable,
                getReferenceLineSlabThicknessControlsOn:this.getReferenceLineSlabThicknessControlsOn,
                mobile: {
                  enabled: false,
                  opacity: 0.8,
                  handleRadius: 9,
                },
              }
            );
            this.activeTools();

            // Update the blendMode for actors to instantly reflect the change
            const crosshairsInstance = toolGroup.getToolInstance(
              CrosshairsTool.toolName
            );
            const oldConfiguration = crosshairsInstance.configuration;

            crosshairsInstance.configuration = {
              ...oldConfiguration,
              slabThicknessBlendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND,
            };
            // 这个是必须的，否则不能正确地同步
            const volumeViewports = renderingEngine.getVolumeViewports()
            volumeViewports.forEach((volumeViewport)=>{
              volumeViewport.setBlendMode(Enums.BlendModes.MAXIMUM_INTENSITY_BLEND)
              volumeViewport.render()
            })
            
            // 添加同步器
            this.addVOISycronizers()
            this.addZoomPanSynchronizer()
            // this.addSlabThicknessSynchronizer()
            // 初始化分割labelmap
            await this.initSegmentationLabelmap(viewportIds,segmentationId)
            renderingEngine.renderViewports([viewportId1, viewportId2, viewportId3]);
            
            await this.initSegmentationContour(viewportIds,segmentationId)
              // Create and add the color bar to the DOM
            const colorbarContainer = document.querySelector('.colorbarContainer')
            if (showColorbar)
            {
              showColorbar = false
              ctColorbar = new ViewportColorbar({
                orientation:'vertical',
                id: 'ctColorbar',
                element:this.element1,
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
              console.log(ctColorbar)
            }
            this.showTextForElement1 = true;
        }
    }
}
</script>
