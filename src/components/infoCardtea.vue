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

export default {
  name: 'infoCardtea',
  data() {
    // 从 localStorage 获取数据，如果没有则使用默认值
    return {
      // teacherinfoCard需要id工号、name姓名、work职务
      id: localStorage.getItem('id') || "1008611",
      name: localStorage.getItem('name') || "李白",
      work: localStorage.getItem('title') || "院长",
    };
  },
async mounted() {
    
  }
};
</script>

<style scoped>
.messagecontent {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}
</style>