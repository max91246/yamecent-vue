<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getActressList, deleteActress } from "@/api/av";

defineOptions({ name: "AvActress" });

const router = useRouter();
const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({
  name: "",
  is_active: "",
  debut_year: "",
  has_image: "",
  bust: "",
  height_min: "",
  height_max: ""
});

const currentYear = new Date().getFullYear();
const debutYears = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
const cupSizes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const heights = Array.from({ length: 36 }, (_, i) => 140 + i);

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
  Object.assign(searchForm, {
    name: "",
    is_active: "",
    debut_year: "",
    has_image: "",
    bust: "",
    height_min: "",
    height_max: ""
  });
  onSearch();
}

function goActressVideos(name: string) {
  router.push({ path: "/av/video", query: { actress: name } });
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
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="搜尋姓名" clearable class="w-36!" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="出道年份">
        <el-select v-model="searchForm.debut_year" placeholder="全部" clearable class="w-28!">
          <el-option v-for="y in debutYears" :key="y" :label="y" :value="y" />
        </el-select>
      </el-form-item>
      <el-form-item label="圖片">
        <el-select v-model="searchForm.has_image" placeholder="全部" clearable class="w-24!">
          <el-option label="有" :value="1" />
          <el-option label="無" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="罩杯">
        <el-select v-model="searchForm.bust" placeholder="全部" clearable class="w-24!">
          <el-option v-for="c in cupSizes" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="身高">
        <el-select v-model="searchForm.height_min" placeholder="最低" clearable class="w-24!">
          <el-option v-for="h in heights" :key="h" :label="`${h}cm`" :value="h" />
        </el-select>
        <span class="mx-1 text-gray-400">～</span>
        <el-select v-model="searchForm.height_max" placeholder="最高" clearable class="w-24!">
          <el-option v-for="h in heights" :key="h" :label="`${h}cm`" :value="h" />
        </el-select>
      </el-form-item>
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
      <el-table-column label="姓名" width="140">
        <template #default="{ row }">
          <span
            class="text-primary cursor-pointer hover:underline font-medium"
            @click="goActressVideos(row.name)"
          >{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="height" label="身高" width="70">
        <template #default="{ row }">{{ row.height ? `${row.height}cm` : '-' }}</template>
      </el-table-column>
      <el-table-column prop="bust" label="罩杯" width="70">
        <template #default="{ row }">{{ row.bust || '-' }}</template>
      </el-table-column>
      <el-table-column prop="debutYear" label="出道年" width="90" />
      <el-table-column prop="birthplace" label="出生地" width="100" />
      <el-table-column label="影片數" width="90">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goActressVideos(row.name)">
            {{ row.videosCount }} 部
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="入庫" width="100" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="handleDelete(row)">刪除</el-button>
        </template>
      </el-table-column>
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
