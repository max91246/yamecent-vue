<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getGridStrategies,
  deleteGridStrategy,
  startGridStrategy,
  stopGridStrategy,
  getGridBalance
} from "@/api/grid";

defineOptions({ name: "GridIndex" });

const router = useRouter();
const loading = ref(false);
const strategies = ref<any[]>([]);
const balance = ref<any>(null);

const statusMap: Record<string, { label: string; type: string }> = {
  idle:     { label: "閒置", type: "info" },
  running:  { label: "執行中", type: "success" },
  stopped:  { label: "已停止", type: "warning" },
  error:    { label: "錯誤", type: "danger" },
};

async function fetchAll() {
  loading.value = true;
  try {
    const [sRes, bRes] = await Promise.all([getGridStrategies(), getGridBalance()]);
    strategies.value = sRes.data ?? [];
    balance.value = bRes.data ?? null;
  } finally {
    loading.value = false;
  }
}

async function handleStart(row: any) {
  await startGridStrategy(row.id);
  ElMessage.success("已啟動，請用 artisan 指令執行策略");
  fetchAll();
}

async function handleStop(row: any) {
  await stopGridStrategy(row.id);
  ElMessage.success("已停止");
  fetchAll();
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確定刪除「${row.name}」？`, "確認", { type: "warning" });
  await deleteGridStrategy(row.id);
  ElMessage.success("已刪除");
  fetchAll();
}

onMounted(fetchAll);
</script>

<template>
  <div class="p-4">
    <!-- 標題列 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">網格交易策略</h2>
      <el-button type="primary" @click="router.push('/grid/create')">+ 新增策略</el-button>
    </div>

    <!-- 帳戶餘額 -->
    <el-card v-if="balance" class="mb-4" shadow="never">
      <div class="flex gap-6 flex-wrap">
        <div v-for="item in balance" :key="item.currency" class="text-sm">
          <span class="text-gray-500">{{ item.currency.toUpperCase() }}</span>
          <span class="ml-2 font-mono font-semibold">{{ Number(item.available).toLocaleString() }}</span>
          <span class="text-gray-400 ml-1">/ {{ Number(item.balance).toLocaleString() }}</span>
        </div>
      </div>
    </el-card>

    <!-- 策略列表 -->
    <div v-loading="loading">
      <el-empty v-if="!strategies.length" description="尚無策略，點右上角新增" />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <el-card
          v-for="s in strategies"
          :key="s.id"
          shadow="hover"
          class="cursor-pointer"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold text-base">{{ s.name }}</div>
              <div class="text-gray-400 text-sm mt-1">{{ s.market.toUpperCase() }}</div>
            </div>
            <el-tag :type="statusMap[s.status]?.type ?? 'info'" size="small">
              {{ statusMap[s.status]?.label ?? s.status }}
            </el-tag>
          </div>

          <el-divider class="my-3" />

          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="下限">{{ Number(s.price_lower).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="上限">{{ Number(s.price_upper).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="格數">{{ s.grid_count }}</el-descriptions-item>
            <el-descriptions-item label="每格">{{ s.amount_per_grid }} USDT</el-descriptions-item>
            <el-descriptions-item label="已成交">{{ s.filled_count ?? 0 }} 次</el-descriptions-item>
            <el-descriptions-item label="獲利">
              <span :class="Number(s.total_profit) >= 0 ? 'text-green-600' : 'text-red-500'">
                {{ Number(s.total_profit ?? 0).toFixed(4) }} USDT
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <div class="flex gap-2 mt-3 flex-wrap">
            <el-button size="small" @click="router.push(`/grid/${s.id}`)">詳情</el-button>
            <el-button size="small" @click="router.push(`/grid/${s.id}/edit`)">編輯</el-button>
            <el-button
              v-if="s.status !== 'running'"
              size="small" type="success"
              @click="handleStart(s)"
            >啟動</el-button>
            <el-button
              v-else
              size="small" type="warning"
              @click="handleStop(s)"
            >停止</el-button>
            <el-button size="small" type="danger" @click="handleDelete(s)">刪除</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
