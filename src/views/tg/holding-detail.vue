<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getUserDetail } from "@/api/tg";

defineOptions({ name: "TgHoldingDetail" });

const route    = useRoute();
const router   = useRouter();
const loading  = ref(false);
const detail   = ref<any>(null);

const backPath = computed(() =>
  route.path.startsWith("/stock") ? "/stock/holding" : "/tg/holding"
);

async function fetchDetail() {
  loading.value = true;
  const res = await getUserDetail(
    route.params.chatId as string,
    route.query.bot_id ? Number(route.query.bot_id) : undefined
  );
  if (res.code === 0) detail.value = res.data;
  loading.value = false;
}

// 股數格式：1500股（1張 500零股）
function fmtShares(shares: number): string {
  const lots = Math.floor(shares / 1000);
  const odd  = shares % 1000;
  if (lots > 0 && odd > 0) return `${shares.toLocaleString()}股（${lots}張 ${odd}零股）`;
  if (lots > 0)             return `${shares.toLocaleString()}股（${lots}張）`;
  return `${shares.toLocaleString()}股`;
}

function goQuery(code: string) {
  router.push({ path: "/stock/query", query: { code } });
}

onMounted(fetchDetail);
</script>

<template>
  <div v-loading="loading" class="p-4">
    <!-- 頁頭 -->
    <div class="flex items-center gap-3 mb-5">
      <el-button :icon="'ArrowLeft'" circle @click="router.push(backPath)" />
      <span class="text-lg font-medium">Chat ID：{{ route.params.chatId }}</span>
    </div>

    <template v-if="detail">
      <!-- ── 統計卡片 ── -->
      <el-row :gutter="16" class="mb-6">
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">帳戶資金</div>
            <div class="text-2xl font-bold">NT${{ Number(detail.wallet?.capital ?? 0).toLocaleString() }}</div>
            <div class="text-xs text-gray-400 mt-1">可用現金</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">持股總成本</div>
            <div class="text-2xl font-bold">NT${{ Number(detail.holdingCost).toLocaleString() }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ detail.holdings.length }} 筆持股</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">歷史損益</div>
            <div class="text-2xl font-bold" :class="detail.tradeProfit >= 0 ? 'text-red-500' : 'text-green-500'">
              {{ detail.tradeProfit >= 0 ? "+" : "" }}NT${{ Number(detail.tradeProfit).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-400 mt-1">共 {{ detail.tradeTotal }} 筆交易</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never">
            <div class="text-gray-400 text-sm mb-1">交易勝率</div>
            <div class="text-2xl font-bold">{{ detail.tradeWinPct }}%</div>
            <div class="text-xs text-gray-400 mt-1">
              盈利 {{ detail.tradeWin }} ／ 虧損 {{ detail.tradeTotal - detail.tradeWin }} 筆
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 待交割款項 ── -->
      <template v-if="detail.settlements.length">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="px-4 py-3 font-medium border-b border-gray-100 dark:border-gray-800">待交割款項</div>
          <div class="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div class="text-xs text-gray-400 mb-1">待付款（買進）</div>
              <div class="text-lg font-bold text-green-500">-NT${{ Number(detail.settleBuy).toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">待收款（賣出）</div>
              <div class="text-lg font-bold text-red-500">+NT${{ Number(detail.settleSell).toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">淨額</div>
              <div class="text-lg font-bold" :class="detail.settleNet >= 0 ? 'text-red-500' : 'text-green-500'">
                {{ detail.settleNet >= 0 ? "+" : "" }}NT${{ Number(detail.settleNet).toLocaleString() }}
              </div>
            </div>
          </div>
          <el-table :data="detail.settlements" size="small" border>
            <el-table-column prop="settleDate" label="交割日" width="110" />
            <el-table-column label="股票" min-width="150">
              <template #default="{ row }">{{ row.stockName }}（{{ row.stockCode }}）</template>
            </el-table-column>
            <el-table-column label="張數" width="140">
              <template #default="{ row }">{{ fmtShares(row.shares) }}</template>
            </el-table-column>
            <el-table-column label="方向" width="110">
              <template #default="{ row }">
                <el-tag :type="row.direction === 'sell' ? 'success' : 'danger'" size="small">
                  {{ row.direction === "sell" ? "賣出待收" : "買進待付" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金額" width="130" align="right">
              <template #default="{ row }">
                <span :class="row.direction === 'sell' ? 'text-red-500' : 'text-green-500'" class="font-medium">
                  {{ row.direction === "sell" ? "+" : "-" }}NT${{ Number(row.settlementAmount).toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>

      <!-- ── 當前持股 ── -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="px-4 py-3 font-medium border-b border-gray-100 dark:border-gray-800">
          當前持股（{{ detail.holdings.length }} 筆）
        </div>
        <div v-if="!detail.holdings.length" class="py-8 text-center text-gray-400">目前無持股</div>
        <el-table v-else :data="detail.holdings" size="small" border stripe>
          <el-table-column label="股票" min-width="180">
            <template #default="{ row }">
              <span
                class="text-primary cursor-pointer hover:underline"
                @click="goQuery(row.stockCode)"
              >{{ row.stockName }}（{{ row.stockCode }}）</span>
              <el-tag v-if="row.isDisposal" type="danger" size="small" class="ml-1!">⚠ 處置股</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="股數" min-width="160">
            <template #default="{ row }">{{ fmtShares(row.shares) }}</template>
          </el-table-column>
          <el-table-column label="類型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.isMargin ? 'warning' : 'primary'" size="small">
                {{ row.isMargin ? "融資" : "現股" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="買進均價" width="110" align="right">
            <template #default="{ row }">NT${{ row.buyPrice }}</template>
          </el-table-column>
          <el-table-column label="持有成本" width="130" align="right">
            <template #default="{ row }">NT${{ Number(row.totalCost).toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="建倉時間" width="110" />
        </el-table>
      </div>

      <!-- ── 歷史交易記錄 ── -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="px-4 py-3 font-medium border-b border-gray-100 dark:border-gray-800">
          歷史交易記錄（{{ detail.trades.length }} 筆）
        </div>
        <div v-if="!detail.trades.length" class="py-8 text-center text-gray-400">尚無交易記錄</div>
        <el-table v-else :data="detail.trades" size="small" border stripe>
          <el-table-column label="股票" min-width="160">
            <template #default="{ row }">
              <span
                class="text-primary cursor-pointer hover:underline"
                @click="goQuery(row.stockCode)"
              >{{ row.stockName }}（{{ row.stockCode }}）</span>
            </template>
          </el-table-column>
          <el-table-column label="張數" min-width="140">
            <template #default="{ row }">{{ fmtShares(row.sellShares) }}</template>
          </el-table-column>
          <el-table-column label="類型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.isMargin ? 'warning' : 'primary'" size="small">
                {{ row.isMargin ? "融資" : "現股" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="買進均價" width="110" align="right">
            <template #default="{ row }">NT${{ row.buyPrice }}</template>
          </el-table-column>
          <el-table-column label="賣出價格" width="110" align="right">
            <template #default="{ row }">NT${{ row.sellPrice }}</template>
          </el-table-column>
          <el-table-column label="損益" width="130" align="right">
            <template #default="{ row }">
              <div :class="row.profit >= 0 ? 'text-red-500' : 'text-green-500'" class="font-medium">
                {{ row.profit >= 0 ? "+" : "" }}NT${{ Number(row.profit).toLocaleString() }}
              </div>
              <div v-if="row.profitPct !== null" class="text-xs" :class="row.profit >= 0 ? 'text-red-400' : 'text-green-400'">
                {{ row.profit >= 0 ? "+" : "" }}{{ row.profitPct }}%
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="時間" width="100" />
        </el-table>
      </div>
    </template>
  </div>
</template>
