<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getUserDetail } from "@/api/tg";

defineOptions({ name: "TgHoldingDetail" });

const route      = useRoute();
const router     = useRouter();
const backPath   = computed(() =>
  route.path.startsWith("/stock") ? "/stock/holding" : "/tg/holding"
);
const loading = ref(false);
const detail = ref<any>(null);

async function fetchDetail() {
  loading.value = true;
  const res = await getUserDetail(
    route.params.chatId as string,
    route.query.bot_id ? Number(route.query.bot_id) : undefined
  );
  if (res.code === 0) detail.value = res.data;
  loading.value = false;
}

onMounted(fetchDetail);
</script>

<template>
  <div v-loading="loading" class="p-4">
    <div class="flex items-center gap-3 mb-5">
      <el-button :icon="'ArrowLeft'" circle @click="router.push(backPath)" />
      <span class="text-lg font-medium"
        >Chat ID：{{ route.params.chatId }}</span
      >
    </div>

    <template v-if="detail">
      <!-- 帳戶概覽 -->
      <el-row :gutter="16" class="mb-6">
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">帳戶資金</div>
            <div class="text-2xl font-bold">
              {{ Number(detail.wallet?.capital ?? 0).toLocaleString() }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">持倉成本</div>
            <div class="text-2xl font-bold">
              {{ Number(detail.holdingCost).toLocaleString() }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">累計損益</div>
            <div
              class="text-2xl font-bold"
              :class="
                detail.tradeProfit >= 0 ? 'text-green-500' : 'text-red-500'
              "
            >
              {{ Number(detail.tradeProfit).toLocaleString() }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">勝率</div>
            <div class="text-2xl font-bold">
              {{ detail.tradeWinPct }}%
              <span class="text-sm text-gray-400 font-normal"
                >（{{ detail.tradeWin }}/{{ detail.tradeTotal }}）</span
              >
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 目前持股 -->
      <div class="text-base font-medium mb-3">
        目前持股（{{ detail.holdings.length }} 筆）
      </div>
      <el-table :data="detail.holdings" border stripe class="mb-6">
        <el-table-column prop="stockCode" label="代號" width="90" />
        <el-table-column prop="stockName" label="名稱" width="120" />
        <el-table-column label="類型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isMargin ? 'warning' : ''" size="small">{{
              row.isMargin ? "融資" : "現股"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shares" label="股數" width="100" />
        <el-table-column prop="buyPrice" label="買入均價" width="110" />
        <el-table-column label="持倉成本" width="130">
          <template #default="{ row }">{{
            Number(row.totalCost).toLocaleString()
          }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="建倉時間" width="160" />
      </el-table>

      <!-- 待交割 -->
      <template v-if="detail.settlements.length">
        <div class="text-base font-medium mb-3">
          待交割（{{ detail.settlements.length }} 筆）
        </div>
        <el-table :data="detail.settlements" border stripe class="mb-6">
          <el-table-column prop="stockCode" label="代號" width="90" />
          <el-table-column prop="stockName" label="名稱" width="120" />
          <el-table-column label="方向" width="80">
            <template #default="{ row }">
              <el-tag
                :type="row.direction === 'buy' ? 'danger' : 'success'"
                size="small"
                >{{ row.direction === "buy" ? "買入" : "賣出" }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="shares" label="股數" width="100" />
          <el-table-column label="交割金額" width="130">
            <template #default="{ row }">{{
              Number(row.settlementAmount).toLocaleString()
            }}</template>
          </el-table-column>
          <el-table-column prop="settleDate" label="交割日" width="120" />
        </el-table>
      </template>

      <!-- 歷史交易 -->
      <div class="text-base font-medium mb-3">
        歷史交易（{{ detail.trades.length }} 筆）
      </div>
      <el-table :data="detail.trades" border stripe>
        <el-table-column prop="stockCode" label="代號" width="90" />
        <el-table-column prop="stockName" label="名稱" width="120" />
        <el-table-column label="類型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isMargin ? 'warning' : ''" size="small">{{
              row.isMargin ? "融資" : "現股"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sellShares" label="股數" width="90" />
        <el-table-column prop="buyPrice" label="買入價" width="100" />
        <el-table-column prop="sellPrice" label="賣出價" width="100" />
        <el-table-column label="損益" width="120">
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
    </template>
  </div>
</template>
