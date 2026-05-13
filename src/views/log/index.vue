<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { getLogFiles, getLogEntries } from "@/api/log";

defineOptions({ name: "LogViewer" });

const filesLoading = ref(false);
const entriesLoading = ref(false);
const grouped = ref<Record<string, any[]>>({});
const selectedFile = ref("");
const entries = ref<any[]>([]);
const pagination = reactive({ total: 0, page: 1, pageSize: 50 });
const filter = reactive({ severity: "", search: "" });

const severityColors: Record<string, string> = {
  INFO:      "success",
  WARNING:   "warning",
  ERROR:     "danger",
  CRITICAL:  "danger",
  EMERGENCY: "danger",
  DEBUG:     "info",
  NOTICE:    "primary",
};

const channels = computed(() => Object.keys(grouped.value).sort());

async function loadFiles() {
  filesLoading.value = true;
  const res = await getLogFiles();
  if (res.code === 0) grouped.value = res.data.grouped;
  filesLoading.value = false;
}

async function selectFile(name: string) {
  selectedFile.value = name;
  pagination.page = 1;
  await loadEntries();
}

async function loadEntries() {
  if (!selectedFile.value) return;
  entriesLoading.value = true;
  const res = await getLogEntries({
    file:     selectedFile.value,
    severity: filter.severity,
    search:   filter.search,
    page:     pagination.page,
    pageSize: pagination.pageSize,
  });
  if (res.code === 0) {
    entries.value = res.data.list;
    pagination.total = res.data.total;
  }
  entriesLoading.value = false;
}

function onSearch() { pagination.page = 1; loadEntries(); }
function onPageChange() { loadEntries(); }

function formatContext(ctx: any): string {
  if (!ctx) return "";
  return JSON.stringify(ctx, null, 2);
}

onMounted(async () => {
  await loadFiles();
  // 預設選最新的 laravel.log 或第一個檔
  const allFiles = Object.values(grouped.value).flat();
  if (allFiles.length) selectFile(allFiles[0].name);
});
</script>

<template>
  <div class="flex h-full gap-0" style="height: calc(100vh - 120px)">
    <!-- 左側：檔案列表 -->
    <div class="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div v-loading="filesLoading">
        <div v-for="ch in channels" :key="ch" class="mb-1">
          <div class="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-900">
            {{ ch }}
          </div>
          <div
            v-for="f in grouped[ch]" :key="f.name"
            @click="selectFile(f.name)"
            class="px-3 py-2 cursor-pointer text-sm flex justify-between items-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            :class="selectedFile === f.name ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'"
          >
            <span class="truncate">{{ f.date ?? f.name }}</span>
            <span class="text-xs text-gray-400 ml-1 flex-shrink-0">{{ f.size }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側：日誌內容 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 搜尋列 -->
      <div class="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span class="text-sm font-medium text-gray-500 flex-shrink-0">{{ selectedFile }}</span>
        <el-select v-model="filter.severity" placeholder="全部等級" clearable class="w-32!" @change="onSearch">
          <el-option v-for="s in ['INFO','WARNING','ERROR','CRITICAL','DEBUG','NOTICE']" :key="s" :label="s" :value="s" />
        </el-select>
        <el-input v-model="filter.search" placeholder="搜尋訊息..." clearable class="flex-1 max-w-xs!" @keyup.enter="onSearch" />
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <span class="text-xs text-gray-400 ml-auto flex-shrink-0">共 {{ pagination.total }} 筆</span>
      </div>

      <!-- 日誌列表 -->
      <div class="flex-1 overflow-y-auto" v-loading="entriesLoading">
        <div v-if="!selectedFile" class="flex items-center justify-center h-full text-gray-400">
          請從左側選擇 log 檔案
        </div>
        <div v-else>
          <div
            v-for="(entry, idx) in entries" :key="idx"
            class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-mono text-sm"
          >
            <div class="flex items-start gap-3">
              <el-tag :type="severityColors[entry.severity] as any" size="small" class="flex-shrink-0 mt-0.5 w-20! text-center!">
                {{ entry.severity }}
              </el-tag>
              <span class="text-gray-400 flex-shrink-0 text-xs mt-0.5">{{ entry.datetime }}</span>
              <span class="flex-1 text-gray-800 dark:text-gray-200 break-all">{{ entry.message }}</span>
            </div>
            <div v-if="entry.context" class="mt-1.5 ml-28 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto">
              <pre class="whitespace-pre-wrap">{{ formatContext(entry.context) }}</pre>
            </div>
          </div>
          <div v-if="entries.length === 0 && !entriesLoading" class="py-16 text-center text-gray-400">
            沒有符合的日誌記錄
          </div>
        </div>
      </div>

      <!-- 分頁 -->
      <div class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[25, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>
