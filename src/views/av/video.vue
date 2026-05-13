<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getVideoList, deleteVideo } from "@/api/av";

defineOptions({ name: "AvVideo" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({
  code: "",
  actress: "",
  studio: "",
  is_uncensored: ""
});

async function fetchList() {
  loading.value = true;
  const res = await getVideoList({
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
  Object.assign(searchForm, {
    code: "",
    actress: "",
    studio: "",
    is_uncensored: ""
  });
  onSearch();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除影片「${row.code}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteVideo(row.id);
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
      <el-form-item label="番號"
        ><el-input
          v-model="searchForm.code"
          placeholder="如 SSIS-001"
          clearable
          class="w-36!"
      /></el-form-item>
      <el-form-item label="女優"
        ><el-input v-model="searchForm.actress" clearable class="w-36!"
      /></el-form-item>
      <el-form-item label="片商"
        ><el-input v-model="searchForm.studio" clearable class="w-36!"
      /></el-form-item>
      <el-form-item label="無碼">
        <el-select
          v-model="searchForm.is_uncensored"
          placeholder="全部"
          clearable
          class="w-24!"
        >
          <el-option label="無碼" :value="1" /><el-option
            label="有碼"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="code" label="番號" width="120" />
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="row.coverUrl"
            fit="cover"
            class="w-12 h-8 rounded"
            preview-teleported
            :preview-src-list="[row.coverUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="片名"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="studio" label="片商" width="120" />
      <el-table-column prop="releaseDate" label="發行日" width="110" />
      <el-table-column label="女優" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{
          Array.isArray(row.actresses)
            ? row.actresses.join(", ")
            : row.actresses
        }}</template>
      </el-table-column>
      <el-table-column label="標籤" min-width="130">
        <template #default="{ row }">
          <el-tag
            v-if="row.isUncensored"
            type="danger"
            size="small"
            class="mr-1!"
            >無碼</el-tag
          >
          <el-tag v-if="row.isLeaked" type="warning" size="small" class="mr-1!"
            >流出</el-tag
          >
          <template v-if="Array.isArray(row.tags) && row.tags.length">
            <el-tag
              v-for="tag in row.tags.slice(0, 3)"
              :key="tag"
              size="small"
              class="mr-1! mb-1!"
              >{{ tag }}</el-tag
            >
            <el-tooltip
              v-if="row.tags.length > 3"
              placement="top"
              :show-after="100"
            >
              <template #content>
                <div class="flex flex-wrap gap-1 max-w-xs">
                  <el-tag v-for="tag in row.tags" :key="tag" size="small">{{
                    tag
                  }}</el-tag>
                </div>
              </template>
              <span class="text-primary cursor-pointer text-xs"
                >+{{ row.tags.length - 3 }}</span
              >
            </el-tooltip>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="入庫時間" width="110" sortable />
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
