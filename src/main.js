import { createApp,ref } from "vue";
import App from "./App.vue";
import router from "./router";//引入

// 导入elementPlus插件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as echarts from 'echarts'
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

app.config.globalProperties.$echarts = echarts
app.use(router);//注册插件
app.use(ElementPlus)

// 定义一个响应式数据
const globalData = ref({
    fileSet:null,
    annotations:null,
})
// 将响应式数据挂载到全局
app.config.globalProperties.$globalData = globalData

app.mount("#app");
