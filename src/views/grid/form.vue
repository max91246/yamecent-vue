<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  getGridStrategy,
  createGridStrategy,
  updateGridStrategy,
  getGridTicker
} from "@/api/grid";

defineOptions({ name: "GridForm" });

const route  = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const id     = computed(() => Number(route.params.id));

const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const ticker  = ref<any>(null);

const form = reactive({
  name:            "",
  market:          "btcusdt",
  grid_type:       "arithmetic" as "arithmetic" | "geometric",
  price_lower:     0,
  price_upper:     0,
  stop_loss:       null as number | null,
  take_profit:     null as number | null,
  grid_count:      10,
  amount_per_grid: 10
});

const rules: FormRules = {
  name:            [{ required: true, message: "請輸入策略名稱" }],
  market:          [{ required: true, message: "請選擇交易對" }],
  price_lower:     [{ required: true, type: "number", min: 0.001, message: "請輸入下限" }],
  price_upper:     [{ required: true, type: "number", min: 0.001, message: "請輸入上限" }],
  grid_count:      [{ required: true, type: "number", min: 2, max: 100, message: "格數 2~100" }],
  amount_per_grid: [{ required: true, type: "number", min: 1, message: "每格至少 1" }]
};

// 等差間距 or 等比漲幅
const gridStep = computed(() => {
  if (!form.price_lower || !form.price_upper || !form.grid_count) return "0";
  if (form.grid_type === "geometric") {
    const ratio = Math.pow(form.price_upper / form.price_lower, 1 / form.grid_count);
    return ((ratio - 1) * 100).toFixed(4) + "%";
  }
  return ((form.price_upper - form.price_lower) / form.grid_count).toFixed(4);
});
const totalFund = computed(() => (form.amount_per_grid * form.grid_count).toFixed(2));
const gridPrices = computed(() => {
  if (!form.price_lower || !form.price_upper || !form.grid_count) return [];
  if (form.grid_type === "geometric") {
    const ratio = Math.pow(form.price_upper / form.price_lower, 1 / form.grid_count);
    return Array.from({ length: form.grid_count + 1 }, (_, i) =>
      Math.round(form.price_lower * Math.pow(ratio, i) * 100) / 100
    );
  }
  const step = (form.price_upper - form.price_lower) / form.grid_count;
  return Array.from({ length: form.grid_count + 1 }, (_, i) =>
    Math.round((form.price_lower + step * i) * 100) / 100
  );
});

const markets = [
  { label: "BTC/USDT", value: "btcusdt", quote: "USDT" },
  { label: "ETH/USDT", value: "ethusdt", quote: "USDT" },
  { label: "BTC/TWD",  value: "btctwd",  quote: "TWD"  },
  { label: "ETH/TWD",  value: "ethtwd",  quote: "TWD"  },
  { label: "USDT/TWD", value: "usdttwd", quote: "TWD"  }
];

// 計價幣：依交易對動態決定
const quoteCurrency = computed(() =>
  markets.find(m => m.value === form.market)?.quote ?? "USDT"
);

async function fetchTicker() {
  if (!form.market) return;
  try {
    const res = await getGridTicker(form.market);
    ticker.value = res.data ?? null;
  } catch {
    ticker.value = null;
  }
}

function fillCurrentPrice() {
  if (!ticker.value?.last) return;
  const price = Number(ticker.value.last);
  form.price_lower = Math.round(price * 0.95);
  form.price_upper = Math.round(price * 1.05);
}

async function handleSubmit() {
  await formRef.value?.validate();
  if (form.price_upper <= form.price_lower) {
    ElMessage.error("上限必須大於下限");
    return;
  }
  submitting.value = true;
  try {
    const payload = { ...form };
    const res = isEdit.value
      ? await updateGridStrategy(id.value, payload)
      : await createGridStrategy(payload);
    if (res.code === 200 || res.code === 201) {
      ElMessage.success(isEdit.value ? "更新成功" : "建立成功");
      router.push("/grid/list");
    }
  } finally {
    submitting.value = false;
  }
}

watch(() => form.market, fetchTicker);

onMounted(async () => {
  await fetchTicker();
  if (isEdit.value) {
    loading.value = true;
    const res = await getGridStrategy(id.value);
    if (res.data) {
      Object.assign(form, {
        name:            res.data.name,
        market:          res.data.market,
        grid_type:       res.data.grid_type ?? "arithmetic",
        price_lower:     res.data.price_lower,
        price_upper:     res.data.price_upper,
        stop_loss:       res.data.stop_loss   ?? null,
        take_profit:     res.data.take_profit ?? null,
        grid_count:      res.data.grid_count,
        amount_per_grid: res.data.amount_per_grid
      });
    }
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-4 max-w-2xl" v-loading="loading">
    <div class="flex items-center gap-3 mb-6">
      <el-button @click="router.push('/grid/list')" link>← 返回</el-button>
      <h2 class="text-lg font-semibold">{{ isEdit ? "編輯策略" : "新增網格策略" }}</h2>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-divider content-position="left">基本設定</el-divider>

      <el-form-item label="策略名稱" prop="name">
        <el-input v-model="form.name" placeholder="例如：BTC 震盪網格" />
      </el-form-item>

      <el-form-item label="交易對" prop="market">
        <div class="flex gap-2 w-full">
          <el-select v-model="form.market" class="flex-1">
            <el-option v-for="m in markets" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
          <el-button @click="fetchTicker">查市價</el-button>
        </div>
        <div v-if="ticker" class="text-sm text-gray-500 mt-1">
          現價：<b>{{ Number(ticker.last).toLocaleString() }}</b>
          買一：{{ Number(ticker.buy).toLocaleString() }}
          賣一：{{ Number(ticker.sell).toLocaleString() }}
        </div>
      </el-form-item>

      <el-divider content-position="left">網格設定</el-divider>

      <!-- 網格類型 -->
      <el-form-item label="網格類型" prop="grid_type">
        <el-radio-group v-model="form.grid_type">
          <el-radio-button value="arithmetic">
            等差網格<span class="text-xs text-gray-400 ml-1">（每格固定差額）</span>
          </el-radio-button>
          <el-radio-button value="geometric">
            等比網格<span class="text-xs text-gray-400 ml-1">（每格固定漲跌%）</span>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="價格下限" prop="price_lower">
        <el-input-number v-model="form.price_lower" :min="0" :precision="2" :step="100" class="w-full!" />
      </el-form-item>

      <el-form-item label="價格上限" prop="price_upper">
        <el-input-number v-model="form.price_upper" :min="0" :precision="2" :step="100" class="w-full!" />
        <el-button v-if="ticker" size="small" class="mt-1" @click="fillCurrentPrice">
          自動填入現價 ±5%
        </el-button>
      </el-form-item>

      <el-form-item label="格數" prop="grid_count">
        <el-input-number v-model="form.grid_count" :min="2" :max="100" class="w-full!" />
      </el-form-item>

      <el-form-item label="每格金額" prop="amount_per_grid">
        <el-input-number v-model="form.amount_per_grid" :min="1" :precision="2" class="w-full!" />
        <span class="text-gray-400 text-sm ml-2">{{ quoteCurrency }}</span>
      </el-form-item>

      <!-- 進階設定：止損 / 止盈 -->
      <el-divider content-position="left">進階設定（選填）</el-divider>

      <el-form-item label="止損價" prop="stop_loss">
        <el-input-number
          v-model="form.stop_loss"
          :min="0" :precision="2" :step="1000"
          :placeholder="`低於下限即觸發，建議 < ${form.price_lower.toLocaleString()}`"
          class="w-full!"
          :controls="false"
        />
        <div class="text-xs text-gray-400 mt-1">
          跌破此價 → 自動取消所有掛單並停止策略（留空=不設定）
        </div>
      </el-form-item>

      <el-form-item label="止盈價" prop="take_profit">
        <el-input-number
          v-model="form.take_profit"
          :min="0" :precision="2" :step="1000"
          :placeholder="`高於上限即觸發，建議 > ${form.price_upper.toLocaleString()}`"
          class="w-full!"
          :controls="false"
        />
        <div class="text-xs text-gray-400 mt-1">
          突破此價 → 自動取消所有掛單並停止策略（留空=不設定）
        </div>
      </el-form-item>

      <el-divider content-position="left">預覽計算</el-divider>

      <el-descriptions :column="2" border size="small" class="mb-4">
        <el-descriptions-item :label="form.grid_type === 'geometric' ? '每格漲跌幅' : '每格間距'">
          {{ gridStep }}{{ form.grid_type === 'arithmetic' ? ` ${quoteCurrency}` : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="總資金需求">{{ totalFund }} {{ quoteCurrency }}</el-descriptions-item>
        <el-descriptions-item label="格數">{{ form.grid_count }}</el-descriptions-item>
        <el-descriptions-item label="現價位置">
          <span v-if="ticker && form.price_lower && form.price_upper">
            {{ ((Number(ticker.last) - form.price_lower) / (form.price_upper - form.price_lower) * 100).toFixed(1) }}%（區間內）
          </span>
          <span v-else>—</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-collapse class="mb-4">
        <el-collapse-item title="查看所有格線價格">
          <div class="grid grid-cols-4 gap-1 text-sm">
            <div
              v-for="(price, i) in gridPrices" :key="i"
              class="px-2 py-1 rounded text-center"
              :class="ticker && Number(ticker.last) >= price && Number(ticker.last) < gridPrices[i + 1]
                ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-50'"
            >{{ Number(price).toLocaleString() }}</div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? "儲存變更" : "建立策略" }}
        </el-button>
        <el-button @click="router.push('/grid/list')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
