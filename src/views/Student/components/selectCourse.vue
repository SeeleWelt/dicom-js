<template>
  <h1>选择课程</h1>
  <div class="searchCourse">
    <el-input
      v-model="input"
      style="max-width: 600px"
      placeholder="请输入关键字进行搜索"
      class="input-with-select"
    >
      <template #prepend>
        <el-select v-model="select" placeholder="选择类型" style="width: 115px">
          <el-option label="课程号" value="courseID" />
          <el-option label="课程名" value="courseName" />
          <el-option label="教师号" value="teacherID" />
          <el-option label="教师名" value="teacherName" />
        </el-select>
      </template>
      <template #append>
        <el-button @click="handleSearch" icon="search" />
      </template>
    </el-input>
  </div>
  <br />
  <el-card>
    <el-table :data="courses" style="width: 100%" max-height="600px">
      <el-table-column fixed prop="courseID" label="课程号" width="150" />
      <el-table-column prop="courseName" label="课程名" width="120" />
      <el-table-column prop="teacherID" label="教师号" width="120" />
      <el-table-column prop="teacherName" label="教师名" width="120" />
      <el-table-column prop="credit" label="学分" width="100" />
      <el-table-column prop="time" label="时间" width="150" />
      <el-table-column prop="classroom" label="地点" width="100" />
      <el-table-column prop="introduce" label="介绍" width="200" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" @click="open(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCourses"
    >
    </el-pagination>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '@/utils/axios-config.js'
const select = ref('courseName')
const input = ref('')
const courses = ref([])
const currentPage = ref(1)
const pageSize = ref(5) // 默认每页显示 10 条数据
const totalCourses = ref(0)

const handleSearch = () => {
  fetchData()
}
// 获取所有数据
const fetchData = () => {
  const offset = (currentPage.value - 1) * pageSize.value
  const limit = pageSize.value
  const searchData = {
    keyword: input.value,
    type: select.value,
    offset: offset,
    limit: limit
  }
  axios
    .post('student/searchCourse', searchData)
    .then((response) => {
      console.log('获取的数据', response.data)
      courses.value = response.data.courses
      totalCourses.value = response.data.totalCount
    })
    .catch((error) => {
      console.error('获取课程数据时出错：', error)
    })
}

//挂载数据
onMounted(fetchData)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const open = (row) => {
  ElMessageBox.confirm('你确定要选择该课程吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      console.log('确定')
      console.log(row)
      console.log('课程号' + row.courseID)
      const studentId = localStorage.getItem('id')
      console.log('学生号' + studentId)
      const requestData = { courseID: row.courseID, studentID: studentId }
      axios
        .post('student/selectCourse', requestData)
        .then((response) => {
          console.log(response.data)
        })
        .catch((error) => {
          console.error('选择课程时出错：', error)
        })
      ElMessage({
        type: 'success',
        message: '选择成功'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'warning',
        message: '选择失败'
      })
    })
}
</script>
