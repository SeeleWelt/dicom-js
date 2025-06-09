 <template>
  <div id="demo-wrap">
    <h3>加载单个图像</h3>
    <input type="file" @change="handleChange">
    <button @click="handleClick">获取所有注释</button>
    <h3>渲染栈影像</h3>
  </div>
</template>

<style  scoped>
.cornerstone-item {
  display: inline-block;
  width: 512px;
  height: 512px; 
  margin-top: 20px;
  padding: 20px;
  border: 2px solid #96CDF2;
  border-radius: 10px;
}

</style>

<script lang = 'js'>
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import {
  RenderingEngine,
  Enums,
  getRenderingEngine,
  cache,
  volumeLoader
} from '@cornerstonejs/core';
// import uuidv4 from '@/cornerstone/helper/uuidv4';
import * as dcmjs from 'dcmjs'
import {annotation,addTool,ToolGroupManager,Enums as csToolsEnums, AdvancedMagnifyTool,
  segmentation
} from '@cornerstonejs/tools';
import initCornerstone from '@/cornerstone/helper/initCornerstone';
// import getTestImageId from '@/cornerstone/helper/getTestImageId';
// import handleAck from 'mqtt/build/lib/handlers/ack';
// import axios from 'axios'
const renderingEngineId = 'myRenderingEngine'
const viewportId = "CT_AXIAL_STACK";
const toolGroupId = 'test'
const segmentationId = 'segmentationId'
export default {
    name: 'DicomTest',
    // mounted() {
        
    // },
    data(){
      return{
        imageId:null,
        file:null,
      }
    },
    methods: {
        async addSegmentationsToState(volumeId) {
          let segmentationVolume = cache.getVolume(segmentationId);

          if (segmentationVolume) {
            return;
          }

          // Create a segmentation of the same resolution as the source data
          segmentationVolume = volumeLoader.createAndCacheDerivedLabelmapVolume(
            volumeId,
            {
              volumeId: segmentationId,
            }
          );

          // Add the segmentations to state
          segmentation.addSegmentations([
            {
              segmentationId: segmentationId,
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
          ])
        },
        viewportRender(renderingEngineId)
        {
          const renderingEngine = getRenderingEngine(renderingEngineId)
          if (renderingEngine)
          {
            const viewports = renderingEngine.getViewports()
            if(viewports?.length > 0){
              viewports.forEach(viewport=>viewport.render())
            } 
          }
        },
        reRenderViewport()
        {
          this.viewportRender(renderingEngineId)
        },
        handleClick(){
          console.log(annotation.state.getAllAnnotations())
        },
        handleChange(e){
          this.file = e.target.files[0]
          if(this.file.name.endsWith(".dcm"))
            this.imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(this.file)
          else{
            alert("请输入单张dicom图像(.dcm)")
            return
          }
          this.run()
          this.renderAnnotations(this.file,this.imageId)
        },
        async renderAnnotations(dicom,imageId)
        {
          const arrayBuffer = await new Promise((resolve)=>{
            const reader = new FileReader()
            reader.onload = (e)=>{
              resolve(e.target.result)
            }
            reader.readAsArrayBuffer(dicom)
          })
          const dataset = dcmjs.data.DicomMessage.readFile(arrayBuffer)
          const annotationsJson = dataset.dict['10010010']?.Value
          if(!annotationsJson)
            return
          const annotationsArray = JSON.parse(annotationsJson)
          const defaultAnnotationManager = annotation.state.getAnnotationManager()
          const viewport = getRenderingEngine(renderingEngineId).getViewport(viewportId)
          console.log(viewport.getCamera())
          annotationsArray.forEach(Annotation=>{
            Annotation.metadata.referencedImageId = imageId
            Annotation.metadata.sliceIndex = viewport.getSliceIndex()
            defaultAnnotationManager.addAnnotation(Annotation)
            viewport.render()
          })
        },
        async run(){
            await initCornerstone()
            addTool(AdvancedMagnifyTool)
            const viewportGrid = document.querySelector("#demo-wrap");

            viewportGrid.style.width = '500px';
            viewportGrid.style.height = '500px';
            viewportGrid.style.paddingTop = '5px';
            viewportGrid.style.gap = '5px';
            // await dicomImageInit()
            const element = document.createElement('div');

            // Disable right click context menu so we can have right click tools
            element.oncontextmenu = (e) => e.preventDefault();
            element.style.width = '500px';
            element.style.height = '500px';
            element.id = viewportId;
            element.style.overflow = 'hidden';

            viewportGrid.appendChild(element);
            // ============================= //
          
            // 上面定义的第一个接口：获取所有的文件名
            // const res = await axios.get("http://localhost:8080/3YW3ZGDF");
            // // 上面定义的第二个接口：根据文件名获取指定文件
            // const imageIds = res.data.map(
            //     (item) => `wadouri:http://localhost:8080/3YW3ZGDF/${item}`
            // );
            
            // // 这里可以添加代码来处理 imageIds，例如加载图像
            // const imageIds = await getTestImageId();

              // step1: 准备一个渲染引擎 => renderingEngine
            const renderingEngine = new RenderingEngine(renderingEngineId);
            const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)

            toolGroup.addTool(AdvancedMagnifyTool.toolName)
            toolGroup.setToolActive(AdvancedMagnifyTool.toolName,{
              bindings:[{
                mouseButton:csToolsEnums.MouseBindings.Primary,
                modifierKey: csToolsEnums.KeyboardBindings.Ctrl,
              },
            ],
            })
            // step2：在渲染引擎中创建并加载视图，使视图与HTML元素绑定
            
            const viewportInput = {
                viewportId: viewportId,
                element: element,
                type: Enums.ViewportType.STACK,
                defaultOptions:{
                  backgroud:[0.2,0,0.2],
                },
            };
            renderingEngine.enableElement(viewportInput);
            toolGroup.addViewport(viewportId,renderingEngineId)
            // step3：渲染viewport视图
            const viewport = renderingEngine.getStackViewport(viewportId);
            await viewport.setStack([this.imageId]);
            // Add the segmentation representations to toolgroup1
            await segmentation.addSegmentationRepresentations(viewportId, [
              {
                segmentationId,
                type: csToolsEnums.SegmentationRepresentations.Labelmap,
              },
            ]);
 
            // viewport.render();
        }
    }
}
</script>
