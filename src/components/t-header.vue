<template>
  <div class="header-container">
    <!-- 对应数据localStorage内容 -->
    <el-icon style="margin-top: 5px;"><House /></el-icon>
    <span class="class-name">{{ phoneNumber }} </span>
    <img style="width: 25px; height: 25px; line-height: 25px; padding: 5px;" :src="avatar" alt="" />
    <!-- <el-icon><User /></el-icon> -->
    <span class="user-name" style="padding: 5px;">{{ teacherName }}</span>
    <el-icon style="margin-top: 5px;"><Message /></el-icon>
    <span class="user-email" style="padding: 5px;">{{ email }}</span>
    <el-icon style="margin-top: 5px;"><SwitchButton /></el-icon>
    <!-- <el-button style="font-weight: 800;" type="text" class="logout-button" @click="out()">退出</el-button> -->
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
      name:"李白",
      email:"123zhihu.com",
      phoneNumber: 123456,
      avatar: "../../src/assets/user.png",
      currentTerm: "2"
    }
  },
  created() {
    this.teacherName = localStorage.getItem('name')|| this.name;
    this.email = localStorage.getItem('email')|| this.email;
    this.phoneNumber = localStorage.getItem('phone')|| this.number;
    this.avatar = localStorage.getItem('avatar')||this.avatar
  },
  methods: {
    out() {
      localStorage.clear()
      axios.get("http://localhost:8000/teacher/logout/")
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
