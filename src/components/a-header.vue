<template>
  <div class="header-container">
    <el-icon><House /></el-icon>
    <span class="class-name">admin </span>

    <el-icon><SwitchButton /></el-icon>
    <el-popconfirm
      confirmButtonText="好的"
      cancelButtonText="取消"
      icon="el-icon-info"
      icon-color="red"
      title="确定退出吗？"
      @confirm="out"
    >
      <template #reference>
        <el-button type="text" class="logout-button" @click="showPopconfirm">
          退出
        </el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script>
import axios from 'axios'
axios.defaults.withCredentials = true; // 允许跨域携带 cookie 信息，必须加上
export default {
  name: 'r-header',
  data() {
    return {
      name: null,
      currentTerm: null
    }
  },
  methods: {
    out() {
      localStorage.clear()
      axios.get("http://localhost:8000/admin/logout/")
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.class-name,
.user-name,
.user-email {
  font-size: 18px;
  color: #333333;
}

.logout-button {
  color: #333333;
  font-size: 18px;
}
</style>
