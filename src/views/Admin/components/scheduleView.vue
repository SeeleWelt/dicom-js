<template>
  <div>
    <h1>查询班级信息</h1>
    <div class="searchCourse">
      <el-input
        v-model="keywords"
        style="max-width: 600px"
        placeholder="请输入进行搜索"
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="select" placeholder="选择类型" style="width: 115px">
            <el-option label="班级号" value="classId" />
            <el-option label="班级名" value="className" />
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
      <el-table :data="classs" style="width: 100%" max-height="400">
        <el-table-column fixed prop="id" label="序号" width="100">
        </el-table-column>
        <el-table-column fit="true" prop="classId" label="班级号" width="200">
        </el-table-column>
        <el-table-column fit="true" prop="className" label="班级名" width="200">
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteClass(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    <el-dialog v-model="addFormVisible" title="新增班级信息" :append-to-body="true" @close="resetForm(addFormRef)">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="班级号" prop="classId">
          <el-input v-model="addForm.classId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="className">
          <el-input v-model="addForm.className" auto-complete="off"></el-input>
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
    <el-dialog v-model="editFormVisible" title="编辑班级信息" :append-to-body="true" @close="resetForm(editFormRef)">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="班级号" prop="classId">
          <el-input v-model="editForm.classId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="className">
          <el-input v-model="editForm.className" auto-complete="off"></el-input>
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
import { fetchClassInfo, searchClass, addClass, updateClassInfo} from '@/api/api.js';

const select = ref('classId');
const keywords = ref('');
const classs = ref([]);
const totalClasses = ref(0);

const addFormVisible = ref(false);
const editFormVisible = ref(false);
const listenLoading = ref(false);

const addForm = reactive({
  id: '',
  classId: '',
  className: '',
});

const editForm = reactive({
  id: '',
  classId: '',
  className: '',
});

const addFormRules = reactive({
  classId: [{ required: true, message: '请输入班级号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名', trigger: 'blur' }],
});

const editFormRules = reactive({
  classId: [{ required: true, message: '请输入班级号', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名', trigger: 'blur' }],
});

const addFormRef = ref(null);
const editFormRef = ref(null);

// 关闭dialog时清数据
const resetForm = (formEl) => {
  if (formEl) {
    formEl.resetFields();
  }
};

// 请求加载班级信息
const loadClassInfo = async () => {
  try {
    const response = await fetchClassInfo();
    if (response.status === 200) {
      classs.value = response.data;
      totalClasses.value = classs.value.length;
    }
  } catch (error) {
    console.error('加载班级信息失败:', error);
  }
};

// 搜索听点击事件的逻辑
const searchClick = async () => {
  try {
    const response = await searchClass({ keywords: keywords.value, type: select.value });
    if (response.status === 200) {
      classs.value = response.data;
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

// 更新提交逻辑
const addSubmit = () => {
  addFormRef.value.validate(async (valid) => {
    if (valid) {
      listenLoading.value = true;
      try {
        await addClass({
          classId: addForm.classId,
          className: addForm.className,
        });
        listenLoading.value = false;
        addFormVisible.value = false;
        await loadClassInfo();
      } catch (error) {
        listenLoading.value = false;
        console.error('添加失败:', error);
      }
    }
  });
};

// 编辑逻辑
const handleEdit = (index, row) => {
  editFormVisible.value = true;
  Object.assign(editForm, {
    id: row.id,
    classId: row.classId,
    className: row.className,
  });
};

// 编辑表单验证逻辑
const editSubmit = () => {
  editFormRef.value.validate(async (valid) => {
    if (valid) {
      listenLoading.value = true;
      try {
        await updateClassInfo({
          id: editForm.id,
          classId: editForm.classId,
          className: editForm.className,
        });
        listenLoading.value = false;
        editFormVisible.value = false;
        await loadClassInfo();
      } catch (error) {
        listenLoading.value = false;
        console.error('更新失败:', error);
      }
    }
  });
};

// 删除逻辑
const deleteClass = (index, row) => {
  axios.post('/deleteClass', { id: row.id }).then((resp) => {
    if (resp.status === 200 && resp.data.code === 100) {
      classs.value.splice(index, 1);
      totalClasses.value--;
    }
  });
};

onMounted(() => {
  loadClassInfo();
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