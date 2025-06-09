<template>
    <div class="dicom-server-collapse" 
    v-loading="loading"
    element-loading-text="Loading...">
        <div class="notPagination">
            <!-- 头部标题部分 -->
            <div class="titleItems">
                <div v-for="(title,index) in titles"
                :key="index"
                style="width:16%;"
                >
                    <div class="titleItem" v-if="index!==2">
                        <el-text>{{ title }}</el-text>
                        <el-input
                            v-model="searchInput[index]"
                            style="width: 130px;height:100%;"
                            clearable
                            @input="handleTitleSearch"
                            >
                        </el-input>
                    </div>

                    <div class="titleItem" v-else>
                        <el-text>{{ title }}</el-text>
                        <div class="titleDate">
                            <el-date-picker
                                v-model="searchInput[index]"
                                type="datetimerange"
                                start-placeholder="Start date"
                                end-placeholder="End date"
                                format="YYYY-MM-DD HH:mm:ss"
                                date-format="YYYY/MM/DD ddd"
                                time-format="A hh:mm:ss"
                                style="width:100%"
                                @change = '(value)=>handleSearchDateTimeChange(value,index)'
                            />
                        </div>
                    </div>
                </div>
            </div>
            <!-- 手风琴部分 -->
            <el-collapse  accordion>

                <!-- 帮助信息，单独列出来 -->
                <el-collapse-item title="Consistency" name="0">
                    <template #title>
                        <div class="infoItems">
                            <div class="inforItem">
                                帮助
                            </div>
                        </div>
                    </template>
                    <div>
                    这是帮助
                    </div>
                </el-collapse-item>
                <!-- 第一个患者 -->
                <el-collapse-item  v-for="info,index in infos" :key="index" :name="info.name" >
                    <!-- DICOM文件的信息 -->
                    <template #title>
                        <div class="infoItems">
                            <!-- 每个信息 -->
                            <div class="infoItem" v-for="(infoText,index1) in Object.values(info)"
                            :key="index1"
                            >
                                {{ infoText }}
                            </div>
                        </div>
                    </template>
                    <!-- viewers -->
                    <el-row class="viewers"
                    :gutter = "8"
                    >
                        <el-col
                        :span="12">
                            <el-row :gutter="4">
                                <el-col :span="6">
                                    <el-button @click="handleDicomFromServer(info.name,index)" type="primary"
                                    :disabled="!viewerButtonDisableds[index]">
                                        基础查看器
                                    </el-button>
                                </el-col>
                                <el-col :span="6">
                                    <el-button @click="handleUploadApplicationFileDialog(info.name)" type="success"
                                    v-if="identity==='teacher'">
                                        上传申请单
                                    </el-button>
                                </el-col>
                                <el-col :span="6">
                                    <el-button @click="handleViewApplicationFileDialog(info.name)" type="success"
                                    >
                                        查看申请单
                                    </el-button>
                                </el-col>
                                <el-col :span="6" v-if="identity==='teacher'">
                                    <el-button @click="deleteSpecificDir(info.name)" type="danger">
                                        删除本文件
                                    </el-button>
                                </el-col>
                            </el-row>
                            
                        </el-col>
                        <!-- 选择标注文件 -->
                        <el-col
                        :span="12"
                        >
                            <el-row align="middle" :gutter="2">
                                <el-col :span="4">
                                    <el-text
                                    type="primary">
                                        选择标注文件
                                    </el-text>
                                </el-col>
                                <el-col :span="12">
                                    <el-select
                                        v-model="annotationValues[index]"
                                        placeholder="选择标注"
                                        style="width: 240px"
                                        @change="(value)=>handleAnnotationValue(value,index)"
                                        >
                                        <el-option
                                            v-for="annotationInfo in annotationInfos"
                                            v-show="annotationInfo.folderName_id === dicomInfos[index].id"
                                            :key="annotationInfo.annotation_name"
                                            :value="annotationInfo.annotation_name"
                                        />
                                    </el-select>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                        
                        
                    <!-- 描述 -->
                    <h3>描述</h3>
                    <el-row class="description"
                    :gutter = "8">
                        <el-col
                        :span="12">
                            <el-text>
                                {{ dicomInfos[index].description }}
                            </el-text>
                            
                        </el-col>
                        <el-col
                        :span="12">
                            <el-text>
                                {{ annotaioDescriptions[index] }}
                            </el-text>
                            
                        </el-col>
                    </el-row>
                </el-collapse-item>
            </el-collapse>

            <!-- 上传文件的对话框 -->
            <el-dialog 
            v-model="uploadApplicationDialogVisible"
            title="申请表上传"
            >
                <el-upload
                v-loading.fullscreen.lock="uploadApplicationDialogLoding" 
                element-loading-text="正在上传..."
                ref="uploadApplicationFile"
                multiple
                drag
                action="http://localhost:8000/uploadApplicationFile"
                :auto-upload="false"
                :on-change="uploadApplicationFileChange"
                :on-remove="uploadApplicationFileRemove"
                >
                <i class="el-icon-upload"></i>
                <el-text type="success">将文件拖到此处，或<el-text type="danger">点击上传</el-text></el-text>
                </el-upload>

                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="uploadApplicationDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleUploadApplicationFile">
                        上传
                        </el-button>
                    </div>
                </template>
            </el-dialog>

             <!-- 查看的对话框 -->
            <el-dialog
            v-model="viewerApplicationDialogVisible"
            title="文件列表"
            width="50%"
            empty-text="没有数据"
            >
                <el-table :data="viewerFileList" style="width: 100%">
                    <el-table-column prop="file_name" label="文件名称"></el-table-column>
                    <el-table-column label="操作">
                    <template #default="scope">
                        <el-button
                        type="success"
                        :link="true"
                        @click="previewApplicationFile(scope.row.file_name)"
                        >
                        预览
                        </el-button>
                        <el-button
                        type="success"
                        :link="true"
                        @click="downloadApplicationFile(scope.row.file_name)"
                        >
                        下载
                        </el-button>
                        <el-button
                        type="danger"
                        :link="true"
                        @click="deleteApplicationFile(scope.row.file_name)"
                        v-if="identity==='teacher'"
                        >
                        删除
                        </el-button>
                    </template>
                    </el-table-column>
                </el-table>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="viewerApplicationDialogVisible = false">确定</el-button>
                    </div>
                </template>
            </el-dialog>

            <el-dialog
            width="80%"
            v-model="showHTMLDialogVisible"
            >
                <div ref="showHTML"></div>
                <el-empty description="无法预览该文件" v-if="applicationFileEmpty"/>
                <div class="pdf-preview">
                    <el-button @click="prePdfPage" :disabled="pdfCurPage===1">上一页</el-button>
                    <el-button @click="nextPdfPage" :disabled="pdfCurPage===pdfTotolPages">下一页</el-button>
                    <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" :page="pdfCurPage" 
                    @loaded="onPdfLoaded"/>
                </div>
            </el-dialog>
            
            <!-- 图片预览 -->
            <el-image-viewer
                v-if="showPreviewImage"
                :url-list="[this.imageUrl]"
                show-progress
                :initial-index="0"
                @close="showPreviewImage=false"
                >
            
            </el-image-viewer>

        </div>
        
        <!-- 分页组件 -->
        <div class="pagination">
            <el-pagination
            background 
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="totalSearch"
            >
            </el-pagination>
        </div>
        
     </div>
     
    
</template>

<script>
import * as dcmjs from 'dcmjs'
import axios from 'axios'
import JSZip from 'jszip';
import { ElMessage } from 'element-plus';
import mammoth from 'mammoth';
import VuePdfEmbed from 'vue-pdf-embed';
axios.defaults.withCredentials = true  //允许跨域携带cookie信息，必须加上
export default{
    name:"DicomFromServer",
    components:{
        VuePdfEmbed,
    },
    data(){
        return{
            // 表单的部分
            uploadApplicationDialogVisible:false,
            applicationFileList:[],
            uploadApplicationDialogLoding:false,
            dicom_name : "",  // 当前的dicom文件名称

            viewerApplicationDialogVisible:false,
            viewerFileList:[],
            viewerApplicationDialogLoading:false,

            showHTMLDialogVisible:false,
            applicationFileEmpty:false,
            pdfUrl:"",
            pdfTotolPages:1,
            pdfCurPage:1,


            loading:false,
            
            // 数据库input框对应的数据存储变量（包含事件）
            searchInput:["","","","","",""],
            // // 时间变量
            // dateTime:"",

            // 患者姓名，病例号，检查日期，描述，成像设备，图像数量
            titles:['文件名称','病例号','检查日期','成像设备','图像数量','描述'],
            infos:[],

            dicomInfos:[],
            annotationInfos:[],

            annotationValues:[],
            annotaioDescriptions:[],
            viewerButtonDisableds:[],

            isAllEmpty:true,
            totalSearch:0,
            currentPage:1,
            pageSize:1,

            // 身份信息
            identity:"",

            // 图像url
            imageUrl:"",
            showPreviewImage:false,
        }
    },
    async mounted(){
        await this.identityFunction()
        await this.fetchData()
        await this.handleTitleSearch()
    },
    methods:{
        // 关于PDF处理的
        prePdfPage()
        {
            this.pdfCurPage -= 1
        },
        nextPdfPage()
        {
            this.pdfCurPage += 1
        },

        onPdfLoaded(pdf){
            this.pdfTotolPages = pdf.numPages // 获取最大的页数
        },

        fileData2File(file_data,file_name)
        {
            const temp_blob = new Blob([file_data])
            const file = new File([temp_blob],file_name)
            return file
        },

        deleteApplicationFile(file_name)
        {
            axios.get("http://localhost:8000/applicationFile/delete/",{
                params:{
                    file_name:file_name
                },
            }).then(response=>{
                this.handleGetApplicationFileList(this.dicom_name)
                if(response.data.state==="success")
                    ElMessage.success(response.data.msg)
                else if(response.data.state==="error")
                    ElMessage.error(response.data.msg)
            })
        },

        previewApplicationFile(file_name){
            this.showHTMLDialogVisible=true
            this.applicationFileEmpty = false
            this.pdfUrl = ""
            this.$nextTick(() => {
                this.$refs.showHTML.innerHTML = ""
            });
            axios.get("http://localhost:8000/applicationFile/getData/",{
                params:{
                    file_name:file_name
                },
                responseType: 'arraybuffer' // 必须是arraybuffer
            }).then(async (response)=>{
                if(file_name.endsWith(".docx"))
                {
                    mammoth.convertToHtml({ arrayBuffer: response.data })
                    .then(result => {
                        const html = result.value; // 转换后的 HTML 内容
                        this.$refs.showHTML.innerHTML = html
                    })
                    .catch(error => {
                        console.error('Error converting DOCX to HTML:', error);
                    });
                }else if(file_name.endsWith(".pdf")){
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    this.pdfUrl = URL.createObjectURL(blob); // 创建 ObjectURL
                    
                }else if(file_name.endsWith(".jpg"))
                {
                    this.showHTMLDialogVisible=false
                    const blob = new Blob([response.data], { type: 'image/jpeg' });
                    this.imageUrl = URL.createObjectURL(blob)
                    this.showPreviewImage=true
                }else if(file_name.endsWith(".png"))
                {
                    this.showHTMLDialogVisible=false
                    const blob = new Blob([response.data], { type: 'image/png' });
                    this.imageUrl = URL.createObjectURL(blob)
                    this.showPreviewImage=true
                }
                else{
                    this.applicationFileEmpty = true
                }
            })
        },

        downloadApplicationFile(file_name){
            axios.get("http://localhost:8000/applicationFile/getData/",{
                params:{
                    file_name:file_name
                },
                responseType: 'blob' // 告诉 axios 期望返回的是二进制数据
            }).then(response=>{
                const file_data = response.data
                const file = this.fileData2File(file_data,file_name)
                const file_url = URL.createObjectURL(file)
                const a = document.createElement('a')
                a.href = file_url
                a.download = file_name
                a.click(); 
                a.remove()
                URL.revokeObjectURL(file_url)
                console.log(file_url)
            })
        },

        handleUploadApplicationFileDialog(dicom_name){
            this.uploadApplicationDialogVisible = true
            this.dicom_name = dicom_name
        },

        handleViewApplicationFileDialog(dicom_name){
            this.handleGetApplicationFileList(dicom_name)
            this.viewerApplicationDialogVisible=true
            this.dicom_name = dicom_name
        },

        handleGetApplicationFileList(dicom_name){
            try{
                axios.get("http://localhost:8000/applicationFile/",{
                    params:{
                        dicom_name:dicom_name,
                    }
                }).then(response=>{
                    const data = response.data
                    if(data.state==="success")
                    {
                        this.viewerFileList = data.application_files_name
                    }
                })
            }catch(err){
                ElMessage.error(`发生错误,${err}`)
            }
        },

        async handleUploadApplicationFile(){
            if(this.applicationFileList.length ===0)
            {
                ElMessage.error("还未上传任何文件!")
                return
            }
            this.uploadApplicationDialogLoding = true
            const response = await axios.get('http://localhost:8000/get_csrf_token/')
            this.csrfToken = response.data.token
            const formData = new FormData()
            this.applicationFileList.forEach(applicationFile=>{
                // application.raw才是真正的FILE对象
                formData.append("files[]",applicationFile.raw)
            })
            formData.append("dicom_name",this.dicom_name)
            axios.post("http://localhost:8000/uploadApplicationFile/",formData,{
                headers: {
                    "Content-Type": "multipart/form-data", // 正确的 Content-Type
                    "X-CSRFToken": this.csrfToken, // 添加 CSRF 令牌
                },
            }).then(response=>{
                const data = response.data
                if(data.state==="success"){
                    ElMessage.success("文件上传成功")  
                }else if(data.state === "error")
                {
                    ElMessage.error(data.msg)
                }
                this.$refs.uploadApplicationFile.clearFiles()
                this.uploadApplicationDialogLoding = false
                this.uploadApplicationDialogVisible=false
            }).catch(error=>{
                ElMessage.error(`文件上传失败，${error}`)
                this.uploadApplicationDialogLoding = false
            })
        }, 

        uploadApplicationFileChange(uploadFile,uploadFiles){
            ElMessage.success("成功添加文件："+uploadFile.name)
            this.applicationFileList = uploadFiles
        },

        uploadApplicationFileRemove(uploadFile,uploadFiles){
            ElMessage.success("成功移除文件："+uploadFile.name)
            this.applicationFileList = uploadFiles
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

        async handleCurrentChange(newPage) {
            this.currentPage = newPage; // 更新当前页码
            await this.fetchData()
            await this.handleTitleSearch()
        },

        async fetchData() {
            // 发起请求到后端，携带分页参数
            await axios.get('http://localhost:8000/searchDicom/page', {
            params: {
                page: this.currentPage, // 当前页码
                size: this.pageSize // 每页显示数量
            }
            })
        },

        async handleTitleSearch()
        {
            const data = this.searchInput
            const response = await axios.get('http://localhost:8000/get_csrf_token/')
            this.csrfToken = response.data.token
            axios.post("http://localhost:8000/searchDicom/",data,{
                headers:{
                'Content-Type':"application/json",
                'X-CSRFToken': this.csrfToken,
                }
            })
            .then(response=>{
                const data = response.data
                // 更新DICOM信息
                this.dicomInfos = data.dicomInfos
                this.annotationInfos = data.annotationInfos
                let temp_arr = []
                for(let i =0;i<this.dicomInfos.length;i++)
                {
                    const info = {}
                    info.name = this.dicomInfos[i].folderName
                    temp_arr[i] = info
                }
                this.infos = temp_arr
                this.totalSearch = data.total
            })
        },

        handleSearchDateTimeChange(value,index){
            console.log(value,index)
        },

        async handleDicomFromServer(folderName,index){
            // 这里是为了提醒已经开始导入了。
            this.loading=true
            await this.downloadDicomsToWebFromServer(folderName,index);
            const annotation_name = this.annotationValues[index]
            await this.downloadAnnotationToWebFromServer(annotation_name);
            this.loading=false
        }, 

        //========================== 以下是于从服务器导入的 ==========================================
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
         * @功能 - 从服务器导入DICOM文件
         * @param folderId - 对应的DICOM文件夹的ID号
         */
        async downloadDicomsToWebFromServer(folderName){
          /*  从指定文件夹中导入文件，并且获得的最开始是zip文件，然后解压zip文件获得所有dcm文件
              之后将所有dcm文件处理后存储到this.fileSet和this.imageIds中
          */
          const response1 = await axios.get(`http://localhost:8000/getDicomFiles/`,{
            params:{
                dicom_name:folderName,
            },
            responseType: 'arraybuffer',
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
            const file = new File([fileData], filename, {
                type: fileData.type,
                lastModified: Date.now(),
              });
            return file
          });

          // 获取所有的文件
          const files = await Promise.all(filePromises);
          console.log(files)
          this.$globalData.fileSet = files;
          
        },

        async downloadAnnotationToWebFromServer(annotation_name)
        {
          const response1 = await axios.get(`http://localhost:8000/getAnnotationFile/`,{
            responseType: 'arraybuffer',
            params:{
                annotation_name:annotation_name
            }
          })
          const arrayBuffer = response1.data
          const textDecoder = new TextDecoder('utf-8');
          const jsonString = textDecoder.decode(arrayBuffer);
          const jsonData = JSON.parse(jsonString);
          this.$globalData.annotations = jsonData
            // 跳转到viewer
          this.$router.push("/mainView")
        },

        async deleteSpecificDir(folderName)
        {
            const response = await axios.get('http://localhost:8000/get_csrf_token/')
            this.csrfToken = response.data.token
            const response1 = await axios.post("http://localhost:8000/deleteSpecificDir/",folderName,{
                headers:{
                'Content-Type':"application/plain",
                'X-CSRFToken': this.csrfToken,
                }
            })
            ElMessage({
                message:response1.data.msg,
                type:response1.status === 200 ? 'success' : 'warning'
            })

            // 重新渲染一遍
            await this.handleTitleSearch()
        },

        //===================================== 服务器部分结束 =============================================================

        
        handleAnnotationValue(value,index){
            if(!this.viewerButtonDisableds[index])
                this.viewerButtonDisableds[index] = true
            const annotationInfo = this.annotationInfos.filter(annotationInfo=>
            annotationInfo.annotation_name === value)[0]
            this.annotaioDescriptions[index]=annotationInfo.description
        },

        
    },
}
</script>
<style>
/* 最外层的样式 */
.dicom-server-collapse{
    position: relative;
    left:10%;
    width: 80%;
    border-radius: 15px;
    padding:20px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5); /* 水平偏移、垂直偏移、模糊半径、颜色 */
}

/* 标题样式 */
.titleItems{
    margin:10px;
}
.titleItem{
    width:100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center
}
.titleItems,
/* 信息样式 */
.infoItems{
    width: 100%;
    display: flex;
    gap:20px;
}
.infoItem{
    width:15%;
    text-align: center;
}

/* Search中时间两个input的样式
 */
.titleDate{
    display: flex;
    justify-content: space-around;
}
.pagination{
    margin-top:10px;
}
</style>