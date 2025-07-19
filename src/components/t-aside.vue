<template>
  <el-aside class="teacher-aside" :width="isCollapse ? '64px' : '200px'">
    <el-scrollbar>
      <el-menu
        :collapse="isCollapse"
        :default-active="activeMenu"
        class="teacher-menu"
        @select="handleSelect"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><HomeFilled /></el-icon>
            <span>主页</span>
          </template>
          <el-menu-item index="/teacherHome">个人信息</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/teacherAssignment">任务/病例库测试</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><User /></el-icon>
            <span>学生管理</span>
          </template>
          <el-menu-item index="/inquirecomplete">查询学习情况</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><Picture/></el-icon>
            <span>DICOM查看</span>
          </template>
          <el-menu-item index="/teacherView">三维渲染</el-menu-item>
          <el-menu-item index="/teacherViewcut">切片标注</el-menu-item>
          <el-menu-item index="/teacherViewelse">其他功能</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>个人设置</span>
          </template>
          <el-menu-item index="/updateTeacherInfo">信息修改</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>

    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon>
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
  </el-aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeFilled,
  Document,
  User,
  Picture,
  Setting,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const isCollapse = ref(false);

const activeMenu = computed(() => route.path);

const handleSelect = (index) => {
  router.push(index);
};

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped>
.teacher-aside {
  background-color: #0F6A7B;
  height: 100vh;
  position: relative;
  transition: width 0.3s;
}

.teacher-menu {
  border-right: none;
  background-color: transparent;
}

.teacher-menu :deep(.el-menu-item) {
  background-color: #075A64 !important;
  color: #ffffff !important;
  &:hover {
    background-color: #064951 !important;
  }
  &.is-active {
    background-color: #053942 !important;
  }
}

.teacher-menu :deep(.el-sub-menu__title) {
  color: #ffffff !important;
  &:hover {
    background-color: #064951 !important;
  }
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #075A64;
  border-radius: 4px;
  cursor: pointer;
  color: #ffffff;
  &:hover {
    background-color: #064951;
  }
}

.el-icon {
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  height: 24px;
}
</style>
