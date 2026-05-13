<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getBalanceLogs } from "@/api/member";

defineOptions({ name: "MemberBalance" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 15, currentPage: 1 });
const searchForm = reactive({ member_id: "", type: "" });

async function fetchList() {
  loading.value = true;
  const res = await getBalanceLogs({
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
  Object.assign(searchForm, { member_id: "", type: "" });
  onSearch();
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="會員ID">
        <el-input
          v-model="searchForm.member_id"
          placeholder="輸入會員ID"
          clearable
          class="w-36!"
        />
      </el-form-item>
      <el-form-item label="類型">
        <el-select
          v-model="searchForm.type"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="增加" :value="1" /><el-option
            label="減少"
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
      <el-table-column prop="memberId" label="會員ID" width="90" />
      <el-table-column prop="memberAccount" label="帳號" width="130" />
      <el-table-column label="類型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'success' : 'danger'" size="small">{{
            row.typeLabel
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金額" width="100" />
      <el-table-column prop="beforeBalance" label="變動前" width="100" />
      <el-table-column prop="afterBalance" label="變動後" width="100" />
      <el-table-column
        prop="remark"
        label="備注"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column prop="createdAt" label="時間" width="160" />
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[15, 30, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>
