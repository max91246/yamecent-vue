<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useECharts } from "@pureadmin/utils";
import { getDashboardStats } from "@/api/dashboard";

defineOptions({ name: "Welcome" });

const loading = ref(true);
const stats = ref<any>(null);

const videoChartRef = ref();
const { setOptions: setVideoChart } = useECharts(videoChartRef);

const msgChartRef = ref();
const { setOptions: setMsgChart } = useECharts(msgChartRef);

async function fetchStats() {
  loading.value = true;
  const res = await getDashboardStats();
  if (res.code !== 0) return;
  stats.value = res.data;
  loading.value = false;
  await nextTick();
  renderCharts(res.data);
}

function renderCharts(data: any) {
  const videoDates = data.videoTrend.map((d: any) => d.date.slice(5));
  const videoCounts = data.videoTrend.map((d: any) => d.count);
  setVideoChart({
    tooltip: { trigger: "axis" },
    grid: { top: 30, bottom: 30, left: 45, right: 20 },
    xAxis: { type: "category", data: videoDates, axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "入庫影片",
        type: "line",
        data: videoCounts,
        smooth: true,
        areaStyle: { opacity: 0.15 },
        itemStyle: { color: "#3b82f6" },
        lineStyle: { color: "#3b82f6" }
      }
    ]
  });

  const msgDates = data.msgTrend.map((d: any) => d.date.slice(5));
  const msgReceive = data.msgTrend.map((d: any) => d.receive);
  const msgReply = data.msgTrend.map((d: any) => d.reply);
  setMsgChart({
    tooltip: { trigger: "axis" },
    legend: { data: ["收到", "回覆"], top: 0 },
    grid: { top: 35, bottom: 30, left: 40, right: 20 },
    xAxis: { type: "category", data: msgDates, axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "收到",
        type: "bar",
        data: msgReceive,
        itemStyle: { color: "#6366f1" }
      },
      {
        name: "回覆",
        type: "bar",
        data: msgReply,
        itemStyle: { color: "#10b981" }
      }
    ]
  });
}

onMounted(fetchStats);
</script>

<template>
  <div v-loading="loading" class="p-5">
    <template v-if="stats">
      <!-- 數字卡片 -->
      <el-row :gutter="16" class="mb-5">
        <el-col
          v-for="card in [
            {
              label: '文章總數',
              value: stats.cards.articles.total,
              sub: `今日 +${stats.cards.articles.today}`,
              icon: 'ri-article-line',
              color: '#3b82f6'
            },
            {
              label: '會員總數',
              value: stats.cards.members.total,
              sub: `今日 +${stats.cards.members.today}`,
              icon: 'ri-user-3-line',
              color: '#8b5cf6'
            },
            {
              label: 'AV 影片',
              value: stats.cards.avVideos.total,
              sub: `昨日入庫 ${stats.cards.avVideos.today}`,
              icon: 'ri-film-line',
              color: '#ec4899'
            },
            {
              label: 'AV 女優',
              value: stats.cards.avActresses.total,
              sub: `今日 +${stats.cards.avActresses.today}`,
              icon: 'ri-user-heart-line',
              color: '#f59e0b'
            },
            {
              label: 'TG 今日訊息',
              value: stats.cards.tgMessages.today,
              sub: `累計 ${stats.cards.tgMessages.total}`,
              icon: 'ri-telegram-line',
              color: '#06b6d4'
            },
            {
              label: '處置中股票',
              value: stats.cards.disposalActive.total,
              sub: '當前有效',
              icon: 'ri-alarm-warning-line',
              color: '#ef4444'
            }
          ]"
          :key="card.label"
          :xs="12"
          :sm="8"
          :md="4"
          class="mb-3"
        >
          <el-card shadow="hover">
            <div class="flex items-center gap-3">
              <div
                class="size-11 rounded-xl flex-c shrink-0"
                :style="`background:${card.color}1a`"
              >
                <i
                  :class="card.icon"
                  :style="`color:${card.color};font-size:20px`"
                />
              </div>
              <div>
                <div class="text-gray-400 text-xs">{{ card.label }}</div>
                <div class="text-xl/tight font-bold">
                  {{ Number(card.value).toLocaleString() }}
                </div>
                <div class="text-xs text-gray-400">{{ card.sub }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 圖表 -->
      <el-row :gutter="16" class="mb-5">
        <el-col :md="14" class="mb-3">
          <el-card shadow="never">
            <template #header
              ><span class="font-medium"
                >影片每日入庫趨勢（近 14 天）</span
              ></template
            >
            <div ref="videoChartRef" style="height: 220px" />
          </el-card>
        </el-col>
        <el-col :md="10" class="mb-3">
          <el-card shadow="never">
            <template #header
              ><span class="font-medium"
                >TG Bot 訊息量（近 7 天）</span
              ></template
            >
            <div ref="msgChartRef" style="height: 220px" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 列表 -->
      <el-row :gutter="16">
        <el-col :md="14" class="mb-3">
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center gap-2">
                <i class="ri-alarm-warning-line text-red-500" />
                <span class="font-medium"
                  >當前處置股（{{ stats.disposals.length }} 筆）</span
                >
              </div>
            </template>
            <el-table :data="stats.disposals" size="small">
              <el-table-column label="市場" width="60">
                <template #default="{ row }">
                  <el-tag
                    :type="row.market === 'twse' ? 'primary' : 'warning'"
                    size="small"
                  >
                    {{ row.market === "twse" ? "上市" : "上櫃" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="stockCode" label="代號" width="75" />
              <el-table-column prop="stockName" label="名稱" width="100" />
              <el-table-column prop="endDate" label="截止日" width="100" />
              <el-table-column
                prop="reason"
                label="原因"
                show-overflow-tooltip
              />
            </el-table>
          </el-card>
        </el-col>

        <el-col :md="10" class="mb-3">
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center gap-2">
                <i class="ri-trophy-line text-yellow-500" />
                <span class="font-medium">TG 損益排行（前 5）</span>
              </div>
            </template>
            <el-table :data="stats.profitRank" size="small">
              <el-table-column label="#" width="45" align="center">
                <template #default="{ $index }">
                  <span
                    :class="{
                      'text-yellow-500 font-bold': $index === 0,
                      'text-gray-400 font-bold': $index === 1,
                      'text-orange-400 font-bold': $index === 2
                    }"
                  >
                    {{ $index + 1 }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="chatId" label="Chat ID" />
              <el-table-column
                prop="tradeCount"
                label="交易"
                width="60"
                align="center"
              />
              <el-table-column label="累計損益" width="110" align="right">
                <template #default="{ row }">
                  <span
                    :class="
                      row.totalProfit >= 0
                        ? 'text-green-500 font-medium'
                        : 'text-red-500 font-medium'
                    "
                  >
                    {{ Number(row.totalProfit).toLocaleString() }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>
