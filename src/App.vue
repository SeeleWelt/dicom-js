<script setup>

</script>

<template>
  <main>
    <router-link to="/singleAxisViewport">点击这里查看Stack图像</router-link>
    <router-link to="/volume" style="margin-left:20px">点击这里测试MRP图像</router-link>
    <router-link to="/testVolume" style="margin-left:20px">我的测试</router-link>
    <router-link to="/testMip" style="margin-left:20px">MIP测试</router-link>
    <router-link to="/otherTest" style="margin-left:20px">其他测试</router-link>
    <router-link to="/mainView" style="margin-left:20px">主视图</router-link>
    <router-view></router-view>
  </main>
</template>

 <style>
 #app {
   font-family: Avenir, Helvetica, Arial, sans-serif;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   color: #2c3e50;
 }
 * {
  outline: none;
  margin:0;
  padding:0;
}

 </style>
 