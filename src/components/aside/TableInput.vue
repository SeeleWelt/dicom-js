<template>
    <!-- 图像导入区域 -->
    <el-button @click="triggerUpload">
        <el-icon><FolderOpened /></el-icon>
    </el-button>
    <input
        class="dicomFilesInputZone"
        type="file"
        webkitdirectory
        directory
        multiple
        @change="handleFolderUpload"
        ref="fileInput"
        style="display: none;"
    />

    <!-- 导入的table -->
    <div>
      <el-table
        :data="tableData"
        style="width: 200px"
        :show-header="false"
        :empty-text="'未导入数据'"
        @dragover.prevent
      >
        <el-table-column label="dicoms_name" width="130">
          <template #default="scope">
            <el-icon :draggable="true"       
            @dragstart="dragStart($event,scope.row.dicoms_name)"
            @dragend="dragEnd"><Files /></el-icon>
            <el-text class="cantSelect" style="margin-left:10px"
              @dblclick="handleDbclickTable(scope.row.dicoms_name)">
              {{ scope.row.dicoms_name }}
            </el-text>
          </template>
        </el-table-column>
  
        <el-table-column  label="num" width="50">
          <template #default="scope"><el-text class="cantSelect">#{{ scope.row.num }}</el-text></template>
        </el-table-column>
  
      </el-table>
    </div>

  </template>
  
<script>

  import * as dcmjs from 'dcmjs'
  //===========================cornerstone3d============================
  import initCornerstone from '@/cornerstone/helper/initCornerstone';
  import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"
  import {
    imageLoader,
  } from '@cornerstonejs/core';

  export default {
    emits:[
      "handleDbclickTable",
      "handleRadioChange",
      "handleDICOMDIR",
      "handleDICOMDIR2",
      "handleEnd",
    ],
    async mounted(){
      await initCornerstone()
      if(this.$globalData.fileSet)
        this.handleUploadFromServer(this.$globalData.fileSet)
    },

    data() {
      return {
        dicomDirObjects:{}, // 包含文件夹名称以及对应的所有文件 格式： 文件夹名称：files
        dicomBodyObjects:{},  // 包含文件夹名称以及对应的序列描述（身体部位，方向以及厚度）
        bodyDicomObjects:{},  // 是dicomBodyObjects键值对反过来
        dirInstanceNumberObjects:{}, // 包含了文件顺序
        fileImageIdsDirObjects:{}, 
        dirOrientationObjects:{},
        DICOMDIRObejct:{},
        allDirsNum:0,
        tableData:[],  // table的数据 ，格式 {dicoms,num}
        selectedDicomsName:"",
        
      };
    },
    methods: {
      reset(){
        this.dicomDirObjects = {}
        this.dicomBodyObjects={}
        this.bodyDicomObjects={}
        this.dirInstanceNumberObjects={}
        this.fileImageIdsDirObjects={}
        this.dirOrientationObjects={}
        this.DICOMDIRObejct = {}
        this.allDirsNum=0
        this.tableData=[]
        this.selectedDicomsName =""
      },

      // ================================= fileSet处理 =============================
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
       * 
       * @param files - 文件数组，每个文件的类型是Blob
       * @功能 - 获得对应files的filesImageIds，用于渲染
       */
      async handleFilesAndImageIds(files,instanceNumbers,dir){
        // 排序前的ImageIds
        const imageIds = [];
        // 使用已有库的函数获得files对应的fileImageIds
        files.forEach(file => {
          const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
          imageIds.push(imageId);
        });
        // 加载图像信息，这样才可以获得dcm元数据
        await this.prefetchMetadataInformation(imageIds)

        // 获得排序后的数组imageIds
        const fileImageIds= this.mySort(instanceNumbers,imageIds)

        return [dir,fileImageIds]
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

      handleDbclickTable(dicoms_name){
        this.$emit("handleDbclickTable",dicoms_name) 
      },

      handleRadioChange(dicoms_name){
        const files = this.dicomDirObjects[this.bodyDicomObjects[dicoms_name]]
        const fileImageIds = this.fileImageIdsDirObjects[this.bodyDicomObjects[dicoms_name]]
        this.$emit("handleRadioChange",dicoms_name,files,fileImageIds)
      },

      handleDICOMDIR(dir){
        if(!dir)
        {
          this.DICOMDIRObejct={}
          this.dicomDirObjects={}
          this.dicomBodyObjects={}
          this.bodyDicomObjects={}
          this.dirOrientationObjects={}
          this.fileImageIdsDirObjects={}
          return
        }
        this.$emit("handleDICOMDIR",dir,this.dicomDirObjects[dir],
          this.dicomBodyObjects[dir],this.dirOrientationObjects[dir],this.fileImageIdsDirObjects[dir]
        )  
      },

      handleDICOMDIR2(){
        this.$emit("handleDICOMDIR2",this.DICOMDIRObejct,this.bodyDicomObjects)
      },

      handleEnd(){
        this.$emit("handleEnd",true)
      },

      triggerUpload(){
        this.$refs.fileInput.click()
      },
  
      handleFolderUpload(event){
        this.reset()
        const files = event.target.files

        files.forEach(file=>{
          if(file.name.toLowerCase() === "dicomdir")
          {
            console.log("------------------------------------")
            this.DICOMDIRObejct["DICOMDIR"] = file
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

      },

      handleUploadFromServer(files){
        this.reset()

        files.forEach(file=>{
          if(file.name.toLowerCase() === "dicomdir")
          {
            console.log("------------------------------------")
            this.DICOMDIRObejct["DICOMDIR"] = file
            this.parseDICOMDIR(file)
          }else{
            const filePath = file.name
            const file_name = filePath.split("/")[1]
            const dir = filePath.split("/")[0]
            if(file_name.startsWith("I") && !file_name.endsWith(".dcm"))
            {
              if(!this.dicomDirObjects[dir])
              {
                let dicomFiles = []
                dicomFiles.push(file)
                this.dicomDirObjects[dir] = dicomFiles
              }else{
                this.dicomDirObjects[dir] = [...this.dicomDirObjects[dir],file]
              }
            }
          }
        })

        // files.forEach(file=>{
        //   const filePath = file.name
        //   const file_name = filePath.split("/")[1]
        //   const dir = filePath.split("/")[0]
        //   if(file_name.startsWith("I") && !file_name.endsWith(".dcm"))
        //   {
        //     if(!this.dicomDirObjects[dir])
        //     {
        //       let dicomFiles = []
        //       dicomFiles.push(file)
        //       this.dicomDirObjects[dir] = dicomFiles
        //     }else{
        //       this.dicomDirObjects[dir] = [...this.dicomDirObjects[dir],file]
        //     }
        //   }
        // })

      },
  
      dragStart(event,dicoms_name){
        // 设置拖拽的数据
        event.dataTransfer.setData('text/plain', dicoms_name);
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

      parseDICOMDIR(file) {
        const reader = new FileReader();
        reader.onload = event => {
          const arrayBuffer = event.target.result;
          const dataSet = dcmjs.data.DicomMessage.readFile(arrayBuffer)
          const directoryRecordSequence = dataSet.dict['00041220'].Value;
          this.parseRecords(directoryRecordSequence)

          this.handleDICOMDIR2()

          const  dirs = Object.keys(this.dicomBodyObjects)
          this.allDirsNum = dirs.length
          for(let i =0;i<dirs.length;i++)
          {
            const dir = dirs[i]
            const files = this.dicomDirObjects[dir]
            const instanceNumbers = this.dirInstanceNumberObjects[dir]     
            // 获得排序后的文件
            const fileSet = this.mySort(instanceNumbers,files)
            // 更新最新的文件集
            this.dicomDirObjects[dir] = fileSet
            this.handleFilesAndImageIds(files,instanceNumbers,dir)
            .then(res=>{
              const curDir = res[0]
              const fileImageIds = res[1]
              this.fileImageIdsDirObjects[curDir] = fileImageIds
              this.handleDICOMDIR(curDir)
              this.updateTable(curDir)
            })
          }
          
          
        }
        reader.readAsArrayBuffer(file);
      },
  
      /**
       * @功能 - 获取标签数据
       * @param dicomDicts 
       */
      parseRecords(dicomDicts){
        let description
        console.log(dicomDicts)
        dicomDicts.forEach(dicomDict=>{
          const recordType = dicomDict['00041430'].Value[0]
          if(recordType === "PATIENT")
          {
            console.log(dicomDict)
          }
          if(recordType === "IMAGE")
          {
            const dir_split = dicomDict['00041500'].Value
            const dir =  dir_split[dir_split.length-2]
            const instanceNumber = dicomDict['00200013'].Value[0]

            // 序列描述 + 方向
            if(dir && description)
            {
              this.dicomBodyObjects[dir] = description
              this.bodyDicomObjects[description] = dir
              const orientation_group = description.match(/[a-z]{3}/)
              if(orientation_group)
              {
                const orientation_short = orientation_group[0]
                if(orientation_short === "cor")
                  this.dirOrientationObjects[dir] = "CORONAL"
                else if(orientation_short === "sag")
                  this.dirOrientationObjects[dir] = "SAGGITAL"
              }else
                this.dirOrientationObjects[dir] = "AXIAL"
            }

            if(dir && instanceNumber)
            {
              if(!this.dirInstanceNumberObjects[dir])
              {
                let instanceNumbers=[]
                instanceNumbers.push(instanceNumber)
                this.dirInstanceNumberObjects[dir] = instanceNumbers
              }else{
                this.dirInstanceNumberObjects[dir] = [...this.dirInstanceNumberObjects[dir],instanceNumber]
              }
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
  
      updateTable(dicomDir){
        // 得到table的数值
        const files_length = this.dicomDirObjects[dicomDir].length
        const dicoms_name = this.dicomBodyObjects[dicomDir]
        const temp_object = {dicoms_name:dicoms_name,num:files_length}
        this.tableData.push(temp_object)
        // 判断是否所有的数据都上传完毕了
        if(this.tableData.length === this.allDirsNum)
        {
          this.handleEnd()
          this.DICOMDIRObejct={}
          this.dicomDirObjects={}
          this.dicomBodyObjects={}
          this.bodyDicomObjects={}
          this.dirOrientationObjects={}
          this.fileImageIdsDirObjects={}
          this.allDirsNum = 0
        }
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

  </style>
  