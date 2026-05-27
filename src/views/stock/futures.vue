<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { getFuturesPositions } from "@/api/stock";

defineOptions({ name: "StockFutures" });

const loading = ref(false);
const dataList = ref<any[]>([]);
const currentPrice = ref<number | null>(null);
const wtxMargin = ref<{ initial: number | null; maintain: number | null; warning: number | null }>({
  initial: null, maintain: null, warning: null
});
const mxfMargin = ref<{ initial: number | null; maintain: number | null; warning: number | null }>({
  initial: null, maintain: null, warning: null
});
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ tg_chat_id: "", is_open: "1", futures_type: "" });

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
  wtxMargin.value = {
    initial:  res.data?.wtxInitialMargin  ?? null,
    maintain: res.data?.wtxMaintainMargin ?? null,
    warning:  res.data?.wtxMaintainWarning ?? null,
  };
  mxfMargin.value = {
    initial:  res.data?.mxfInitialMargin  ?? null,
    maintain: res.data?.mxfMaintainMargin ?? null,
    warning:  res.data?.mxfMaintainWarning ?? null,
  };
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

const totalAmount = computed(() => {
  const items = dataList.value.filter(r => r.diffAmount !== null);
  if (!items.length) return null;
  return items.reduce((sum, r) => sum + r.diffAmount, 0);
});

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <!-- 搜尋列 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="Chat ID">
        <el-input
          v-model="searchForm.tg_chat_id"
          placeholder="TG Chat ID"
          clearable
          class="w-40!"
        />
      </el-form-item>
      <el-form-item label="商品">
        <el-select v-model="searchForm.futures_type" class="w-28!" clearable placeholder="全部">
          <el-option label="全部" value="" />
          <el-option label="小台 (WTX)" value="wtx" />
          <el-option label="微台 (MXF)" value="mxf" />
        </el-select>
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

    <!-- 保證金資訊卡 -->
    <div class="flex gap-3 mb-4 flex-wrap">
      <!-- 小台 -->
      <el-card v-if="wtxMargin.initial" shadow="never" class="flex-1 min-w-56">
        <div class="text-xs text-gray-400 mb-1">小台（WTX）保證金　每點 NT$50</div>
        <div class="flex gap-4 text-sm">
          <div>
            <span class="text-gray-500">原始</span>
            <span class="ml-1 font-semibold">{{ wtxMargin.initial?.toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-gray-500">維持</span>
            <span class="ml-1 font-semibold">{{ wtxMargin.maintain?.toLocaleString() }}</span>
          </div>
          <div v-if="wtxMargin.warning">
            <span class="text-gray-500">警戒線</span>
            <span class="ml-1 font-semibold text-orange-500">{{ wtxMargin.warning }}%</span>
          </div>
        </div>
      </el-card>
      <!-- 微台 -->
      <el-card v-if="mxfMargin.initial" shadow="never" class="flex-1 min-w-56">
        <div class="text-xs text-gray-400 mb-1">微台（MXF）保證金　每點 NT$10</div>
        <div class="flex gap-4 text-sm">
          <div>
            <span class="text-gray-500">原始</span>
            <span class="ml-1 font-semibold">{{ mxfMargin.initial?.toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-gray-500">維持</span>
            <span class="ml-1 font-semibold">{{ mxfMargin.maintain?.toLocaleString() }}</span>
          </div>
          <div v-if="mxfMargin.warning">
            <span class="text-gray-500">警戒線</span>
            <span class="ml-1 font-semibold text-orange-500">{{ mxfMargin.warning }}%</span>
          </div>
        </div>
      </el-card>
      <!-- 尚未設定提示 -->
      <el-alert
        v-if="!wtxMargin.initial && !mxfMargin.initial"
        title="保證金尚未設定，請執行 fetch:wtx-margin / fetch:mxf-margin 後重新整理"
        type="warning"
        show-icon
        :closable="false"
        class="mb-0"
      />
    </div>

    <!-- 資料表 -->
    <el-table v-loading="loading" :data="dataList" border stripe size="small">
      <el-table-column label="商品" width="90" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.futuresType === 'mxf' ? 'warning' : 'primary'"
            size="small"
          >
            {{ row.futuresType === 'mxf' ? '微台' : '小台' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="botName" label="Bot" width="120" />
      <el-table-column prop="tgChatId" label="Chat ID" width="120" />
      <el-table-column prop="tgUserId" label="User ID" width="100" />
      <el-table-column prop="entryPoint" label="建倉點位" width="100" align="right">
        <template #default="{ row }">
          {{ row.entryPoint?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="口數" width="80" align="center">
        <template #default="{ row }">
          {{ row.contracts }}
          <span class="text-gray-400 text-xs">
            ({{ row.futuresType === 'mxf' ? 'MXF' : 'WTX' }})
          </span>
        </template>
      </el-table-column>
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
          <div class="text-gray-300 text-xs">每點 NT${{ row.pointValue }}</div>
        </template>
      </el-table-column>
      <el-table-column label="維持率" width="100" align="center">
        <template #default="{ row }">
          <span v-if="row.maintainRate !== null"
            :class="row.maintainWarning && row.maintainRate < row.maintainWarning ? 'text-red-500 font-bold' : ''">
            {{ row.maintainRate }}%
            <span v-if="row.maintainWarning && row.maintainRate < row.maintainWarning">⚠️</span>
          </span>
          <span v-else>—</span>
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
      <el-table-column label="平倉點位" width="90" align="right">
        <template #default="{ row }">
          {{ row.closePrice?.toLocaleString() ?? "—" }}
        </template>
      </el-table-column>
      <el-table-column prop="closedAt" label="平倉時間" width="140">
        <template #default="{ row }">
          {{ row.closedAt ?? "—" }}
        </template>
      </el-table-column>
    </el-table>

    <div v-if="totalAmount !== null" class="mt-3 flex justify-end">
      <el-tag :type="totalAmount > 0 ? 'danger' : totalAmount < 0 ? 'success' : 'info'" size="large" effect="dark">
        本頁合計損益：{{ fmtDiff(totalAmount, "NT$") }}
      </el-tag>
    </div>

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
