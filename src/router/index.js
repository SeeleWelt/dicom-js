import { createRouter, createWebHistory } from 'vue-router'
import selectView from '@/views/login/selectView.vue'
import loginView from '../views/login/loginView.vue'
import registerView from '@/views/login/registerView.vue'
import studentIndex from '@/views/Student/indexView.vue'
import studentHome from '@/views/Student/homeView.vue'
import updateStudentInfo from '@/views/Student/components/updateInfo.vue'
import studentView from '@/views/Student/components/studentView.vue'
import studentViewcut from '@/views/Student/components/studentViewcut.vue'
import studentViewelse from '@/views/Student/components/studentViewelse.vue'
import studySession from '@/views/Student/components/studySession.vue'
import teacherLogin from '@/views/login/teacherLogin.vue'
import teacherHome from '@/views/Teacher/teacherHome.vue'
import teacherView from '@/views/Teacher/components/teacherView.vue'
import teacherViewcut from '@/views/Teacher/components/teacherViewcut.vue'
import teacherViewelse from '@/views/Teacher/components/teacherViewelse.vue'
import teacherIndex from '@/views/Teacher/teacherIndex.vue'
import updateTeacherInfo from '@/views/Teacher/components/updateTeacherInfo.vue'
import teacherAssignment from '@/views/Teacher/components/teacherAssignment.vue'
import inquirecomplete from '@/views/Teacher/components/inquireComplete.vue'
import adminLogin from '@/views/login/adminLogin.vue'
import adminIndex from '@/views/Admin/adminIndex.vue'
import adminHome from '@/views/Admin/adminHome.vue'
import inquireStudent from '@/views/Admin/components/inquireStudent.vue'
import inquireTeacher from '@/views/Admin/components/inquireTeacher.vue'
import scheduleView from '@/views/Admin/components/scheduleView.vue'
import scheduleChange from '@/views/Admin/components/scheduleChange.vue'
import SingleAxisViewport from '@/components/SingleAxisViewport/SingleAxisViewport.vue'
import DicomVolumeAD from '@/components/other/DicomVolumeAD.vue'
import DicomVolume from '@/components/other/DicomVolume.vue'
import TestMip from '@/components/other/TestMip.vue'
import OtherTest from '@/components/other/OtherTest.vue'
import DicomsFromServer from '@/components/SingleAxisViewport/DicomsFromServer.vue'
import MainView from '@/components/MainView.vue'

const routes = [
    {
      path: '/',
      name: 'selectView',
    component: selectView,
    meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
    component: loginView,
    meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
    component: registerView,
    meta: { requiresAuth: false }
    },
    {
      path: '/studentIndex',
      name: 'studentIndex',
      component: studentIndex,
      children: [
        {
          path: '/studentHome',
          name: 'studentHome',
        component: studentHome,
        },
        {
          path: '/updateStudentInfo',
          name: 'updateStudentInfo',
        component: updateStudentInfo,
        },
        {
          path: '/studentView',
          name: 'studentView',
        component: studentView,
        },
        {
          path: '/studentViewcut',
          name: 'studentViewcut',
        component: studentViewcut,
        },
        {
          path: '/studentViewelse',
          name: 'studentViewelse',
        component: studentViewelse,
        },
        {
          path: '/studySession',
          name: 'studySession',
        component: studySession,
      }
    ]
  },
    {
      path: '/teacherLogin',
      name: 'teacherLogin',
    component: teacherLogin,
    meta: { requiresAuth: false }
    },
    {
      path: '/teacherIndex',
      name: 'teacherIndex',
      component: teacherIndex,
      children: [
        {
          path: '/teacherHome',
          name: 'teacherHome',
        component: teacherHome,

        },
        {
          path: '/updateTeacherInfo',
          name: 'updateTeacherInfo',
        component: updateTeacherInfo,

        },
        {
          path: '/teacherViewcut',
          name: 'teacherViewcut',
        component: teacherViewcut,

        },
        {
          path: '/inquireComplete',
          name: 'inquireComplete',
        component: inquirecomplete,

        },
        {
          path: '/teacherViewelse',
          name: 'teacherViewelse',
        component: teacherViewelse,

        },
        {
          path: '/teacherView',
          name: 'teacherView',
        component: teacherView,

        },
        {
          path: '/teacherAssignment',
          name: 'teacherAssignment',
        component: teacherAssignment,

        }
      ]
    },
    {
      path: '/adminLogin',
      name: 'adminLogin',
    component: adminLogin,
    meta: { requiresAuth: false }
    },
    {
      path: '/adminIndex',
      name: 'adminIndex',
      component: adminIndex,

      children: [
        {
          path: '/adminHome',
          name: 'adminHome',
        component: adminHome,
  
        },
        {
          path: '/inquireStudent',
          name: 'inquireStudent',
        component: inquireStudent,

        },
        {
          path: '/inquireTeacher',
          name: 'inquireTeacher',
        component: inquireTeacher,

        },
        {
          path: '/scheduleView',
          name: 'scheduleView',
        component: scheduleView,

        },
        {
          path: '/scheduleChange',
          name: 'scheduleChange',
        component: scheduleChange,

        },
      ]
    },
    {
        path:'/singleAxisViewport',
        component:SingleAxisViewport,
    },
    {
        path:'/volume',
        component:DicomVolumeAD,
    },
    {
        path:"/testVolume",
        component:DicomVolume,
    },
    {
        path:"/testMip",
        component:TestMip,
    },
    {
        path:"/otherTest",
        component:OtherTest,
    },
    {
        path:"/dicomsFromServer",
        component:DicomsFromServer,
    },
    {
        path:"/mainView",
        component:MainView,
    }
  ]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// // 路由守卫
// router.beforeEach((to, from, next) => {
//   // // 开发环境下跳过验证（方便可视化调试）
//   // const isDevelopment = import.meta.env.MODE === 'development';
//   // if (isDevelopment) {
//   //   // 根据访问的路由自动设置对应角色权限
//   //   if (to.path.includes('/student')) {
//   //     localStorage.setItem('token', 'test-token');
//   //     localStorage.setItem('userRole', 'student');
//   //     localStorage.setItem('name', 'xyin');
//   //     localStorage.setItem('email', 'xyin');
//   //   } else if (to.path.includes('/teacher')) {
//   //     localStorage.setItem('token', 'teacher-token');
//   //     localStorage.setItem('userRole', 'teacher');
//   //     localStorage.setItem('name', 'teacher');
//   //     localStorage.setItem('email', 'teacher@test.com');
//   //   } else if (to.path.includes('/admin')) {
//   //     localStorage.setItem('token', 'admin-token');
//   //     localStorage.setItem('userRole', 'admin');
//   //     localStorage.setItem('adminRole', 'superAdmin');
//   //     localStorage.setItem('name', 'admin');
//   //     localStorage.setItem('email', 'admin@test.com');
//   //   }
//   //   next();
//   //   return;
//   // }

//   // 生产环境下的正常验证逻辑
//   // const token = localStorage.getItem('token')
//   const userRole = localStorage.getItem('role')
//   console.log(userRole)
//   // const adminRole = localStorage.getItem('adminRole')

//   // 不需要认证的路由直接通过
//   if (!to.meta.requiresAuth) {
//     next()
//     return
//   }

//   // // 需要认证但没有token
//   // if (!token) {
//   //   next('/login')
//   //   return
//   // }
//   console.log("to.meta.role",to.meta.role)
//   // 需要特定角色权限
//   if (to.meta.role && to.meta.role !== userRole) {
//     next('/login')
//     return
//   }

//   // 检查超级管理员权限
//   // if (to.meta.requireSuperAdmin && adminRole !== 'superAdmin') {
//   //   next('/adminHome')
//   //   return
//   // }

//   next()
// })

// ====================== 测试账号配置区域 ======================
// 说明：此区域代码仅用于开发测试，正式环境请删除

// 1. 学生端测试配置
/*
localStorage.setItem('token', 'test-token');
localStorage.setItem('userRole', 'student');
localStorage.setItem('name', 'xyin');
localStorage.setItem('email', 'xyin');
*/

// 2. 教师端测试配置
// 取消注释以下代码可直接访问教师端
// localStorage.setItem('token', 'teacher-token');
// localStorage.setItem('userRole', 'teacher');
// localStorage.setItem('name', 'teacher');
// localStorage.setItem('email', 'teacher@test.com');

// 3. 管理员端测试配置
// 取消注释以下代码可直接访问管理员端
// 如需超级管理员权限，请将 adminRole 设置为 'superAdmin'
/*
localStorage.setItem('token', 'admin-token');
localStorage.setItem('userRole', 'admin');
localStorage.setItem('adminRole', 'superAdmin');  // 可选：superAdmin 或 普通管理员不设置
localStorage.setItem('name', 'admin');
localStorage.setItem('email', 'admin@test.com');
*/

// ====================== 测试账号配置区域结束 ======================

export default router
