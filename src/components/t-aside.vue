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

            <RouterLink to="/teacherHome">
              <el-menu-item index="1-1">个人信息</el-menu-item>
            </RouterLink>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">课程管理</span>
            </template>

            <!-- <RouterLink to="/teacherCourse">
              <el-menu-item index="2-1">任务布置</el-menu-item>
            </RouterLink> -->

            <RouterLink to="/teacherAssignment">
              <el-menu-item index="2-1">任务/病例库测试</el-menu-item>
            </RouterLink>
          </el-sub-menu>

          <el-sub-menu index="3">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">学生管理</span>
            </template>

            <RouterLink to="/inquirecomplete">
              <el-menu-item index="3-1">查询完成情况</el-menu-item>
            </RouterLink>
          </el-sub-menu>

          <el-sub-menu index="4">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">DICOM查看</span>
            </template>
            <router-link to="/teacherView">
              <el-menu-item index="4-1">三维渲染</el-menu-item>
            </router-link>
              <router-link to="/teacherViewcut">
              <el-menu-item index="4-2">切片标注</el-menu-item>
            </router-link>
              <router-link to="/teacherViewelse">
              <el-menu-item index="4-3">其他</el-menu-item>
            </router-link>
          </el-sub-menu>

          <el-sub-menu index="5">
            <template #title>
              <el-icon style="color: #ffffff"><Menu /></el-icon
              ><span style="color: #ffffff">个人设置</span>
            </template>
            <router-link to="/updateTeacherInfo">
              <el-menu-item index="5-1">信息修改</el-menu-item>
            </router-link>

          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
  </div>
</template>

<script setup></script>

<style scoped>
/* 给二级选项框添加背景色和白色字体 */
.el-menu-item {
  background-color: #075A64 !important;
  color: #ffffff !important;
}
</style>
