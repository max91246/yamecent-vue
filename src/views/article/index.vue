<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getArticleList,
  createArticle,
  updateArticle,
  deleteArticle
} from "@/api/article";

defineOptions({ name: "ArticleList" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 10, currentPage: 1 });

const typeMap: Record<number, string> = {
  1: "一般文章",
  2: "高級文章",
  3: "特級文章"
};
const typeTagMap: Record<number, string> = { 1: "", 2: "warning", 3: "danger" };

const searchForm = reactive({ title: "", type: "", is_active: "" });

const dialogVisible = ref(false);
const dialogTitle = ref("新增文章");
const formRef = ref();
const form = reactive({ id: 0, title: "", image: "", type: 1, is_active: 1 });

async function fetchList() {
  loading.value = true;
  const res = await getArticleList({
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
function resetSearch() {
  Object.assign(searchForm, { title: "", type: "", is_active: "" });
  onSearch();
}

function openDialog(row?: any) {
  if (row) {
    Object.assign(form, {
      id: row.id,
      title: row.title,
      image: row.image ?? "",
      type: row.type,
      is_active: row.isActive
    });
    dialogTitle.value = "修改文章";
  } else {
    Object.assign(form, { id: 0, title: "", image: "", type: 1, is_active: 1 });
    dialogTitle.value = "新增文章";
  }
  dialogVisible.value = true;
}

async function submitForm() {
  const res = form.id ? await updateArticle(form) : await createArticle(form);
  if (res.code === 0) {
    ElMessage.success(form.id ? "修改成功" : "新增成功");
    dialogVisible.value = false;
    fetchList();
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除「${row.title}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteArticle(row.id);
  if (res.code === 0) {
    ElMessage.success("刪除成功");
    fetchList();
  }
}

async function toggleActive(row: any) {
  await updateArticle({ id: row.id, is_active: row.isActive });
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <!-- 搜尋列 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="標題">
        <el-input
          v-model="searchForm.title"
          placeholder="請輸入標題"
          clearable
          class="w-48!"
        />
      </el-form-item>
      <el-form-item label="類型">
        <el-select
          v-model="searchForm.type"
          placeholder="全部"
          clearable
          class="w-36!"
        >
          <el-option label="一般文章" :value="1" />
          <el-option label="高級文章" :value="2" />
          <el-option label="特級文章" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="狀態">
        <el-select
          v-model="searchForm.is_active"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" class="mb-4" @click="openDialog()"
      >+ 新增文章</el-button
    >

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column
        prop="title"
        label="標題"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="類型" width="100">
        <template #default="{ row }">
          <el-tag :type="typeTagMap[row.type] as any" size="small">{{
            typeMap[row.type]
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="90">
        <template #default="{ row }">
          <el-switch
            v-model="row.isActive"
            :active-value="1"
            :inactive-value="0"
            @change="toggleActive(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="建立時間" width="160" />
      <el-table-column label="操作" width="140" fixed="right">
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
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />

    <!-- 新增/修改 Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="標題" required>
          <el-input v-model="form.title" placeholder="請輸入標題" />
        </el-form-item>
        <el-form-item label="圖片URL">
          <el-input v-model="form.image" placeholder="圖片網址（選填）" />
        </el-form-item>
        <el-form-item label="類型">
          <el-select v-model="form.type" class="w-full">
            <el-option label="一般文章" :value="1" />
            <el-option label="高級文章" :value="2" />
            <el-option label="特級文章" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-switch
            v-model="form.is_active"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>
