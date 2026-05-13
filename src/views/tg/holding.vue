<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getHoldingList, getAllBots } from "@/api/tg";

defineOptions({ name: "TgHolding" });

const route  = useRoute();
const router = useRouter();
// 從股票區進來時，明細也留在股票區；從 TG Bot 進來則留在 TG Bot 區
const detailBase = route.path.startsWith("/stock") ? "/stock/holding" : "/tg/holding";
const loading = ref(false);
const dataList = ref([]);
const botOptions = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ bot_id: "", tg_chat_id: "" });

async function fetchList() {
  loading.value = true;
  const res = await getHoldingList({
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
        ><el-input v-model="searchForm.tg_chat_id" clearable class="w-40!"
      /></el-form-item>
      <el-form-item
        ><el-button type="primary" @click="onSearch"
          >搜尋</el-button
        ></el-form-item
      >
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="tgChatId" label="Chat ID" width="130" />
      <el-table-column prop="tgUserId" label="User ID" width="110" />
      <el-table-column prop="capital" label="帳戶資金" width="120">
        <template #default="{ row }"
          ><span class="font-medium">{{
            Number(row.capital).toLocaleString()
          }}</span></template
        >
      </el-table-column>
      <el-table-column prop="holdingCount" label="持股筆數" width="90" />
      <el-table-column prop="holdingCost" label="持倉成本" width="120">
        <template #default="{ row }">{{
          Number(row.holdingCost).toLocaleString()
        }}</template>
      </el-table-column>
      <el-table-column prop="tradeTotal" label="交易次數" width="90" />
      <el-table-column label="累計損益" width="120">
        <template #default="{ row }">
          <span
            :class="row.tradeProfit >= 0 ? 'text-green-500' : 'text-red-500'"
            class="font-medium"
          >
            {{ Number(row.tradeProfit).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新時間" width="160" />
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="
              router.push({
                path: `${detailBase}/${row.tgChatId}`,
                query: searchForm.bot_id ? { bot_id: searchForm.bot_id } : {}
              })
            "
            >查看明細</el-button
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
  </div>
</template>
