<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getGridStrategy, getGridOrders, getGridTrades, getGridTicker } from "@/api/grid";

defineOptions({ name: "GridDetail" });

const quoteMap: Record<string, string> = {
  btcusdt: "USDT", ethusdt: "USDT",
  btctwd:  "TWD",  ethtwd:  "TWD",  usdttwd: "TWD"
};
const getQuote = (market?: string) => quoteMap[market?.toLowerCase() ?? ""] ?? "USDT";

const route    = useRoute();
const router   = useRouter();
const id       = Number(route.params.id);
const loading  = ref(true);
const strategy = ref<any>(null);
const orders   = ref<any[]>([]);
const trades   = ref<any[]>([]);
const ticker   = ref<any>(null);
const activeTab = ref("orders");

async function fetchAll() {
  loading.value = true;
  try {
    const [sRes, oRes, tRes] = await Promise.all([
      getGridStrategy(id),
      getGridOrders(id),
      getGridTrades(id),
    ]);
    strategy.value = sRes.data;
    orders.value   = oRes.data ?? [];
    trades.value   = tRes.data ?? [];
    if (strategy.value?.market) {
      const tkRes = await getGridTicker(strategy.value.market);
      ticker.value = tkRes.data ?? null;
    }
  } finally {
    loading.value = false;
  }
}

function pricePercent(price: number) {
  const s = strategy.value;
  if (!s) return 0;
  return ((price - s.price_lower) / (s.price_upper - s.price_lower)) * 100;
}

const buyOrders  = () => orders.value.filter(o => o.side === "buy");
const sellOrders = () => orders.value.filter(o => o.side === "sell");

onMounted(fetchAll);
</script>

<template>
  <div class="p-4" v-loading="loading">
    <div class="flex items-center gap-3 mb-4">
      <el-button @click="router.push('/grid/list')" link>← 返回</el-button>
      <h2 class="text-lg font-semibold">{{ strategy?.name ?? '策略詳情' }}</h2>
      <el-tag :type="strategy?.status === 'running' ? 'success' : 'info'" size="small">
        {{ strategy?.status }}
      </el-tag>
    </div>

    <template v-if="strategy">
      <!-- 統計卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <el-card shadow="never" class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ Number(strategy.total_profit ?? 0).toFixed(4) }}
          </div>
          <div class="text-gray-400 text-sm mt-1">總獲利 ({{ getQuote(strategy?.market) }})</div>
        </el-card>
        <el-card shadow="never" class="text-center">
          <div class="text-2xl font-bold">{{ strategy.filled_count ?? 0 }}</div>
          <div class="text-gray-400 text-sm mt-1">總成交次數</div>
        </el-card>
        <el-card shadow="never" class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ ticker ? Number(ticker.last).toLocaleString() : '—' }}
          </div>
          <div class="text-gray-400 text-sm mt-1">現價</div>
        </el-card>
        <el-card shadow="never" class="text-center">
          <div class="text-2xl font-bold">{{ orders.length }}</div>
          <div class="text-gray-400 text-sm mt-1">掛單中</div>
        </el-card>
      </div>

      <!-- 網格視覺化 -->
      <el-card shadow="never" class="mb-4">
        <template #header>網格區間</template>
        <div class="relative h-10 bg-gray-100 rounded overflow-hidden">
          <!-- 買單標記 -->
          <div
            v-for="o in buyOrders()" :key="o.id"
            class="absolute top-0 w-1 h-full bg-green-400 opacity-70"
            :style="{ left: pricePercent(o.price) + '%' }"
            :title="`買 ${o.price}`"
          />
          <!-- 賣單標記 -->
          <div
            v-for="o in sellOrders()" :key="o.id"
            class="absolute top-0 w-1 h-full bg-red-400 opacity-70"
            :style="{ left: pricePercent(o.price) + '%' }"
            :title="`賣 ${o.price}`"
          />
          <!-- 現價 -->
          <div
            v-if="ticker"
            class="absolute top-0 w-0.5 h-full bg-blue-600"
            :style="{ left: pricePercent(Number(ticker.last)) + '%' }"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>{{ Number(strategy.price_lower).toLocaleString() }}</span>
          <span>{{ Number(strategy.price_upper).toLocaleString() }}</span>
        </div>
      </el-card>

      <!-- 訂單 / 交易記錄 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="掛單中" name="orders">
          <el-table :data="orders" size="small" stripe>
            <el-table-column prop="side" label="方向" width="70">
              <template #default="{ row }">
                <el-tag :type="row.side === 'buy' ? 'success' : 'danger'" size="small">
                  {{ row.side === 'buy' ? '買' : '賣' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price"  label="價格"  />
            <el-table-column prop="volume" label="數量"  />
            <el-table-column prop="status" label="狀態"  />
            <el-table-column prop="max_order_id" label="MAX 訂單 ID" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="成交記錄" name="trades">
          <el-table :data="trades" size="small" stripe>
            <el-table-column prop="side"   label="方向" width="70">
              <template #default="{ row }">
                <el-tag :type="row.side === 'buy' ? 'success' : 'danger'" size="small">
                  {{ row.side === 'buy' ? '買' : '賣' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price"   label="成交價" />
            <el-table-column prop="volume"  label="數量"   />
            <el-table-column prop="profit"  label="獲利"   >
              <template #default="{ row }">
                <span :class="Number(row.profit) >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ Number(row.profit ?? 0).toFixed(4) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="時間" width="170" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>
