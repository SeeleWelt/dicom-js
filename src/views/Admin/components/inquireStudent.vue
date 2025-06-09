<template>
  <div>
    <h1>查询学生档案</h1>
    <div class="searchCourse">
      <el-input
        v-model="keywords"
        style="max-width: 600px"
        placeholder="请输入进行搜索"
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="select" placeholder="选择类型" style="width: 115px">
            <el-option label="学号" value="account" />
            <el-option label="姓名" value="name" />
            <el-option label="性别" value="sex" />
          </el-select>
        </template>
        <template #append>
          <el-button @click="searchClick" icon="search" />
        </template>
      </el-input>
      <el-button type="primary" style="margin-left: 10px; background-color: skyblue;border: 0;" @click="handleAdd">新 增</el-button>
    </div>
    <br />
    <el-card>
      <el-table :data="teachers" style="width: 100%" max-height="400">
        <el-table-column fixed prop="id" label="序号" width="200">
        </el-table-column>
        <el-table-column fit="true" prop="user.account" label="学号" width="200">
        </el-table-column>
        <el-table-column fit="true" prop="name" label="姓名" width="200">
        </el-table-column>
        <el-table-column fit="true" prop="sex" label="性别" width="200">
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTeacher(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTeachers"
        style="margin-top: 20px"
      >
      </el-pagination> -->
      <el-footer>
        <el-pagination
          background
          layout="prev, pager, next"
          style="padding-top: 20px; padding-right: 50px; text-align: right;"
          :total="50"
        ></el-pagination>
      </el-footer>
    </el-card>

    <!-- 新增界面 -->
    <el-dialog v-model="addFormVisible" title="新增" :append-to-body="true" @close="resetForm(addFormRef)">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="学号" prop="account">
          <el-input v-model="addForm.account" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="radios" @change="addFormChangeSex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="listenLoading">提 交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑界面 -->
    <el-dialog v-model="editFormVisible" title="编辑" :append-to-body="true" @close="resetForm(editFormRef)">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="学号" prop="account">
          <el-input v-model="editForm.account" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editSubmit" :loading="listenLoading">提 交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from '@/utils/axios-config.js';

const select = ref('account');
const keywords = ref('');
const teachers = ref([]);
// const currentPage = ref(1);
// const pageSize = ref(5);
const totalTeachers = ref(0);

const addFormVisible = ref(false);
const editFormVisible = ref(false);
const listenLoading = ref(false);
const addForm = reactive({
  id: '',
  account: '',
  password: '',
  name: '',
  sex: '',
});
const editForm = reactive({
  user: '',
  name: '',
  sex: '',
});
const radios = ref(1);

const addFormRules = reactive({
  account: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
});
const editFormRules = reactive({
  account: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
});

const addFormRef = ref(null);
const editFormRef = ref(null);

// 搜索结果
const searchResult = ref([]);

// 加载教师信息
const loadTeacherInfo = () => {
  axios.get('/teacherInfo').then((resp) => {
    if (resp.status === 200) {
      teachers.value = resp.data;
      totalTeachers.value = teachers.value.length;
    }
  });
};

// 搜索框逻辑
const searchClick = () => {
  axios.post('/searchTeacher', { keywords: keywords.value }).then((resp) => {
    if (resp.status === 200) {
      searchResult.value = resp.data;
      teachers.value = searchResult.value;
    }
  });
};

// 更新选中记录的逻辑
const handleAdd = () => {
  addFormVisible.value = true;
  Object.assign(addForm, {
    id: '100',
    account: '',
    password: '',
    name: '',
    sex: '男',
  });
};

// 更新提交逻辑
const addSubmit = () => {
  addFormRef.value.validate((valid) => {
    if (valid) {
      listenLoading.value = true;
      axios
        .post('/addTeacher', {
          user: {
            id: '',
            account: addForm.account,
            password: addForm.password,
            type: 2,
          },
          name: addForm.name,
          sex: addForm.sex,
        })
        .then((resp) => {
          listenLoading.value = false;
          if (resp.status === 200) {
            addFormVisible.value = false;
            loadTeacherInfo();
          }
        });
    }
  });
};

// 性别变更
const addFormChangeSex = (value) => {
  addForm.sex = value === 1 ? '男' : '女';
};

// 编辑逻辑
const handleEdit = (index, row) => {
  editFormVisible.value = true;
  Object.assign(editForm, {
    id: row.id,
    userId: row.user.id,
    account: row.user.account,
    password: row.user.password,
    name: row.name,
    sex: row.sex,
  });
  radios.value = editForm.sex === '男' ? 1 : 0;
};

// 编辑表单验证逻辑
const editSubmit = () => {
  editFormRef.value.validate((valid) => {
    if (valid) {
      listenLoading.value = true;
      axios
        .post('/updateTeacher', {
          id: editForm.id,
          user: {
            id: editForm.userId,
            account: editForm.account,
            password: editForm.password,
            type: 2,
          },
          name: editForm.name,
          sex: editForm.sex,
        })
        .then((resp) => {
          listenLoading.value = false;
          if (resp.status === 200) {
            editFormVisible.value = false;
            loadTeacherInfo();
          }
        });
    }
  });
};

// 删除逻辑
const deleteTeacher = (index, row) => {
  axios.post('/deleteTeacher', { id: row.id }).then((resp) => {
    if (resp.status === 200 && resp.data.code === 100) {
      teachers.value.splice(index, 1);
      totalTeachers.value--;
    }
  });
};

// 表单重置逻辑
const resetForm = (formEl) => {
  if (formEl) {
    formEl.resetFields();
  }
};

// 分页逻辑
// const handleSizeChange = (val) => {
//   pageSize.value = val;
// };
// const handleCurrentChange = (val) => {
//   currentPage.value = val;
// };

onMounted(() => {
  loadTeacherInfo();
});
</script>

<style scoped>
.card {
  margin-top: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
}
</style>