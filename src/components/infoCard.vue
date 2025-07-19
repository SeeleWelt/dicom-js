<template>
  <el-card class="messagecontent">
    <el-descriptions title="我的信息" :column="4">
      <el-descriptions-item label="学号:">{{ id }}</el-descriptions-item>
      <el-descriptions-item label="姓名:">{{ name }}</el-descriptions-item>
      <el-descriptions-item label="班级:">{{ classnum }} </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
// import { ElMessage } from 'element-plus';
// import { fetchStudentInfo } from '@/api/api.js';

export default {
  name: 'infoCard',
  data() {
    // 从 localStorage 获取数据，如果没有则使用默认值(后面绑定数据后删除默认值)
    return {
      // infoCard需要id学号、name姓名、major专业、classnum班级
      id: localStorage.getItem('id') || "2022101932",
      name: localStorage.getItem('name') || "张三",
      classnum: localStorage.getItem('class') ||"还未加入班级"
    };
  },
  async mounted() {
    // try {
    //   const response = await fetchStudentInfo();
    //   if (response.data) {
    //     this.id = response.data.id;
    //     this.name = response.data.name;
    //     this.major = response.data.major;
    //     this.classnum = response.data.classnum;
    //   } else {
    //     ElMessage.error('获取信息失败');
    //   }
    // } catch (error) {
    //   console.error('获取学生信息出错:', error);
    //   ElMessage.error('获取信息失败，请稍后再试');
    // }
  }
};
</script>

<style scoped>
.messagecontent {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}
</style>