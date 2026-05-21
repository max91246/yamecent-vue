<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { getFuturesPositions } from "@/api/stock";

defineOptions({ name: "StockFutures" });

const loading = ref(false);
const dataList = ref<any[]>([]);
const currentPrice = ref<number | null>(null);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ tg_chat_id: "", is_open: "1" });

async function fetchList() {
  loading.value = true;
  const res = await getFuturesPositions({
    ...searchForm,
    pageSize: pagination.pageSize,
    currentPage: pagination.currentPage
  });
  dataList.value = res.data?.list ?? [];
  pagination.total = res.data?.total ?? 0;
  currentPrice.value = res.data?.currentPrice ?? null;
  loading.value = false;
}

function onSearch() {
  pagination.currentPage = 1;
  fetchList();
}

function diffClass(val: number | null) {
  if (val === null) return "";
  return val > 0 ? "text-red-500" : val < 0 ? "text-green-600" : "";
}

function fmtDiff(val: number | null, prefix = "") {
  if (val === null) return "—";
  const sign = val > 0 ? "+" : "";
  return sign + prefix + val.toLocaleString();
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="Chat ID">
        <el-input
          v-model="searchForm.tg_chat_id"
          placeholder="TG Chat ID"
          clearable
          class="w-40!"
        />
      </el-form-item>
      <el-form-item label="狀態">
        <el-select v-model="searchForm.is_open" class="w-24!">
          <el-option label="持倉中" value="1" />
          <el-option label="已平倉" value="0" />
          <el-option label="全部" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查詢</el-button>
      </el-form-item>
      <el-form-item v-if="currentPrice">
        <el-tag type="warning" size="large">
          台指現價：{{ currentPrice?.toLocaleString() }}
        </el-tag>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe size="small">
      <el-table-column prop="botName" label="Bot" width="120" />
      <el-table-column prop="tgChatId" label="Chat ID" width="120" />
      <el-table-column prop="tgUserId" label="User ID" width="100" />
      <el-table-column prop="entryPoint" label="建倉點位" width="100" align="right">
        <template #default="{ row }">
          {{ row.entryPoint?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="contracts" label="口數(小台)" width="90" align="center" />
      <el-table-column label="當前點位" width="100" align="right">
        <template #default="{ row }">
          {{ row.currentPrice?.toLocaleString() ?? "—" }}
        </template>
      </el-table-column>
      <el-table-column label="點差" width="90" align="right">
        <template #default="{ row }">
          <span :class="diffClass(row.diffPoints)">
            {{ fmtDiff(row.diffPoints) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="損益(NT$)" width="120" align="right">
        <template #default="{ row }">
          <span :class="diffClass(row.diffAmount)">
            {{ fmtDiff(row.diffAmount, "NT$") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isOpen ? 'success' : 'info'" size="small">
            {{ row.isOpen ? "持倉中" : "已平倉" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="建倉時間" width="140" />
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
