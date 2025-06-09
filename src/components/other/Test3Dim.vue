
<template>
  <div  class="dialog-overlay" >
    <div class="dialog" @click.stop>
      <DropdownToolBar :title="''" :default-value="'CT-Bone'" :value="presetNames"
      :onSelectedValueChange="handleVoluem3dPreset" :type-flag="0"></DropdownToolBar>
      <div class="dialog-header">
        <span class="close-button" @click="close">&times;</span>
      </div>
      <div id="3d_content">
        <!-- 在这里放置你的 3D 内容 -->
      </div>
    </div>
  </div>
</template>


<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 10px;
}

.close-button {
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: #888;
}

#3d_content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
}
</style>
<script>
import {
  RenderingEngine,
  volumeLoader,
  Enums,
  setVolumesForViewports,
  CONSTANTS,
  cache,
} from '@cornerstonejs/core';
import initCornerstone from '@/cornerstone/helper/initCornerstone';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
// import createImageIdsAndCacheMetaData from '@/cornerstone/dicomwebClient/createImageIdsAndCacheMetaData';
// import axios from 'axios';
import * as cornerstoneTools from '@cornerstonejs/tools';
import DropdownToolBar from './DropdownToolBar.vue';

// This is for debugging purposes
console.warn(
  'Click on index.ts to open source code for this example --------->'
);

const { ToolGroupManager } = cornerstoneTools;

const { ViewportType } = Enums;
// const { MouseBindings } = csToolsEnums;

// Define a unique id for the volume
let renderingEngine;
const volumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id
const renderingEngineId = 'myRenderingEngine3d';
const viewportId = '3D_VIEWPORT';
let viewport;
// ======== Set up page ======== //
export default{
  components:{
    DropdownToolBar,
  },
  props:{
    imageIds:{
      type:Array,
      required:true,
    },
  },
  mounted() {
    this.run()
  },
  data(){
    return{
      presetNames:CONSTANTS.VIEWPORT_PRESETS.map(preset=>preset.name)
    }
  },
  methods:{
    handleVoluem3dPreset(value){
      const viewport = renderingEngine.getVolumeViewports()[0]
      viewport.setProperties({preset:value})
      viewport.render()
    },
    close(){
      this.$emit("close")
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
        await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIdsToPrefetch[i]).promise
      }
    },
    async run() {
      // cache.purgeCache()
      const size = '500px';
      const content = document.getElementById('3d_content');
      const viewportGrid = document.createElement('div');

      viewportGrid.style.display = 'flex';
      viewportGrid.style.display = 'flex';
      viewportGrid.style.flexDirection = 'row';

      const element1 = document.createElement('div');
      element1.oncontextmenu = () => false;

      element1.style.width = size;
      element1.style.height = size;

      viewportGrid.appendChild(element1);

      content.appendChild(viewportGrid);

      const instructions = document.createElement('p');
      instructions.innerText = '拖拽图像进行旋转';

      content.append(instructions);
      await initCornerstone()

      // 清楚上次的缓存
      if (cache.getVolume(volumeId)) {
        cache.removeVolumeLoadObject(volumeId);
      }
      cornerstoneTools.addTool(cornerstoneTools.TrackballRotateTool)
      const toolGroupId = 'TOOL_GROUP_ID';

      // Define a tool group, which defines how mouse events map to tool commands for
      // Any viewport using the group
      let toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if(!toolGroup)
      {
        toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
      }
      // let image_array = []
      // // // Add the tools to the tool group and specify which volume they are pointing at
      // // addManipulationBindings(toolGroup, {
      // //   is3DViewport: true,
      // // });

      // // Get Cornerstone imageIds and fetch metadata into RAM
      // // ==============获取ImageId=========================
      // // 上面定义的第一个接口：获取所有的文件名
      // const res = await axios.get("http://localhost:8080/3YW3ZGDF");
      // // 上面定义的第二个接口：根据文件名获取指定文件
      // const imageIds1 = res.data.map(
      //     (item) => `wadouri:http://localhost:8080/3YW3ZGDF/${item}`
      // );

      // // 加载图像信息，这样才可以获得dcm元数据
      await this.prefetchMetadataInformation(this.imageIds)
      // // 获取元数据中的sliceLocation,用于对dcm进行排序，正确的顺序才能够被Volume正常显示
      // imageIds1.forEach(image => {          
      //   image_array.push(metaData.get("imagePlaneModule",image).sliceLocation)
      // })
      
      // // console.log(imageIds1)
      // const imageIds = this.mySort(image_array,imageIds1)

      // Instantiate a rendering engine
      renderingEngine = new RenderingEngine(renderingEngineId);
      // Create the viewports

      const viewportInputArray = [
        {
          viewportId: viewportId,
          type: ViewportType.VOLUME_3D,
          element: element1,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
            background: CONSTANTS.BACKGROUND_COLORS.slicer3D,
          },
        },
      ];
      
      if(!renderingEngine.getViewport(viewportId))
        renderingEngine.setViewports(viewportInputArray);
      if(!toolGroup.hasTool(cornerstoneTools.TrackballRotateTool.toolName))
      {
        toolGroup.addTool(cornerstoneTools.TrackballRotateTool.toolName)
      }
      // Set the tool group on the viewports
      toolGroup.addViewport(viewportId, renderingEngineId);
      toolGroup.setActivePrimaryTool(cornerstoneTools.TrackballRotateTool.toolName)
      // Define a volume in memory
      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds:this.imageIds,
      });

      // Set the volume to load
      volume.load();
      viewport = renderingEngine.getViewport(viewportId);
      console.log(renderingEngine.getViewport(viewportId))
      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId }],
        [viewportId]
      ).then(() => {
        viewport.setProperties({
          preset: 'CT-Bone',
        });
        viewport.render();
      });
      }
  }
}
</script>