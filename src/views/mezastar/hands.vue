<template>
  <div class="p-4">
    <el-card>
      <template #header>
        <span class="font-bold text-base">🃏 Mezastar 用戶手牌</span>
      </template>

      <!-- 用戶選擇 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item label="選擇用戶">
          <el-select
            v-model="selected"
            placeholder="請選擇用戶"
            style="width: 260px"
            clearable
            @change="fetchHands"
          >
            <el-option
              v-for="u in userList"
              :key="`${u.bot_id}-${u.tg_chat_id}`"
              :label="`Chat ${u.tg_chat_id}（Bot ${u.bot_id}）— ${u.card_count} 張`"
              :value="`${u.bot_id}:${u.tg_chat_id}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" @click="fetchHands" :disabled="!selected">查詢</el-button>
        </el-form-item>
      </el-form>

      <!-- 無用戶提示 -->
      <el-empty v-if="!selected" description="請先選擇用戶" />

      <!-- 手牌列表 -->
      <template v-else>
        <div class="mb-2 text-sm text-gray-500">共 {{ hands.length }} 張手牌</div>
        <el-table :data="hands" v-loading="loading" border stripe>
          <el-table-column label="圖片" width="90" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.pokemon?.image_url"
                :src="row.pokemon.image_url"
                :preview-src-list="[row.pokemon.image_url]"
                fit="contain"
                style="width:70px;height:50px;cursor:pointer"
                preview-teleported
                lazy
              />
              <span v-else class="text-gray-300 text-xs">無圖</span>
            </template>
          </el-table-column>
          <el-table-column label="卡號" width="110" align="center">
            <template #default="{ row }">
              <span class="text-xs font-mono">{{ row.pokemon?.card_no }}</span>
            </template>
          </el-table-column>
          <el-table-column label="名稱" width="130" align="center">
            <template #default="{ row }">
              <span class="font-bold">{{ row.pokemon?.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="彈數" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="seriesTagType(row.pokemon?.series)">
                {{ row.pokemon?.series }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="屬性" width="130" align="center">
            <template #default="{ row }">
              <el-tag :color="typeColor(row.pokemon?.type1)" effect="dark" size="small" class="mr-1">{{ row.pokemon?.type1 }}</el-tag>
              <el-tag v-if="row.pokemon?.type2" :color="typeColor(row.pokemon?.type2)" effect="dark" size="small">{{ row.pokemon?.type2 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="招式" width="90" align="center">
            <template #default="{ row }">
              <el-tag :color="typeColor(row.pokemon?.move_type)" effect="dark" size="small">{{ row.pokemon?.move_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="星級" width="110" align="center">
            <template #default="{ row }">
              <span class="text-yellow-500">{{ '⭐'.repeat(row.pokemon?.grade ?? 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="寶可能量" width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.pokemon?.power != null" class="font-bold text-red-500 text-base">{{ row.pokemon.power }}</span>
              <span v-else class="text-gray-300 text-xs">—</span>
            </template>
          </el-table-column>
          <el-table-column label="能力值" width="190" align="center">
            <template #default="{ row }">
              <div v-if="row.pokemon?.hp != null" class="text-xs leading-tight text-left">
                <span class="inline-block w-10 text-yellow-600 font-semibold">HP</span><span class="font-mono">{{ row.pokemon.hp }}</span><br/>
                <span class="inline-block w-10 text-red-500">攻擊</span><span class="font-mono">{{ row.pokemon.attack }}</span>
                <span class="ml-2 text-blue-500">防禦</span><span class="font-mono ml-1">{{ row.pokemon.defense }}</span><br/>
                <span class="inline-block w-10 text-purple-500">特攻</span><span class="font-mono">{{ row.pokemon.sp_attack }}</span>
                <span class="ml-2 text-indigo-400">特防</span><span class="font-mono ml-1">{{ row.pokemon.sp_defense }}</span><br/>
                <span class="inline-block w-10 text-green-500">速度</span><span class="font-mono">{{ row.pokemon.speed }}</span>
              </div>
              <span v-else class="text-gray-300 text-xs">未填</span>
            </template>
          </el-table-column>
          <el-table-column label="弱點" align="center">
            <template #default="{ row }">
              <el-tag
                v-for="w in (row.pokemon?.weakness ?? [])"
                :key="w"
                :color="typeColor(w)"
                effect="dark"
                size="small"
                class="mr-1 mb-1"
              >{{ w }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMezastarHandUsers, getMezastarHands } from "@/api/mezastar";

const userList = ref<any[]>([]);
const selected = ref("");
const hands    = ref<any[]>([]);
const loading  = ref(false);

const TYPE_COLORS: Record<string, string> = {
  一般: "#A8A878", 火: "#F08030", 水: "#6890F0", 電: "#F8D030",
  草: "#78C850",   冰: "#98D8D8", 格鬥: "#C03028", 毒: "#A040A0",
  地面: "#E0C068", 飛行: "#A890F0", 超能: "#F85888", 蟲: "#A8B820",
  岩石: "#B8A038", 幽靈: "#705898", 龍: "#7038F8", 惡: "#705848",
  鋼: "#B8B8D0",   妖精: "#EE99AC",
};
function typeColor(type: string) { return TYPE_COLORS[type] ?? "#888"; }

const SERIES_TAG_TYPES: Record<string, string> = {
  "星塵1彈": "primary", "星塵2彈": "success", "星塵3彈": "warning",
  "星塵4彈": "danger",  "銀河1彈": "",
};
function seriesTagType(s: string) { return (SERIES_TAG_TYPES[s] ?? "") as any; }

async function fetchHands() {
  if (!selected.value) return;
  const [botId, chatId] = selected.value.split(":");
  loading.value = true;
  try {
    const res: any = await getMezastarHands({ botId, chatId });
    if (res.success) hands.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const res: any = await getMezastarHandUsers();
  if (res.success) userList.value = res.data;
});
</script>
