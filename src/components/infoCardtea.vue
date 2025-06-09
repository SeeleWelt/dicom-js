<template>
  <el-card class="messagecontent">
    <el-descriptions title="我的信息" :column="3">
      <el-descriptions-item label="工号:">{{ id }}</el-descriptions-item>
      <el-descriptions-item label="姓名:">{{ name }}</el-descriptions-item>
      <el-descriptions-item label="职务:">{{ work }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { ElMessage } from 'element-plus';
import { fetchteacherInfo } from '@/api/api.js';

export default {
  name: 'infoCardtea',
  data() {
    // 从 localStorage 获取数据，如果没有则使用默认值
    return {
      // teacherinfoCard需要id工号、name姓名、work职务
      id: localStorage.getItem('id') || "1008611",
      name: localStorage.getItem('name') || "李白",
      work: localStorage.getItem('work') || "院长",
    };
  },
async mounted() {
    try {
      const response = await fetchteacherInfo();
      if (response.data) {
        this.id = response.data.id;
        this.name = response.data.name;
        this.work = response.data.work;
      } else {
        ElMessage.error('获取信息失败');
      }
    } catch (error) {
      console.error('获取学生信息出错:', error);
      ElMessage.error('获取信息失败，请稍后再试');
    }
  }
};
</script>

<style scoped>
.messagecontent {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}
</style>