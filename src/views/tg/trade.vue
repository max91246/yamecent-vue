<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getTradeList, getAllBots } from "@/api/tg";

defineOptions({ name: "TgTrade" });

const loading = ref(false);
const dataList = ref([]);
const botOptions = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ bot_id: "", tg_chat_id: "", stock_code: "" });

async function fetchList() {
  loading.value = true;
  const res = await getTradeList({
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
  Object.assign(searchForm, { bot_id: "", tg_chat_id: "", stock_code: "" });
  onSearch();
}

onMounted(async () => {
  const res = await getAllBots();
  botOptions.value = res.data ?? [];
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="Bot">
        <el-select
          v-model="searchForm.bot_id"
          placeholder="全部"
          clearable
          class="w-36!"
        >
          <el-option
            v-for="b in botOptions"
            :key="b.id"
            :label="b.name"
            :value="b.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Chat ID"
        ><el-input v-model="searchForm.tg_chat_id" clearable class="w-36!"
      /></el-form-item>
      <el-form-item label="股票代號"
        ><el-input v-model="searchForm.stock_code" clearable class="w-28!"
      /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="tgChatId" label="Chat ID" width="130" />
      <el-table-column prop="stockCode" label="代號" width="80" />
      <el-table-column prop="stockName" label="名稱" width="100" />
      <el-table-column label="類型" width="70">
        <template #default="{ row }">
          <el-tag :type="row.isMargin ? 'warning' : ''" size="small">{{
            row.isMargin ? "融資" : "現股"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sellShares" label="股數" width="80" />
      <el-table-column prop="buyPrice" label="買入價" width="90" />
      <el-table-column prop="sellPrice" label="賣出價" width="90" />
      <el-table-column label="損益" width="110">
        <template #default="{ row }">
          <span
            :class="
              row.profit >= 0
                ? 'text-green-500 font-medium'
                : 'text-red-500 font-medium'
            "
          >
            {{ Number(row.profit).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="時間" width="160" />
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
