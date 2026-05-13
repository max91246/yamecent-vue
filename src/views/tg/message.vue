<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getMessageList, getAllBots } from "@/api/tg";

defineOptions({ name: "TgMessage" });

const loading = ref(false);
const dataList = ref([]);
const botOptions = ref([]);
const pagination = reactive({ total: 0, pageSize: 20, currentPage: 1 });
const searchForm = reactive({ bot_id: "", tg_username: "", direction: "" });

async function fetchList() {
  loading.value = true;
  const res = await getMessageList({
    ...searchForm,
    pageSize: pagination.pageSize,
    currentPage: pagination.currentPage
  });
  dataList.value = res.data?.list ?? [];
  pagination.total = res.data?.total ?? 0;
  loading.value = false;
}
function onSearch() {
  pagination.currentPage = 1;
  fetchList();
}
function resetSearch() {
  Object.assign(searchForm, { bot_id: "", tg_username: "", direction: "" });
  onSearch();
}

onMounted(async () => {
  const res = await getAllBots();
  botOptions.value = res.data ?? [];
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="Bot">
        <el-select
          v-model="searchForm.bot_id"
          placeholder="全部"
          clearable
          class="w-36!"
        >
          <el-option
            v-for="b in botOptions"
            :key="b.id"
            :label="b.name"
            :value="b.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用戶名"
        ><el-input v-model="searchForm.tg_username" clearable class="w-40!"
      /></el-form-item>
      <el-form-item label="方向">
        <el-select
          v-model="searchForm.direction"
          placeholder="全部"
          clearable
          class="w-24!"
        >
          <el-option label="收到" :value="1" /><el-option
            label="回覆"
            :value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="tgUsername" label="用戶名" width="130" />
      <el-table-column prop="tgChatId" label="Chat ID" width="130" />
      <el-table-column label="方向" width="80">
        <template #default="{ row }">
          <el-tag
            :type="row.direction === 1 ? 'primary' : 'success'"
            size="small"
            >{{ row.dirLabel }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="內容"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="messageType" label="類型" width="90" />
      <el-table-column prop="createdAt" label="時間" width="160" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[20, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>
