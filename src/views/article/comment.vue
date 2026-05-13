<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCommentList, updateComment, deleteComment } from "@/api/article";

defineOptions({ name: "ArticleComment" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 10, currentPage: 1 });
const searchForm = reactive({ is_visible: "" });

const replyDialogVisible = ref(false);
const currentComment = ref<any>(null);
const replyContent = ref("");

async function fetchList() {
  loading.value = true;
  const res = await getCommentList({
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
  Object.assign(searchForm, { is_visible: "" });
  onSearch();
}

async function toggleVisible(row: any) {
  await updateComment({ id: row.id, is_visible: row.isVisible });
}

function openReply(row: any) {
  currentComment.value = row;
  replyContent.value = row.adminReply ?? "";
  replyDialogVisible.value = true;
}

async function submitReply() {
  const res = await updateComment({
    id: currentComment.value.id,
    admin_reply: replyContent.value
  });
  if (res.code === 0) {
    ElMessage.success("回覆成功");
    replyDialogVisible.value = false;
    fetchList();
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm("確認刪除此留言？", "警告", { type: "warning" });
  const res = await deleteComment(row.id);
  if (res.code === 0) {
    ElMessage.success("刪除成功");
    fetchList();
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="顯示狀態">
        <el-select
          v-model="searchForm.is_visible"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="顯示" :value="1" />
          <el-option label="隱藏" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column
        prop="articleTitle"
        label="文章"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column prop="memberId" label="會員ID" width="90" />
      <el-table-column
        prop="content"
        label="留言內容"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="顯示" width="80">
        <template #default="{ row }">
          <el-switch
            v-model="row.isVisible"
            :active-value="1"
            :inactive-value="0"
            @change="toggleVisible(row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="adminReply"
        label="管理員回覆"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column prop="createdAt" label="留言時間" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openReply(row)"
            >回覆</el-button
          >
          <el-button link type="danger" @click="handleDelete(row)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="mt-4 justify-end"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />

    <el-dialog v-model="replyDialogVisible" title="管理員回覆" width="480px">
      <p class="mb-3 text-gray-500 text-sm">{{ currentComment?.content }}</p>
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="輸入回覆內容"
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">送出</el-button>
      </template>
    </el-dialog>
  </div>
</template>
