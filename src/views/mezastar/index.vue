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
        <el-form-item label="星級">
          <el-select v-model="filters.grade" clearable placeholder="全部" style="width:100px">
            <el-option label="★6" :value="6" />
            <el-option label="★5" :value="5" />
            <el-option label="★4" :value="4" />
            <el-option label="★3" :value="3" />
            <el-option label="★2" :value="2" />
            <el-option label="★1" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="極巨化">
          <el-select v-model="filters.is_gigantamax" clearable placeholder="全部" style="width:100px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="超級進化">
          <el-select v-model="filters.is_mega" clearable placeholder="全部" style="width:90px">
            <el-option label="是" :value="1" /><el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="極巨化">
          <el-select v-model="filters.is_gigantamax" clearable placeholder="全部" style="width:90px">
            <el-option label="是" :value="1" /><el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="超極巨化">
          <el-select v-model="filters.is_ultra_gigantamax" clearable placeholder="全部" style="width:90px">
            <el-option label="是" :value="1" /><el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="雙重招式">
          <el-select v-model="filters.is_dual_move" clearable placeholder="全部" style="width:90px">
            <el-option label="是" :value="1" /><el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="Z招式">
          <el-select v-model="filters.is_z_move" clearable placeholder="全部" style="width:90px">
            <el-option label="是" :value="1" /><el-option label="否" :value="0" />
          </el-select>
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
        <el-table-column label="圖片" width="90" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image_url"
              :src="row.image_url"
              :preview-src-list="[row.image_url]"
              fit="contain"
              style="width:70px;height:50px;cursor:pointer"
              preview-teleported
              lazy
            />
            <span v-else class="text-gray-300 text-xs">無圖</span>
          </template>
        </el-table-column>
        <el-table-column prop="series" label="彈數" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="seriesTagType(row.series)">{{ row.series }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名稱" width="150" align="center">
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
        <el-table-column label="星級" width="110" align="center">
          <template #default="{ row }">
            <span class="text-yellow-500">{{ '⭐'.repeat(row.grade) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="超級進化" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_mega" :active-value="1" :inactive-value="0"
              active-color="#16a34a" @change="toggleMegaFn(row)" />
          </template>
        </el-table-column>
        <el-table-column label="極巨化" width="75" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_gigantamax" :active-value="1" :inactive-value="0"
              active-color="#dc2626" @change="toggleGigantamaxFn(row)" />
          </template>
        </el-table-column>
        <el-table-column label="超極巨化" width="82" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_ultra_gigantamax" :active-value="1" :inactive-value="0"
              active-color="#7c3aed" @change="toggleUltraGigantamaxFn(row)" />
          </template>
        </el-table-column>
        <el-table-column label="雙重招式" width="82" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_dual_move" :active-value="1" :inactive-value="0"
              active-color="#0284c7" @change="toggleDualMoveFn(row)" />
          </template>
        </el-table-column>
        <el-table-column label="Z招式" width="72" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_z_move" :active-value="1" :inactive-value="0"
              active-color="#d97706" @change="toggleZMoveFn(row)" />
          </template>
        </el-table-column>
        <el-table-column label="寶可能量" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.power != null" class="font-bold text-red-500 text-base">{{ row.power }}</span>
            <span v-else class="text-gray-300 text-xs">—</span>
          </template>
        </el-table-column>
        <el-table-column label="能力值" width="190" align="center">
          <template #default="{ row }">
            <div v-if="row.hp != null" class="text-xs leading-tight text-left">
              <span class="inline-block w-10 text-yellow-600 font-semibold">HP</span><span class="font-mono">{{ row.hp }}</span><br/>
              <span class="inline-block w-10 text-red-500">攻擊</span><span class="font-mono">{{ row.attack }}</span>
              <span class="ml-2 text-blue-500">防禦</span><span class="font-mono ml-1">{{ row.defense }}</span><br/>
              <span class="inline-block w-10 text-purple-500">特攻</span><span class="font-mono">{{ row.sp_attack }}</span>
              <span class="ml-2 text-indigo-400">特防</span><span class="font-mono ml-1">{{ row.sp_defense }}</span><br/>
              <span class="inline-block w-10 text-green-500">速度</span><span class="font-mono">{{ row.speed }}</span>
            </div>
            <span v-else class="text-gray-300 text-xs">未填</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEdit(row)">編輯</el-button>
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

    <!-- 編輯 Dialog -->
    <el-dialog v-model="editVisible" title="編輯寶可夢資料" width="600px" destroy-on-close>
      <el-form v-if="editForm" :model="editForm" label-width="90px" label-position="left">
        <el-divider content-position="left">基本資訊</el-divider>
        <el-form-item label="彈數">
          <el-select v-model="editForm.series" style="width:100%">
            <el-option v-for="s in seriesList" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="屬性1">
          <el-select v-model="editForm.type1" style="width:100%">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="屬性2">
          <el-select v-model="editForm.type2" clearable placeholder="無" style="width:100%">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="招式屬性">
          <el-select v-model="editForm.move_type" style="width:100%">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="星級">
          <el-select v-model="editForm.grade" style="width:100%">
            <el-option v-for="g in [1,2,3,4,5,6]" :key="g" :label="`★${g}`" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="弱點">
          <el-select v-model="editForm.weakness" multiple style="width:100%">
            <el-option v-for="t in typeList" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">特殊標記</el-divider>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="超級進化"><el-switch v-model="editForm.is_mega" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="極巨化"><el-switch v-model="editForm.is_gigantamax" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="超極巨化"><el-switch v-model="editForm.is_ultra_gigantamax" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="雙重招式"><el-switch v-model="editForm.is_dual_move" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="Z招式"><el-switch v-model="editForm.is_z_move" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">能力值</el-divider>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="寶可能量"><el-input-number v-model="editForm.power" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="HP"><el-input-number v-model="editForm.hp" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="攻擊"><el-input-number v-model="editForm.attack" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="防禦"><el-input-number v-model="editForm.defense" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="特攻"><el-input-number v-model="editForm.sp_attack" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="特防"><el-input-number v-model="editForm.sp_defense" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="速度"><el-input-number v-model="editForm.speed" :min="0" :max="999" controls-position="right" style="width:100%" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveEdit">儲存</el-button>
      </template>
    </el-dialog>

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
import { getMezastarSeries, getMezastarTypes, getMezastarCards, toggleGigantamax, toggleMega, toggleUltraGigantamax, toggleDualMove, toggleZMove, updateCard } from "@/api/mezastar";
import { ElMessage } from "element-plus";

const loading    = ref(false);
const list       = ref([]);
const total      = ref(0);
const page       = ref(1);
const pageSize   = ref(50);
const seriesList = ref<string[]>([]);
const typeList   = ref<string[]>([]);

const editVisible = ref(false);
const editForm    = ref<any>(null);
const saving      = ref(false);

const filters = ref({ series: "", type: "", weakness: "", name: "", grade: "" as any, is_mega: "" as any, is_gigantamax: "" as any, is_ultra_gigantamax: "" as any, is_dual_move: "" as any, is_z_move: "" as any });

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
  filters.value = { series: "", type: "", weakness: "", name: "", grade: "", is_mega: "", is_gigantamax: "", is_ultra_gigantamax: "", is_dual_move: "", is_z_move: "" };
  page.value    = 1;
  fetchCards();
}

async function toggleGigantamaxFn(row: any) {
  try {
    await toggleGigantamax(row.id, row.is_gigantamax);
    ElMessage.success(row.is_gigantamax ? `${row.name} 已標記為極巨化` : `${row.name} 已取消極巨化`);
  } catch {
    ElMessage.error("更新失敗");
    row.is_gigantamax = row.is_gigantamax ? 0 : 1;
  }
}

async function toggleMegaFn(row: any) {
  try {
    await toggleMega(row.id, row.is_mega);
    ElMessage.success(row.is_mega ? `${row.name} 已標記為超級進化` : `${row.name} 已取消超級進化`);
  } catch { ElMessage.error("更新失敗"); row.is_mega = row.is_mega ? 0 : 1; }
}

async function toggleUltraGigantamaxFn(row: any) {
  try {
    await toggleUltraGigantamax(row.id, row.is_ultra_gigantamax);
    ElMessage.success(row.is_ultra_gigantamax ? `${row.name} 已標記為超極巨化` : `${row.name} 已取消超極巨化`);
  } catch { ElMessage.error("更新失敗"); row.is_ultra_gigantamax = row.is_ultra_gigantamax ? 0 : 1; }
}

async function toggleDualMoveFn(row: any) {
  try {
    await toggleDualMove(row.id, row.is_dual_move);
    ElMessage.success(row.is_dual_move ? `${row.name} 已標記為雙重招式` : `${row.name} 已取消雙重招式`);
  } catch { ElMessage.error("更新失敗"); row.is_dual_move = row.is_dual_move ? 0 : 1; }
}

async function toggleZMoveFn(row: any) {
  try {
    await toggleZMove(row.id, row.is_z_move);
    ElMessage.success(row.is_z_move ? `${row.name} 已標記為Z招式` : `${row.name} 已取消Z招式`);
  } catch { ElMessage.error("更新失敗"); row.is_z_move = row.is_z_move ? 0 : 1; }
}

function openEdit(row: any) {
  editForm.value = {
    id: row.id,
    series: row.series,
    type1: row.type1,
    type2: row.type2 ?? null,
    move_type: row.move_type,
    grade: row.grade,
    weakness: Array.isArray(row.weakness) ? [...row.weakness] : [],
    is_mega: row.is_mega,
    is_gigantamax: row.is_gigantamax,
    is_ultra_gigantamax: row.is_ultra_gigantamax,
    is_dual_move: row.is_dual_move,
    is_z_move: row.is_z_move,
    power: row.power ?? null,
    hp: row.hp ?? null,
    attack: row.attack ?? null,
    defense: row.defense ?? null,
    sp_attack: row.sp_attack ?? null,
    sp_defense: row.sp_defense ?? null,
    speed: row.speed ?? null,
  };
  editVisible.value = true;
}

async function saveEdit() {
  if (!editForm.value) return;
  saving.value = true;
  try {
    const { id, ...data } = editForm.value;
    const res: any = await updateCard(id, data);
    if (res.success) {
      ElMessage.success("儲存成功");
      editVisible.value = false;
      fetchCards();
    } else {
      ElMessage.error("儲存失敗");
    }
  } catch {
    ElMessage.error("儲存失敗");
  } finally {
    saving.value = false;
  }
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
