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
      <button @click = 'handleReset'>重置</button>
    </div>
    <h3>渲染Volume图像</h3>
    <div id="content"></div>
  </div>
</template>

<style  scoped>
.cornerstone-item {
  display: inline-block;
  width: 300px;
  height: 300px; 
  margin-top: 20px;
  /* padding: 20px; */
  border: 2px solid #96CDF2;
  border-radius: 10px;
}

</style>

<script lang = 'js'>
import {ref} from 'vue'
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
  // imageLoader,
} from '@cornerstonejs/core';
// import axios from 'axios';
// import getTestImageId from "@/cornerstone/helper/getTestImageId";
// Tools
import {
  ToolGroupManager,
  StackScrollTool,
  Enums as csToolsEnums,
  CrosshairsTool,
  addTool,
  synchronizers,
  SynchronizerManager,
} from '@cornerstonejs/tools';
const {ViewportType} = Enums; //相当于 cosnt ViewportType = Enums.ViewportType
// 存放文件ImageIds
const fileImageIds = ref([])
const slabThicknessSynchronizerId = 'test'
// 定义引擎的ID
const renderingEngineId = 'myRenderingEngine'
// 在渲染引擎中创建并加载视图，使视图与HTML元素绑定
const viewportId1 = "CT_AXIAL"; // 创建轴向视图
const viewportId2 = "CT_SAGITTAL"; // 创建矢状视图
const viewportId3 = "CT_CORONAL"; // 创建冠状视图
const viewportIds = [viewportId1,viewportId2,viewportId3]
const viewportColors = {
  [viewportId1]: 'rgb(200, 0, 0)',
  [viewportId2]: 'rgb(200, 200, 0)',
  [viewportId3]: 'rgb(0, 200, 0)',
};
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
export default {
    name: 'DicomVolume',
    // mounted() {
    //     this.run();
    // },
    methods: {
        handleReset(){
          const Viewports = getRenderingEngine(renderingEngineId).getVolumeViewports()[0];
          Viewports.resetCamera({
            resetPan:true,
            resetZoom:true,
            resetToCenter:true,
            resetRotation:true,
          })
          Viewports.render();
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
          const index =
            viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
          return index !== -1;
        },
        handleChange(evt) {
          // 阻止事件冒泡
          evt.stopPropagation();
          evt.preventDefault();
          
          // 更新文件前清除之前的缓存
          cache.purgeCache();

          const files = evt.target.files; // filelist
          const imageIds = [];
          Array.from(files).forEach(file => {
            const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
            imageIds.push(imageId);
          });
          fileImageIds.value = imageIds;
          this.run(imageIds)
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
        addSlabThicknessSynchronizer(){
          //================ 添加同步器 ==========================
          // 这里的创建的同步器是内置的，只需要一个同步器名称即可
          synchronizers.createSlabThicknessSynchronizer(slabThicknessSynchronizerId)
          // 获取这个创建的同步器
          const slabThicknessSynchronizer = SynchronizerManager.getSynchronizer(slabThicknessSynchronizerId)
          // 为同步器添加源视图和目标视图
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[0] });
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[1] });
          slabThicknessSynchronizer.add({ renderingEngineId, viewportId: viewportIds[2] });
          // slabThicknessSynchronizer.setEnabled(false)

        },
        init(){
          initCornerstone();
        },
        async run(imageIds1){
            initCornerstone();
            addTool(CrosshairsTool)
            let image_array = []

            const size = '500px';
            const content = document.getElementById('content');
            const viewportGrid = document.createElement('div');

            viewportGrid.style.display = 'flex';
            viewportGrid.style.display = 'flex';
            viewportGrid.style.flexDirection = 'row';

            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const element3 = document.createElement('div');
            element1.style.width = size;
            element1.style.height = size;
            element2.style.width = size;
            element2.style.height = size;
            element3.style.width = size;
            element3.style.height = size;

            // Disable right click context menu so we can have right click tools
            element1.oncontextmenu = (e) => e.preventDefault();
            element2.oncontextmenu = (e) => e.preventDefault();
            element3.oncontextmenu = (e) => e.preventDefault();

            viewportGrid.appendChild(element1);
            viewportGrid.appendChild(element2);
            viewportGrid.appendChild(element3);

            content.appendChild(viewportGrid);

            const instructions = document.createElement('p');
            instructions.innerText = `
              Basic controls:
              - Click/Drag anywhere in the viewport to move the center of the crosshairs.
              - Drag a reference line to move it, scrolling the other views.

              Advanced controls: Hover over a line and find the following two handles:
              - Square (closest to center): Drag these to change the thickness of the MIP slab in that plane.
              - Circle (further from center): Drag these to rotate the axes.
              `;

            content.append(instructions);
            // // ==============获取ImageId=========================
            // // 上面定义的第一个接口：获取所有的文件名
            // const res = await axios.get("http://localhost:8080/3YW3ZGDF");
            // // 上面定义的第二个接口：根据文件名获取指定文件
            // const imageIds1 = res.data.map(
            //     (item) => `wadouri:http://localhost:8080/3YW3ZGDF/${item}`
            // );

            // 加载图像信息，这样才可以获得dcm元数据
            await this.prefetchMetadataInformation(imageIds1)
            // 获取元数据中的sliceLocation,用于对dcm进行排序，正确的顺序才能够被Volume正常显示
            imageIds1.forEach(image => {          
              image_array.push(metaData.get("imagePlaneModule",image).sliceLocation)
            })
            
            // console.log(imageIds1)
            const imageIds = this.mySort(image_array,imageIds1)
            // 这里可以添加代码来处理 imageIds，例如加载图像
            // const imageIds = await getTestImageId()

            
            // 定义volumeId,作为类似于ImageLoader的一个Scheme
            const volumeId = "myVolumeId"
              // 在缓存中删除上一次加载的影像
            if (cache.getVolume(volumeId)) {
              cache.removeVolumeLoadObject(volumeId);
            }
            // 创建并缓存一个volume，这是一个具有物理尺寸和空间方向的3D数据阵列，通过VolumeLoader创建
            const volume = await volumeLoader.createAndCacheVolume(volumeId,{
              imageIds:imageIds,
            })

            // 准备一个渲染引擎 => renderingEngine
            const renderingEngine = new RenderingEngine(renderingEngineId);
              // Create the viewports
          const viewportInputArray = [
            {
              viewportId: viewportId1,
              type: ViewportType.ORTHOGRAPHIC,
              element: element1,
              defaultOptions: {
                orientation: Enums.OrientationAxis.AXIAL,

              },
            },
            {
              viewportId: viewportId2,
              type: ViewportType.ORTHOGRAPHIC,
              element: element2,
              defaultOptions: {
                orientation: Enums.OrientationAxis.SAGITTAL,
              },
            },
            {
              viewportId: viewportId3,
              type: ViewportType.ORTHOGRAPHIC,
              element: element3,
              defaultOptions: {
                orientation: Enums.OrientationAxis.CORONAL,
              },
            },
          ];

          renderingEngine.setViewports(viewportInputArray);
            // 加载Volume的数据
          volume.load();
          // 将视图和Volume结合起来
          await setVolumesForViewports(
              renderingEngine,
              [{ volumeId }],
              [viewportId1,viewportId2,viewportId3]
          );
            // ================================工具========================================
            const toolGroupId = "seeleTool"
            // 创建toolGroup
            let toolGroup;
            toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
            if(!toolGroup)
              toolGroup=ToolGroupManager.getToolGroup(toolGroupId)
            //注册tool
            addTool(StackScrollTool);
            //添加工具
            toolGroup.addTool(StackScrollTool.toolName)
            //激活工具
            toolGroup.setToolActive(StackScrollTool.toolName,
            { bindings: [
                {
                  mouseButton: csToolsEnums.MouseBindings.Wheel,
                },
              ],
            });
            
            //工具组与视图进行绑定
            toolGroup.addViewport(viewportId1, renderingEngineId);
            toolGroup.addViewport(viewportId2, renderingEngineId);
            toolGroup.addViewport(viewportId3, renderingEngineId);

            toolGroup.addTool(CrosshairsTool.toolName, {
              getReferenceLineColor:this.getReferenceLineColor,
              getReferenceLineControllable:this.getReferenceLineControllable,
              getReferenceLineDraggableRotatable:this.getReferenceLineDraggableRotatable,
              getReferenceLineSlabThicknessControlsOn:this.getReferenceLineSlabThicknessControlsOn,
              mobile: {
                enabled: false,
                opacity: 0.8,
                handleRadius: 9,
              },
            });
            toolGroup.setToolActive(CrosshairsTool.toolName,
            { bindings: [
                {
                  mouseButton: csToolsEnums.MouseBindings.Primary,
                },
              ],
            });
            this.addSlabThicknessSynchronizer()
            renderingEngine.renderViewports([viewportId1, viewportId2,viewportId3]);
        }
    }
}
</script>
