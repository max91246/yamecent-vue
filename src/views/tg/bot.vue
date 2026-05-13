<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getBotList,
  createBot,
  updateBot,
  deleteBot,
  setWebhook
} from "@/api/tg";

defineOptions({ name: "TgBot" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 10, currentPage: 1 });
const searchForm = reactive({ name: "", is_active: "" });

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: 0,
  name: "",
  token: "",
  type: 1,
  is_active: 1,
  remark: ""
});

async function fetchList() {
  loading.value = true;
  const res = await getBotList({
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
        token: row.token,
        type: row.type,
        is_active: row.isActive,
        remark: row.remark ?? ""
      })
    : Object.assign(form, {
        id: 0,
        name: "",
        token: "",
        type: 1,
        is_active: 1,
        remark: ""
      });
  dialogVisible.value = true;
}

async function submitForm() {
  if (!form.name || !form.token) return ElMessage.warning("請填寫名稱與 Token");
  const res = isEdit.value ? await updateBot(form) : await createBot(form);
  if (res.code === 0) {
    ElMessage.success("操作成功");
    dialogVisible.value = false;
    fetchList();
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除 Bot「${row.name}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteBot(row.id);
  if (res.code === 0) {
    ElMessage.success("已刪除");
    fetchList();
  }
}

async function handleWebhook(row: any) {
  const res = await setWebhook(row.id);
  ElMessage[res.code === 0 ? "success" : "error"](
    res.data?.msg ?? (res.code === 0 ? "設定成功" : "設定失敗")
  );
  if (res.code === 0) fetchList();
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="名稱"
        ><el-input v-model="searchForm.name" clearable class="w-40!"
      /></el-form-item>
      <el-form-item label="狀態">
        <el-select
          v-model="searchForm.is_active"
          placeholder="全部"
          clearable
          class="w-24!"
        >
          <el-option label="啟用" :value="1" /><el-option
            label="停用"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" class="mb-4" @click="openDialog()"
      >+ 新增 Bot</el-button
    >

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名稱" width="160" />
      <el-table-column
        prop="token"
        label="Token"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="狀態" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">{{
            row.isActive ? "啟用" : "停用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="webhookSetAt"
        label="Webhook 設定時間"
        width="160"
      />
      <el-table-column
        prop="remark"
        label="備注"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)"
            >修改</el-button
          >
          <el-button link type="warning" @click="handleWebhook(row)"
            >設定Webhook</el-button
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
      :title="isEdit ? '修改 Bot' : '新增 Bot'"
      width="480px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="名稱" required
          ><el-input v-model="form.name"
        /></el-form-item>
        <el-form-item label="Token" required
          ><el-input v-model="form.token"
        /></el-form-item>
        <el-form-item label="狀態">
          <el-switch
            v-model="form.is_active"
            :active-value="1"
            :inactive-value="0"
            active-text="啟用"
            inactive-text="停用"
          />
        </el-form-item>
        <el-form-item label="備注"
          ><el-input v-model="form.remark" type="textarea" :rows="2"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>
