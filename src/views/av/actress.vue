<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getActressList, deleteActress } from "@/api/av";

defineOptions({ name: "AvActress" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ name: "", is_active: "" });

async function fetchList() {
  loading.value = true;
  const res = await getActressList({
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
  Object.assign(searchForm, { name: "", is_active: "" });
  onSearch();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除女優「${row.name}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteActress(row.id);
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
      <el-form-item label="姓名"
        ><el-input v-model="searchForm.name" clearable class="w-40!"
      /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="頭像" width="70">
        <template #default="{ row }">
          <el-image
            v-if="row.imageUrl"
            :src="row.imageUrl"
            fit="cover"
            class="size-10 rounded-full"
            preview-teleported
            :preview-src-list="[row.imageUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="130" />
      <el-table-column prop="height" label="身高" width="70" />
      <el-table-column prop="bust" label="胸圍" width="70" />
      <el-table-column prop="birthplace" label="出生地" width="100" />
      <el-table-column prop="debutYear" label="出道年" width="90" />
      <el-table-column prop="videosCount" label="影片數" width="80" />
      <el-table-column prop="createdAt" label="入庫" width="100" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>
