<template>
  <div class="container">
    <div class="main-content">
      <!-- Header Section -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" style="height: 50px;width: 150px;" alt="Logo" />
        </div>
      </div>

      <!-- Content Section -->
      <div class="content">
        <h2>test3</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* 添加样式以适配组件 */
.container {
  padding: 20px;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logo img {
  height: 50px;
}
</style>