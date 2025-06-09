import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({

  baseURL: 'http://localhost:8080/', // 设置基础URL

  //Nodejs提供一个全局变量process

  // baseURL: process.env.VUE_APP_BASE_API,
  timeout: 50000, // 设置请求超时时间
  headers: {
    // 设置公共请求头
    'Content-Type': 'application/json'
  }
})
// 可以在这里添加请求和响应拦截器
export default instance
