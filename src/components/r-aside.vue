<template>
  <div>
    <el-aside
      width="200px"
      style="background-color: #0F6A7B; height: 700px; border: 1px solid #eee"
    >
      <el-scrollbar>
        <!-- <el-menu :default-openeds="['1', '3']" style="background-color: #304057"> -->
        <el-menu style="background-color: #0F6A7B">
          <el-sub-menu index="1">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">主页</span>
            </template>
            <router-link to="/studentHome">
              <el-menu-item index="1-1">个人信息</el-menu-item>
            </router-link>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">DICOM查看</span>
            </template>
            <router-link to="/studentView">
              <el-menu-item index="2-1">三维渲染</el-menu-item>
            </router-link>
            <router-link to="/studentViewcut">
              <el-menu-item index="2-2">切片标注</el-menu-item>
            </router-link>
            <router-link to="/studentViewelse">
              <el-menu-item index="2-3">其他</el-menu-item>
            </router-link>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">病例库</span>
            </template>
            <RouterLink to="/studySession">
              <el-menu-item index="3-1">病例库</el-menu-item>
            </RouterLink>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">个人设置</span>
            </template>
            <router-link to="/updateStudentInfo">
              <el-menu-item index="4-1">信息修改</el-menu-item>
            </router-link>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
  </div>
</template>

<script setup></script>

<style scoped>
.el-menu-item {
  background-color: #075A64 !important;
  color: #ffffff !important;
}
</style>
