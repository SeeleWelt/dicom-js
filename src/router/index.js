import DicomVolumeAD from "@/components/other/DicomVolumeAD.vue";
import DicomVolume from "@/components/other/DicomVolume.vue";
import TestMip from "@/components/other/TestMip.vue"
import SingleAxisViewport from "@/components/SingleAxisViewport/SingleAxisViewport.vue";
import OtherTest from "@/components/other/OtherTest.vue";
import DicomsFromServer from "@/components/SingleAxisViewport/DicomsFromServer.vue";
import MainView from "@/components/MainView.vue";
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
import teacherRegister from '@/views/login/teacherRegister.vue'
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
import changePassword from '@/views/Admin/components/changePassword.vue'
import changeStudentPwd from '@/views/Admin/components/changeStudentPwd.vue'
import inquireStudent from '@/views/Admin/components/inquireStudent.vue'
import inquireTeacher from '@/views/Admin/components/inquireTeacher.vue'
import scheduleView from '@/views/Admin/components/scheduleView.vue'
import scheduleChange from '@/views/Admin/components/scheduleChange.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      // 首页
      path: '/',
      name: 'selectView',
      component: selectView
      // redirect: '/login'
    },
    {
      // 登陆页
      path: '/login',
      name: 'login',
      component: loginView
    },
    {
      // 注册页
      path: '/register',
      name: 'register',
      component: registerView
    },
    {
      //学生主页
      path: '/studentIndex',
      name: 'studentIndex',
      component: studentIndex,
      children: [
        {
          path: '/studentHome',
          name: 'studentHome',
          component: studentHome
        },
        {
          path: '/updateStudentInfo',
          name: 'updateStudentInfo',
          component: updateStudentInfo
        },
        //三维渲染
        {
          path: '/studentView',
          name: 'studentView',
          component: studentView
        },
        //切片
        {
          path: '/studentViewcut',
          name: 'studentViewcut',
          component: studentViewcut
        },
        //其他
        {
          path: '/studentViewelse',
          name: 'studentViewelse',
          component: studentViewelse
        },
        // 章节学习
        {
          path: '/studySession',
          name: 'studySession',
          component: studySession
        },
      ]
    },
    // 教师注册
    {
      path: '/teacherRegister',
      name: 'teacherRegister',
      component: teacherRegister
    },
    // 教师登录
    {
      path: '/teacherLogin',
      name: 'teacherLogin',
      component: teacherLogin
    },
    {
      // 教师主页
      path: '/teacherIndex',
      name: 'teacherIndex',
      component: teacherIndex,
      children: [
        {
          path: '/teacherHome',
          name: 'teacherHome',
          component: teacherHome
        },
        {
          path: '/updateTeacherInfo',
          name: 'updateTeacherInfo',
          component: updateTeacherInfo
        },
        {
          path: '/teacherViewcut',
          name: 'teacherViewcut',
          component: teacherViewcut
        },
        {
          path: '/inquireComplete',
          name: 'inquireComplete',
          component: inquirecomplete
        },
        {
          path: '/teacherViewelse',
          name: 'teacherViewelse',
          component: teacherViewelse
        },
        {
          path: '/teacherView',
          name: 'teacherView',
          component: teacherView
        },
        {
          path: '/teacherAssignment',
          name: 'teacherAssignment',
          component: teacherAssignment
        }
      ]
    },
    {
      // 管理员登录
      path: '/adminLogin',
      name: 'adminLogin',
      component: adminLogin
    },
    {
      // 管理员主页
      path: '/adminIndex',
      name: 'adminIndex',
      component: adminIndex,
      children: [
        {
          path: '/adminHome',
          name: 'adminHome',
          component: adminHome
        },
        {
          path: '/changePassword',
          name: 'changePassword',
          component: changePassword
        },
        {
          path: '/changeStudentPwd',
          name: 'changeStudentPwd',
          component: changeStudentPwd
        },
        {
          path: '/inquireStudent',
          name: 'inquireStudent',
          component: inquireStudent
        },
        {
          path: '/inquireTeacher',
          name: 'inquireTeacher',
          component: inquireTeacher
        },
        {
          path: '/scheduleView',
          name: 'scheduleView',
          component: scheduleView
        },
        {
          path: '/scheduleChange',
          name: 'scheduleChange',
          component: scheduleChange
        }
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
})

export default router
