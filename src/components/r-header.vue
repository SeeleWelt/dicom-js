<template>
  <div class="header-container">
    <!-- 主页图标 -->
    <el-icon style="margin-top: 5px;"><House /></el-icon>
    <!-- localStorage数据库的专业major -->
    <span class="user-major">{{ major }}  </span>
    <!-- localStorage数据库的班级名classnum -->
    <span class="user-classnum">{{ classnum }} 班 </span>
    <!-- 用户图标 -->
    <img style="width: 25px; height: 25px; line-height: 25px; padding: 5px;" :src="imageUrl"/>
    <!-- localStorage数据库的姓名name -->
    <span class="user-name" style="padding: 5px;">{{ name }}</span>
    <!-- 信封图标 -->
    <el-icon style="margin-top: 5px;"><Message /></el-icon>
    <!-- localStorage数据库的邮箱email -->
    <span class="user-email" style="padding: 5px;">{{ email }}</span>
    <!-- 退出图标 -->
    <el-icon style="margin-top: 5px;"><SwitchButton /></el-icon>
    <!-- 退出确认提示框 -->
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
export default {
  name: 'r-header',
  data() {
    return {
      // name姓名、major专业、classnum班级、email邮箱
      name: '张三', 
      major: '软件工程', 
      classnum: '1',
      email: 'zhangsan@example.com', 
      imageUrl: 'src/assets/user.png'
    };
  },
  created() {
    // 从 localStorage 获取数据，如果没有则使用默认值
    this.name = localStorage.getItem('name') || this.name;
    this.className = localStorage.getItem('className') || this.className;
    this.email = localStorage.getItem('email') || this.email;
  },
  methods: {
    out() {
      localStorage.clear()
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
