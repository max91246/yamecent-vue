<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { getStockQuery } from "@/api/stock";

defineOptions({ name: "StockQuery" });

const code       = ref("");
const loading    = ref(false);
const quote      = ref<any>(null);
const history    = ref<any[]>([]);
const instit     = ref<any[]>([]);
const dist       = ref<any[]>([]);
const revenue    = ref<any[]>([]);
const news       = ref<any[]>([]);

let chart: echarts.ECharts | null = null;
const chartRef = ref<HTMLDivElement | null>(null);

async function doQuery() {
  if (!code.value.trim()) return;
  loading.value = true;
  quote.value   = null;
  history.value = [];
  instit.value  = [];
  dist.value    = [];
  revenue.value = [];
  news.value    = [];

  const res = await getStockQuery(code.value.trim());
  if (res.code === 0 && res.data) {
    quote.value   = res.data.quote;
    history.value = res.data.history    ?? [];
    instit.value  = res.data.institutional ?? [];
    dist.value    = res.data.distribution  ?? [];
    revenue.value = res.data.revenue       ?? [];
    news.value    = res.data.news          ?? [];
    await nextTick();
    renderChart();
  }
  loading.value = false;
}

function renderChart() {
  if (!chartRef.value || !history.value.length) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  const dates  = history.value.map(r => r.date).reverse();
  const kData  = history.value.map(r => [r.open, r.close, r.low, r.high]).reverse();
  const vData  = history.value.map(r => r.volume).reverse();
  const upColor   = "#ef232a";
  const downColor = "#14b143";

  chart.setOption({
    backgroundColor: "transparent",
    animation: false,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter(params: any[]) {
        const k = params.find(p => p.seriesName === "K線");
        const v = params.find(p => p.seriesName === "成交量");
        if (!k) return "";
        const [o, c, l, h] = k.value;
        const color = c >= o ? upColor : downColor;
        return `<div style="font-size:12px">
          <b>${k.name}</b><br/>
          開 ${o} &nbsp; 高 <span style="color:${upColor}">${h}</span><br/>
          低 <span style="color:${downColor}">${l}</span> &nbsp; 收 <b style="color:${color}">${c}</b><br/>
          成交量 ${(v?.value ?? 0).toLocaleString()} 張
        </div>`;
      }
    },
    grid: [
      { left: 60, right: 20, top: 10, bottom: 100 },
      { left: 60, right: 20, height: 60, bottom: 20 }
    ],
    xAxis: [
      { type: "category", data: dates, gridIndex: 0, axisLabel: { fontSize: 11 }, boundaryGap: true },
      { type: "category", data: dates, gridIndex: 1, axisLabel: { show: false } }
    ],
    yAxis: [
      { type: "value", gridIndex: 0, scale: true, axisLabel: { fontSize: 11 } },
      { type: "value", gridIndex: 1, scale: true, axisLabel: { show: false }, splitLine: { show: false } }
    ],
    series: [
      {
        name: "K線",
        type: "candlestick",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: kData,
        itemStyle: { color: upColor, color0: downColor, borderColor: upColor, borderColor0: downColor }
      },
      {
        name: "成交量",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: vData.map((v, i) => ({
          value: Math.round(v / 1000),
          itemStyle: { color: kData[i][1] >= kData[i][0] ? upColor : downColor }
        }))
      }
    ]
  });
}

function onResize() { chart?.resize(); }

onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  chart?.dispose();
});

function changeColor(val: number | null) {
  if (val === null || val === undefined) return "";
  return val > 0 ? "text-red-500" : val < 0 ? "text-green-500" : "";
}
function changePrefix(val: number | null) {
  if (!val) return "";
  return val > 0 ? "▲" : "▼";
}
</script>

<template>
  <div class="p-4">
    <!-- 搜尋列 -->
    <div class="flex items-center gap-3 mb-6">
      <el-input
        v-model="code"
        placeholder="輸入股票代號（如 6217）"
        class="w-56!"
        clearable
        @keyup.enter="doQuery"
      />
      <el-button type="primary" :loading="loading" @click="doQuery">查詢</el-button>
    </div>

    <div v-if="loading" class="py-24 text-center text-gray-400">資料載入中，請稍候...</div>

    <template v-if="!loading && quote">
      <!-- 股票 Header -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4 bg-white dark:bg-gray-900 flex justify-between items-start">
        <div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ quote.name }}</div>
          <div class="text-sm text-gray-400 mt-1">{{ quote.ticker }}</div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold" :class="changeColor(quote.change)">
            NT${{ quote.price?.toFixed(2) }}
          </div>
          <div class="text-sm mt-1" :class="changeColor(quote.change)">
            {{ quote.change > 0 ? "+" : "" }}{{ quote.change?.toFixed(2) }}
            （{{ quote.change > 0 ? "+" : "" }}{{ quote.changePct?.toFixed(2) }}%）
          </div>
          <div class="text-xs text-gray-400 mt-0.5">
            成交量：{{ (quote.volume / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) }} 張
          </div>
        </div>
      </div>

      <!-- K線圖 -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 bg-white dark:bg-gray-900">
        <div class="text-sm font-semibold text-gray-500 mb-3">近22個交易日股價走勢</div>
        <div ref="chartRef" class="w-full" style="height: 360px;" />
      </div>

      <!-- 日K資料表 -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 mb-4 bg-white dark:bg-gray-900 overflow-hidden">
        <el-table :data="history" size="small" stripe border class="w-full">
          <el-table-column prop="date" label="日期" width="130">
            <template #default="{ row }">
              {{ row.date }}（{{ ["日","一","二","三","四","五","六"][new Date(row.date).getDay()] }}）
            </template>
          </el-table-column>
          <el-table-column prop="open"  label="開盤" width="90" align="right">
            <template #default="{ row }">{{ row.open?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="high"  label="最高" width="90" align="right">
            <template #default="{ row }">
              <span class="text-red-500 font-medium">{{ row.high?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="low"   label="最低" width="90" align="right">
            <template #default="{ row }">
              <span class="text-green-500 font-medium">{{ row.low?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="close" label="收盤" width="90" align="right">
            <template #default="{ row }"><b>{{ row.close?.toFixed(2) }}</b></template>
          </el-table-column>
          <el-table-column label="漲跌" min-width="160" align="right">
            <template #default="{ row }">
              <span :class="changeColor(row.change)" class="font-medium">
                <template v-if="row.change !== null">
                  {{ row.change > 0 ? "+" : "" }}{{ row.change?.toFixed(2) }}
                  （{{ row.changePct > 0 ? "+" : "" }}{{ row.changePct?.toFixed(2) }}%）
                </template>
                <template v-else>-</template>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="成交量（張）" min-width="120" align="right">
            <template #default="{ row }">
              {{ Math.round(row.volume / 1000).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 三大法人 + 月營收 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <!-- 三大法人 -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="px-4 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800">
            近10日三大法人買賣超（張）
          </div>
          <div v-if="!instit.length" class="py-8 text-center text-gray-400 text-sm">無資料</div>
          <el-table v-else :data="instit" size="small" stripe border>
            <el-table-column prop="date"    label="日期"   width="110" />
            <el-table-column label="外資" align="right" width="90">
              <template #default="{ row }">
                <span :class="changeColor(row.foreign)" class="font-medium">
                  {{ row.foreign > 0 ? "+" : "" }}{{ row.foreign?.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="投信" align="right" width="90">
              <template #default="{ row }">
                <span :class="changeColor(row.trust)" class="font-medium">
                  {{ row.trust > 0 ? "+" : "" }}{{ row.trust?.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="自營" align="right" width="90">
              <template #default="{ row }">
                <span :class="changeColor(row.dealer)" class="font-medium">
                  {{ row.dealer > 0 ? "+" : "" }}{{ row.dealer?.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 月營收 -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="px-4 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800">
            月營收（千元）
          </div>
          <div v-if="!revenue.length" class="py-8 text-center text-gray-400 text-sm">無資料</div>
          <el-table v-else :data="revenue" size="small" stripe border>
            <el-table-column prop="month"   label="月份"   width="80" />
            <el-table-column label="營收" align="right" min-width="100">
              <template #default="{ row }">{{ row.revenue?.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="月增" align="right" width="90">
              <template #default="{ row }">
                <span v-if="row.momPct" :class="row.momPct?.startsWith('-') ? 'text-green-500' : 'text-red-500'">
                  {{ changePrefix(row.momPct?.startsWith('-') ? -1 : 1) }}{{ row.momPct }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </template>
            </el-table-column>
            <el-table-column label="年增" align="right" width="90">
              <template #default="{ row }">
                <span v-if="row.yoyPct" :class="row.yoyPct?.startsWith('-') ? 'text-green-500' : 'text-red-500'">
                  {{ changePrefix(row.yoyPct?.startsWith('-') ? -1 : 1) }}{{ row.yoyPct }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 大戶持股分散表 -->
      <div v-if="dist.length" class="rounded-xl border border-gray-200 dark:border-gray-700 mb-4 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="px-4 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span>近10週大戶持股分散表</span>
          <span class="text-xs text-gray-400">資料來源：集保結算所</span>
        </div>
        <el-table :data="dist" size="small" stripe border class="text-xs!">
          <el-table-column prop="date"          label="資料日期"    width="110" />
          <el-table-column prop="totalHolders"  label="總股東人數"  width="110" align="right">
            <template #default="{ row }">{{ row.totalHolders?.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="avgShares"     label="平均張數/人" width="110" align="right" />
          <el-table-column prop="over400count"  label=">400張人數"  width="100" align="right" />
          <el-table-column prop="over400pct"    label=">400張持有%" width="110" align="right">
            <template #default="{ row }">{{ row.over400pct?.toFixed(2) }}%</template>
          </el-table-column>
          <el-table-column prop="b400to600"     label="400~600張"   width="90"  align="right" />
          <el-table-column prop="b600to800"     label="600~800張"   width="90"  align="right" />
          <el-table-column prop="b800to1000"    label="800~1000張"  width="100" align="right" />
          <el-table-column prop="over1000count" label=">1000張人數" width="110" align="right" />
          <el-table-column prop="over1000pct"   label=">1000張持有%" width="120" align="right">
            <template #default="{ row }">
              <b class="text-red-500">{{ row.over1000pct?.toFixed(2) }}%</b>
            </template>
          </el-table-column>
          <el-table-column prop="closePrice"    label="收盤價"      width="90"  align="right" />
        </el-table>
      </div>

      <!-- 相關新聞 -->
      <div v-if="news.length" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="px-4 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800">
          相關新聞
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <a
            v-for="n in news"
            :key="n.url"
            :href="n.url"
            target="_blank"
            class="flex justify-between items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span class="text-sm text-gray-800 dark:text-gray-200 flex-1 mr-4 hover:text-primary">{{ n.title }}</span>
            <span class="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{{ n.publishedAt }}</span>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
