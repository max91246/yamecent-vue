<template>
  <div class="p-4">
    <el-card>
      <template #header>
        <span class="font-bold text-base">🎮 Mezastar 寶可夢卡牌資料庫</span>
      </template>

      <!-- 篩選列 -->
      <el-form :inline="true" class="mb-4" @submit.prevent="fetchCards">
        <el-form-item label="彈數">
          <el-select v-model="filters.series" clearable placeholder="全部" style="width:130px">
            <el-option v-for="s in seriesList" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="屬性">
          <el-select v-model="filters.type" clearable placeholder="全部" style="width:110px">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="弱點">
          <el-select v-model="filters.weakness" clearable placeholder="全部" style="width:110px">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="名稱">
          <el-input v-model="filters.name" clearable placeholder="搜尋名稱" style="width:130px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="fetchCards">查詢</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 統計標籤 -->
      <div class="mb-3 flex gap-2 flex-wrap">
        <el-tag
          v-for="s in seriesList"
          :key="s"
          :type="filters.series === s ? 'primary' : 'info'"
          class="cursor-pointer"
          @click="quickFilterSeries(s)"
        >{{ s }}</el-tag>
      </div>

      <!-- 卡牌表格 -->
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="series" label="彈數" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="seriesTagType(row.series)">{{ row.series }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名稱" width="110" align="center">
          <template #default="{ row }">
            <span class="font-bold">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="屬性" width="140" align="center">
          <template #default="{ row }">
            <el-tag :color="typeColor(row.type1)" class="mr-1" effect="dark" size="small">{{ row.type1 }}</el-tag>
            <el-tag v-if="row.type2" :color="typeColor(row.type2)" effect="dark" size="small">{{ row.type2 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="move_type" label="招式屬性" width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="typeColor(row.move_type)" effect="dark" size="small">{{ row.move_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="弱點" align="center">
          <template #default="{ row }">
            <el-tag
              v-for="w in row.weakness"
              :key="w"
              :color="typeColor(w)"
              effect="dark"
              size="small"
              class="mr-1 mb-1"
            >{{ w }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="星級" width="130" align="center">
          <template #default="{ row }">
            <span class="text-yellow-500">{{ '⭐'.repeat(row.grade) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="fetchCards"
        />
      </div>
    </el-card>

    <!-- 屬性剋制說明 -->
    <el-card class="mt-4">
      <template #header><span class="font-bold">⚔️ 屬性剋制速查表</span></template>
      <el-table :data="weaknessChart" border size="small">
        <el-table-column prop="type" label="屬性" width="90" align="center">
          <template #default="{ row }">
            <el-tag :color="typeColor(row.type)" effect="dark" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="弱點（被這些屬性剋制）" align="left">
          <template #default="{ row }">
            <el-tag
              v-for="w in row.weakness"
              :key="w"
              :color="typeColor(w)"
              effect="dark"
              size="small"
              class="mr-1"
            >{{ w }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMezastarSeries, getMezastarTypes, getMezastarCards } from "@/api/mezastar";

const loading    = ref(false);
const list       = ref([]);
const total      = ref(0);
const page       = ref(1);
const pageSize   = ref(50);
const seriesList = ref<string[]>([]);
const typeList   = ref<string[]>([]);

const filters = ref({ series: "", type: "", weakness: "", name: "" });

const TYPE_COLORS: Record<string, string> = {
  一般: "#A8A878", 火: "#F08030", 水: "#6890F0", 電: "#F8D030",
  草: "#78C850",   冰: "#98D8D8", 格鬥: "#C03028", 毒: "#A040A0",
  地面: "#E0C068", 飛行: "#A890F0", 超能: "#F85888", 蟲: "#A8B820",
  岩石: "#B8A038", 幽靈: "#705898", 龍: "#7038F8", 惡: "#705848",
  鋼: "#B8B8D0",   妖精: "#EE99AC",
};

const weaknessChart = [
  { type: "一般", weakness: ["格鬥"] },
  { type: "火",   weakness: ["水", "地面", "岩石"] },
  { type: "水",   weakness: ["電", "草"] },
  { type: "電",   weakness: ["地面"] },
  { type: "草",   weakness: ["火", "冰", "毒", "飛行", "蟲"] },
  { type: "冰",   weakness: ["火", "格鬥", "岩石", "鋼"] },
  { type: "格鬥", weakness: ["飛行", "超能", "妖精"] },
  { type: "毒",   weakness: ["地面", "超能"] },
  { type: "地面", weakness: ["水", "草", "冰"] },
  { type: "飛行", weakness: ["電", "岩石", "冰"] },
  { type: "超能", weakness: ["幽靈", "惡", "蟲"] },
  { type: "蟲",   weakness: ["火", "飛行", "岩石"] },
  { type: "岩石", weakness: ["水", "草", "格鬥", "地面", "鋼"] },
  { type: "幽靈", weakness: ["幽靈", "惡"] },
  { type: "龍",   weakness: ["冰", "龍", "妖精"] },
  { type: "惡",   weakness: ["格鬥", "蟲", "妖精"] },
  { type: "鋼",   weakness: ["火", "格鬥", "地面"] },
  { type: "妖精", weakness: ["毒", "鋼"] },
];

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? "#888";
}

const SERIES_TAG_TYPES: Record<string, string> = {
  "星塵1彈": "primary", "星塵2彈": "success", "星塵3彈": "warning",
  "星塵4彈": "danger",  "銀河1彈": "",
};
function seriesTagType(s: string) {
  return (SERIES_TAG_TYPES[s] ?? "") as any;
}

async function fetchCards() {
  loading.value = true;
  try {
    const res: any = await getMezastarCards({
      ...filters.value,
      page: page.value,
      pageSize: pageSize.value,
    });
    if (res.success) {
      list.value  = res.data.list;
      total.value = res.data.total;
    }
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = { series: "", type: "", weakness: "", name: "" };
  page.value    = 1;
  fetchCards();
}

function quickFilterSeries(s: string) {
  filters.value.series = filters.value.series === s ? "" : s;
  page.value = 1;
  fetchCards();
}

onMounted(async () => {
  const [sr, tr] = await Promise.all([getMezastarSeries(), getMezastarTypes()]);
  seriesList.value = (sr as any).data ?? [];
  typeList.value   = (tr as any).data ?? [];
  fetchCards();
});
</script>
