import axios from '@/utils/axios-config.js';

// 获取学生信息的 API
export const fetchStudentInfo = () => {
    return axios.get('/student/info'); 
};

// 获取教师信息的 API
export const fetchteacherInfo = () => {
    return axios.get('/teacher/info'); 
};

// 更新教师信息的API
export const updateTeacherInfo = (teacherData) => {
    return axios.post('/teacher/update', teacherData);
};

// 更新学生信息的API
export const updateStudentInfo = (studentData) => {
    return axios.post('/student/update', studentData);
};

// 管理员查询教师信息
// 搜索教师
export const searchTeacher = (params) => {
    return axios.post('/admin/teacher/search', params);
};

// 添加教师的API
export const addTeacher = (teacherData) => {
    return axios.post('/admin/teacher/add', teacherData);
};

// 删除教师的 API
export const removeTeacher = (teacherId) => {
    return axios.delete(`/admin/teacher/${teacherId}`);
};

// 更新教师信息的API
export const updateTeacher = (teacherData) => {
    return axios.put(`/admin/teacher/${teacherData.id}`, teacherData);
};

// 重置教师密码的API
export const resetTeacherPassword = (data) => {
    return axios.post('/admin/teacher/reset-password', data);
};

// 更新课程信息的API
export const updateCourseInfo = (courseData) => {
    return axios.post('/admin/course/update', courseData);
};

// 获取班级信息的 API
export const fetchClassInfo = () => {
    return axios.get('/admin/class/info');
};

// 搜索组件的 API
export const searchClass = (params) => {
    return axios.post('/admin/class/search', params);
};

// 添加班级的 API
export const addClass = (classData) => {
    return axios.post('/admin/class/add', classData);
};

// 更新班级信息的 API
export const updateClassInfo = (classData) => {
    return axios.post('/admin/class/update', classData);
};

// 学生登录的 API
export const studentLogin = (loginData) => {
    return axios.post('/auth/student/login', loginData);
};

// 发送验证码的 API
export const sendRegisterCode = (email) => {
    return axios.post('/auth/student/code', { email });
};

// 注册用户的 API
export const registerUser = (userData) => {
    return axios.post('/auth/student/register', userData);
};

// 教师登录的 API
export const teacherLoginApi = (loginData) => {
    return axios.post('/auth/teacher/login', loginData);
};

// 发送学习时长
export const sendLearningTime = (learningTime) => {
    return axios.post('/api/learning-time', { learningTime });
};