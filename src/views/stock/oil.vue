<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getOilPriceList } from "@/api/stock";

defineOptions({ name: "StockOil" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 50, currentPage: 1 });
const searchForm = reactive({
  ticker: "CL",
  timeframe: "1D",
  from: "",
  to: ""
});

async function fetchList() {
  loading.value = true;
  const res = await getOilPriceList({
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

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="代碼">
        <el-select v-model="searchForm.ticker" class="w-28!">
          <el-option label="WTI (CL)" value="CL" /><el-option
            label="Brent (BZ)"
            value="BZ"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="週期">
        <el-select v-model="searchForm.timeframe" class="w-24!">
          <el-option label="日線" value="1D" /><el-option
            label="週線"
            value="1W"
          /><el-option label="月線" value="1M" />
        </el-select>
      </el-form-item>
      <el-form-item label="從"
        ><el-input
          v-model="searchForm.from"
          placeholder="YYYY-MM-DD"
          clearable
          class="w-36!"
      /></el-form-item>
      <el-form-item label="到"
        ><el-input
          v-model="searchForm.to"
          placeholder="YYYY-MM-DD"
          clearable
          class="w-36!"
      /></el-form-item>
      <el-form-item
        ><el-button type="primary" @click="onSearch"
          >查詢</el-button
        ></el-form-item
      >
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe size="small">
      <el-table-column prop="candleAt" label="時間" width="140" />
      <el-table-column prop="ticker" label="代碼" width="70" />
      <el-table-column prop="timeframe" label="週期" width="70" />
      <el-table-column prop="open" label="開盤" width="90" />
      <el-table-column prop="high" label="最高" width="90" />
      <el-table-column prop="low" label="最低" width="90" />
      <el-table-column prop="close" label="收盤" width="90" />
      <el-table-column prop="volume" label="成交量" width="100" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[50, 100, 200]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>
