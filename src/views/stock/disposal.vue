<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getDisposalList } from "@/api/stock";

defineOptions({ name: "StockDisposal" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ stock_code: "", market: "", status: "active" });

async function fetchList() {
  loading.value = true;
  const res = await getDisposalList({
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
  Object.assign(searchForm, { stock_code: "", market: "", status: "active" });
  onSearch();
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="代號/名稱"
        ><el-input v-model="searchForm.stock_code" clearable class="w-36!"
      /></el-form-item>
      <el-form-item label="市場">
        <el-select
          v-model="searchForm.market"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="上市" value="twse" /><el-option
            label="上櫃"
            value="tpex"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="狀態">
        <el-select v-model="searchForm.status" class="w-28!">
          <el-option label="處置中" value="active" /><el-option
            label="全部"
            value="all"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column label="市場" width="70">
        <template #default="{ row }">
          <el-tag
            :type="row.market === 'twse' ? 'primary' : 'warning'"
            size="small"
            >{{ row.market === "twse" ? "上市" : "上櫃" }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="stockCode" label="代號" width="80" />
      <el-table-column prop="stockName" label="名稱" width="120" />
      <el-table-column prop="startDate" label="開始日" width="110" />
      <el-table-column prop="endDate" label="結束日" width="110" />
      <el-table-column label="狀態" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'danger' : 'info'" size="small">{{
            row.isActive ? "處置中" : "已結束"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="reason"
        label="原因"
        min-width="200"
        show-overflow-tooltip
      />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[20, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>
