import axios from 'axios';

// 设置基础 API URL
const API_URL = 'http://localhost:5173/';

// 教师端 API
// 发布任务内容
export const publishTaskContent = (sheetId, content) => {
    return axios.post(`${API_URL}/teacher/publishTask`, { sheetId, content }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

// 获取教师任务列表
export const getTeacherTasks = () => {
    return axios.get(`${API_URL}/teacher/tasks`);
};

// 删除任务历史记录
export const deleteTaskHistory = (sheetId, historyId) => {
    return axios.delete(`${API_URL}/teacher/deleteTaskHistory`, {
        headers: {
            'Content-Type': 'application/json',
        },
        data: { sheetId, historyId }
    });
};

// 编辑任务历史记录
export const editTaskHistory = (sheetId, historyId, updatedContent) => {
    return axios.put(`${API_URL}/teacher/editTaskHistory`, { sheetId, historyId, updatedContent }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

// 学生端 API
// 获取学生任务列表
export const getStudentTasks = () => {
    return axios.get(`${API_URL}/student/tasks`);
};

// 查看任务历史内容
export const viewTaskHistory = (sheetId, historyId) => {
    return axios.get(`${API_URL}/student/viewTaskHistory`, {
        params: { sheetId, historyId }
    });
};