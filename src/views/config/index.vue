<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getConfigList,
  createConfig,
  updateConfig,
  deleteConfig
} from "@/api/config";

defineOptions({ name: "ConfigList" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 10, currentPage: 1 });
const searchForm = reactive({ wd: "" });

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: 0,
  name: "",
  config_key: "",
  config_value: "",
  type: "text"
});

async function fetchList() {
  loading.value = true;
  const res = await getConfigList({
    ...searchForm,
    pageSize: pagination.pageSize,
    currentPage: pagination.currentPage
  });
  dataList.value = res.data?.list ?? [];
  pagination.total = res.data?.total ?? 0;
  loading.value = false;
}
function onSearch() {
  pagination.currentPage = 1;
  fetchList();
}

function openDialog(row?: any) {
  isEdit.value = !!row;
  row
    ? Object.assign(form, {
        id: row.id,
        name: row.name,
        config_key: row.config_key,
        config_value: row.config_value,
        type: row.type ?? "text"
      })
    : Object.assign(form, {
        id: 0,
        name: "",
        config_key: "",
        config_value: "",
        type: "text"
      });
  dialogVisible.value = true;
}

async function submitForm() {
  if (!form.config_key) return ElMessage.warning("請填寫設定 Key");
  const res = isEdit.value
    ? await updateConfig(form)
    : await createConfig(form);
  if (res.code === 0) {
    ElMessage.success("操作成功");
    dialogVisible.value = false;
    fetchList();
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除設定「${row.config_key}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteConfig(row.id);
  if (res.code === 0) {
    ElMessage.success("已刪除");
    fetchList();
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="搜尋"
        ><el-input
          v-model="searchForm.wd"
          placeholder="名稱或 Key"
          clearable
          class="w-52!"
      /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" class="mb-4" @click="openDialog()"
      >+ 新增設定</el-button
    >

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名稱" width="180" />
      <el-table-column prop="config_key" label="Key" width="200" />
      <el-table-column
        prop="config_value"
        label="Value"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="type" label="類型" width="90" />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)"
            >修改</el-button
          >
          <el-button link type="danger" @click="handleDelete(row)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      layout="total, prev, pager, next"
      @change="fetchList"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改設定' : '新增設定'"
      width="480px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="名稱"
          ><el-input v-model="form.name" placeholder="說明用途"
        /></el-form-item>
        <el-form-item label="Key" required
          ><el-input v-model="form.config_key" :disabled="isEdit"
        /></el-form-item>
        <el-form-item label="Value"
          ><el-input v-model="form.config_value" type="textarea" :rows="3"
        /></el-form-item>
        <el-form-item label="類型"
          ><el-input v-model="form.type" placeholder="text / json / url ..."
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>
