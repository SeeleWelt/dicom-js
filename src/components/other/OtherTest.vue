<template>
  <div class="grid-container">
    <GridLayout
      :layout="layout"
      :col-num="columns"
      :row-height="rowHeight"
      :max-rows="rows"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[1, 1]" 
      :use-css-transforms="true"
      :style="{height:totalHeight+'px',width:'80%'}"
      @layout-updated="handleLayoutUpdated"
    >
      <GridItem
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        @dblclick="handleDoubleClick(item)"
        @dragover.prevent
        @drop="drop($event,item.i)"
      >
      </GridItem>
    </GridLayout>
  </div>

  <!-- 导入的table -->
  <div>
    <el-card style="width: 15%;">
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      row-key="dicom_name"
      style="width: 100%"
      :show-header="false"
      @dragover.prevent
    >
      <!-- 单选框 -->
      <el-table-column  width="30">
        <template #default="scope">
          <el-radio
            v-model="selectedDicomsName"
            :value="scope.row.dicoms_name"
            @change="handleRadioChange(scope.row.dicoms_name)"
          ></el-radio>
        </template>
      </el-table-column>

      <el-table-column label="dicoms_name" width="150">
        <template #default="scope">
          <el-icon :draggable="true"       
          @dragstart="dragStart($event,scope.row.dicoms_name)"
          @dragend="dragEnd"><Files /></el-icon>
          <el-text class="cantSelect" style="margin-left:10px">{{ scope.row.dicoms_name }}</el-text>
        </template>
      </el-table-column>

      <el-table-column  label="num" width="60">
        <template #default="scope"><el-text class="cantSelect">#{{ scope.row.num }}</el-text></template>
      </el-table-column>

    </el-table>
  </el-card>
  </div>

  <div>
    <div class="dicomFilesInputZone" @click="triggerUpload">
      <el-text type="success">将文件拖到此处，或<el-text type="danger">点击上传</el-text></el-text>
    </div>
    <input
        type="file"
        webkitdirectory
        directory
        multiple
        @change="handleFolderUpload"
        ref="fileInput"
        style="display: none"
      />
  </div>
  <div id="output"></div>
  <div>
    <el-image
      style="width: 100px; height: 100px"
      :src="url"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      show-progress
      fit="cover"
      :previewSrcList="previewSrcList"
    />
  </div>

  <WindowSelect></WindowSelect>
</template>

<script>
import { GridLayout, GridItem } from 'vue3-grid-layout';
import * as dcmjs from 'dcmjs'
import WindowSelect from '../SingleAxisViewport/WindowSelect.vue';
const url =
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
// const tableData = [
//         {
//           dicom_name:"test1",
//           num:"300",
//         },
//         {
//           dicom_name:"test2",
//           num:"400",
//         },
//       ]
export default {
  mounted(){
    this.rowHeight = this.totalHeight/this.rows //每一行的高度
    this.avg_row = 1
    this.avg_col = 1
    const temp_layout = []
    const rows_array = Array.from({ length: this.rows }, (v,i) => i+1);
    const cols_array = Array.from({ length: this.columns }, (v,i) => i+1);
    console.log(rows_array,cols_array)
    rows_array.forEach(row =>{
      cols_array.forEach(col=>{
        const index = (row-1)*this.columns+col
        const temp={i:index,x:(col-1)*this.avg_col,y:(row-1)*this.avg_row,w:this.avg_col,
          h:this.avg_row,content:`item${index}`,isDragging:false}
        temp_layout.push(temp)
      })
    })
    this.layout = temp_layout
  },
  components: {
    GridLayout,
    GridItem,
    WindowSelect
  },
  data() {
    return {
      dicomDirObjects:{}, // 包含文件夹名称以及对应的所有文件 格式： 文件夹名称：files
      dicomBodyObjects:{},  // 包含文件夹名称以及对应的序列描述（身体部位，方向以及厚度）
      bodyDicomObjects:{},  // 是dicomBodyObjects键值对反过来
      tableData:[],  // table的数据 ，格式 {dicoms,num}
      selectedDicomsName:"",
      cursorStyle:"grab",
      url:url,
      previewSrcList:[url],
      index : 0,
      totalHeight:600,
      rows:2,
      columns:4,
      rowHeight:10,
      avg_row:1,
      avg_col:1,
      layout: [
        { i: 0, x: 0, y: 0, w: 4, h: 4, content: 'Item 1' },
      ],
      originalLayout: [],
      fullScreenItem: null
    };
  },
  methods: {
    triggerUpload(){
      this.$refs.fileInput.click()
    },

    handleFolderUpload(event){
      this.tableData = []
      const files = event.target.files
      files.forEach(file=>{
        if(file.name.toLowerCase() === "dicomdir")
        {
          this.parseDICOMDIR(file)
          return
        }
      })
      files.forEach(file=>{
        if(file.name.startsWith("I") && !file.name.endsWith(".dcm"))
        {
          const filePath = file.webkitRelativePath
          const dir_split = filePath.split("/")
          const dir = dir_split[dir_split.length-2]
          if(!this.dicomDirObjects[dir])
          {
            let dicomFiles = []
            dicomFiles.push(file)
            this.dicomDirObjects[dir] = dicomFiles
          }else{
            this.dicomDirObjects[dir] = [...this.dicomDirObjects[dir],file]
          }
        }
      })
      this.updateTable()
      
    },

    uploadDicomFilesChange(file,files){
      console.log(file)
      console.log(files)
    },

    handleRadioChange(dicom_name){
      console.log(dicom_name)
    },

    dragStart(event,dicom_name){
      // 设置拖拽的数据
      event.dataTransfer.setData('text/plain', dicom_name);
    },

    dragEnd(event){
      console.log(event.target);
    }, 

    drop(event,index){
      // 阻止默认行为
      event.preventDefault();

      // 获取拖拽的数据
      const value = event.dataTransfer.getData('text/plain');

      // // 更新目标区域的值
      // targetValue = value;

      console.log('目标区域的值已更新为:', value,index);
    },

    handleDoubleClick(item) {
      if (this.fullScreenItem === item.i) {
        this.layout = this.originalLayout;
        this.fullScreenItem = null;
      } else {
        if (!this.originalLayout.length) {
          this.originalLayout = [...this.layout];
        }
        this.fullScreenItem = item.i;
        this.layout = this.layout.map(it => 
          it.i === item.i ? { ...it, w: this.columns, h: this.rows } : { ...it, w: 0, h: 0 }
        );
      }
    },

    handleLayoutUpdated(newLayout) {
      
      this.layout = newLayout;
    },

    parseDICOMDIR(file) {
      const reader = new FileReader();
      reader.onload = event => {
        const arrayBuffer = event.target.result;
        const dataSet = dcmjs.data.DicomMessage.readFile(arrayBuffer)
        const directoryRecordSequence = dataSet.dict['00041220'].Value;
        this.parseRecords(directoryRecordSequence)
      }
      reader.readAsArrayBuffer(file);
      console.log(this.dicomDirObjects)
      console.log(this.dicomBodyObjects)
      console.log(this.bodyDicomObjects)
    },

    parseRecords(dicomDicts){
      let description
      dicomDicts.forEach(dicomDict=>{
        const recordType = dicomDict['00041430'].Value[0]
        if(recordType === "IMAGE")
        {
          const dir_split = dicomDict['00041500'].Value
          const dir =  dir_split[dir_split.length-2]
          if(dir && description)
          {
            this.dicomBodyObjects[dir] = description
            this.bodyDicomObjects[description] = dir
          }
        }
        if(recordType === "SERIES")
        {
          description = dicomDict['0008103E'].Value[0]; 
        }

        if(dicomDict['00041220'])
        {
          this.parseRecords(dicomDict['00041220'].Value)
        }
      })
    },

    updateTable(){
      // 得到table的数值
      this.tableData = []
      Object.keys(this.dicomDirObjects).forEach(dicomDir=>{
        const files_length = this.dicomDirObjects[dicomDir].length
        const dicoms_name = this.dicomBodyObjects[dicomDir]
        const temp_object = {dicoms_name:dicoms_name,num:files_length}
        this.tableData.push(temp_object)
      })
    },
  }
};
</script>

<style>
.grid-container {
  width: 100%;
  height: 600px; 
  padding: 10px;
  box-sizing: border-box; /* 确保padding不会影响总宽度 */
}

.vue-grid-item {
  border: 1px solid #e7dfdf; /* 默认边框颜色 */
  border-radius: 5px;
  transition: border-color 0.3s ease; /* 添加过渡效果 */
}

.vue-grid-item:hover{
  border: 1px solid #00b1f7;
}

.grid-item-content {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  height: 100%; /* 使内容区填满网格项 */
}

.draggable {
  width: 100px;
  height: 100px;
  background-color: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: cursor 0.3s ease;
}
.cantSelect{
  user-select: none;
  -webkit-user-select: none; /* Webkit 浏览器 */
  -moz-user-select: none; /* Firefox 浏览器 */
  -ms-user-select: none; /* IE10+ 浏览器 */
}

.dicomFilesInputZone{
  border: 1px dashed #efefef ;
  width: 70%;
  height: 200px;
}
</style>
