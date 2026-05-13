<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getMemberList,
  createMember,
  updateMember,
  deleteMember,
  activateMembership,
  revokeMembership
} from "@/api/member";

defineOptions({ name: "MemberList" });

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive({ total: 0, pageSize: 10, currentPage: 1 });
const searchForm = reactive({ keyword: "", is_active: "", is_member: "" });

// 新增/編輯 dialog
const dialogVisible = ref(false);
const dialogTitle = ref("新增會員");
const isEdit = ref(false);
const form = reactive({
  id: 0,
  account: "",
  nickname: "",
  password: "",
  email: "",
  phone: "",
  is_active: 1,
  can_comment: 1
});

// 會員資格 dialog
const membershipDialogVisible = ref(false);
const membershipTarget = ref<any>(null);
const membershipDays = ref(30);

// 餘額調整 dialog
const balanceDialogVisible = ref(false);
const balanceTarget = ref<any>(null);
const balanceForm = reactive({ type: 1, amount: "", remark: "" });

async function fetchList() {
  loading.value = true;
  const res = await getMemberList({
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
  Object.assign(searchForm, { keyword: "", is_active: "", is_member: "" });
  onSearch();
}

function openDialog(row?: any) {
  isEdit.value = !!row;
  dialogTitle.value = row ? "修改會員" : "新增會員";
  if (row) {
    Object.assign(form, {
      id: row.id,
      account: row.account,
      nickname: row.nickname,
      password: "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      is_active: row.isActive,
      can_comment: row.canComment
    });
  } else {
    Object.assign(form, {
      id: 0,
      account: "",
      nickname: "",
      password: "",
      email: "",
      phone: "",
      is_active: 1,
      can_comment: 1
    });
  }
  dialogVisible.value = true;
}

async function submitForm() {
  if (!form.nickname) return ElMessage.warning("請填寫暱稱");
  if (!isEdit.value && !form.password) return ElMessage.warning("請填寫密碼");
  const res = isEdit.value
    ? await updateMember(form)
    : await createMember(form);
  if (res.code === 0) {
    ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
    dialogVisible.value = false;
    fetchList();
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`確認刪除會員「${row.nickname}」？`, "警告", {
    type: "warning"
  });
  const res = await deleteMember(row.id);
  if (res.code === 0) {
    ElMessage.success("刪除成功");
    fetchList();
  }
}

function openMembership(row: any) {
  membershipTarget.value = row;
  membershipDays.value = 30;
  membershipDialogVisible.value = true;
}

async function submitMembership() {
  const res = await activateMembership(membershipTarget.value.id, {
    days: membershipDays.value
  });
  if (res.code === 0) {
    ElMessage.success("會員資格已開通");
    membershipDialogVisible.value = false;
    fetchList();
  }
}

async function handleRevoke(row: any) {
  await ElMessageBox.confirm(
    `確認撤銷「${row.nickname}」的會員資格？`,
    "警告",
    { type: "warning" }
  );
  const res = await revokeMembership(row.id);
  if (res.code === 0) {
    ElMessage.success("已撤銷");
    fetchList();
  }
}

function openBalance(row: any) {
  balanceTarget.value = row;
  Object.assign(balanceForm, { type: 1, amount: "", remark: "" });
  balanceDialogVisible.value = true;
}

async function submitBalance() {
  if (!balanceForm.amount || Number(balanceForm.amount) <= 0)
    return ElMessage.warning("請輸入正確金額");
  const { balanceAdjust } = await import("@/api/member");
  const res = await balanceAdjust({
    member_id: balanceTarget.value.id,
    ...balanceForm
  });
  if (res.code === 0) {
    ElMessage.success("調整成功");
    balanceDialogVisible.value = false;
    fetchList();
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="關鍵字">
        <el-input
          v-model="searchForm.keyword"
          placeholder="帳號/暱稱/Email/手機"
          clearable
          class="w-52!"
        />
      </el-form-item>
      <el-form-item label="狀態">
        <el-select
          v-model="searchForm.is_active"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="啟用" :value="1" /><el-option
            label="停用"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="會員">
        <el-select
          v-model="searchForm.is_member"
          placeholder="全部"
          clearable
          class="w-28!"
        >
          <el-option label="有效" :value="1" /><el-option
            label="非會員"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" class="mb-4" @click="openDialog()"
      >+ 新增會員</el-button
    >

    <el-table v-loading="loading" :data="dataList" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="account" label="帳號" width="130" />
      <el-table-column prop="nickname" label="暱稱" width="130" />
      <el-table-column prop="balance" label="餘額" width="100">
        <template #default="{ row }">
          <span class="font-medium">{{ row.balance }}</span>
          <el-button
            link
            type="primary"
            size="small"
            class="ml-1!"
            @click="openBalance(row)"
            >調整</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">{{
            row.isActive ? "啟用" : "停用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="留言" width="70">
        <template #default="{ row }">
          <el-tag :type="row.canComment ? 'success' : 'warning'" size="small">{{
            row.canComment ? "允許" : "禁言"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="會員資格" min-width="160">
        <template #default="{ row }">
          <template v-if="row.isMember">
            <el-tag type="success" size="small"
              >有效至 {{ row.memberExpiredAt?.slice(0, 10) }}</el-tag
            >
            <el-button
              link
              type="warning"
              size="small"
              class="ml-1!"
              @click="openMembership(row)"
              >延長</el-button
            >
            <el-button
              link
              type="danger"
              size="small"
              @click="handleRevoke(row)"
              >撤銷</el-button
            >
          </template>
          <template v-else>
            <el-tag type="info" size="small">非會員</el-tag>
            <el-button
              link
              type="primary"
              size="small"
              class="ml-1!"
              @click="openMembership(row)"
              >開通</el-button
            >
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="建立時間" width="160" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)"
            >修改</el-button
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

    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="帳號" required>
          <el-input
            v-model="form.account"
            :disabled="isEdit"
            placeholder="請輸入帳號"
          />
        </el-form-item>
        <el-form-item label="暱稱" required>
          <el-input v-model="form.nickname" placeholder="請輸入暱稱" />
        </el-form-item>
        <el-form-item :label="isEdit ? '新密碼' : '密碼'" :required="!isEdit">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="isEdit ? '不填則不修改' : '請輸入密碼'"
            show-password
          />
        </el-form-item>
        <el-form-item label="手機">
          <el-input v-model="form.phone" placeholder="選填" />
        </el-form-item>
        <el-form-item label="狀態">
          <el-switch
            v-model="form.is_active"
            :active-value="1"
            :inactive-value="0"
            active-text="啟用"
            inactive-text="停用"
          />
        </el-form-item>
        <el-form-item label="留言">
          <el-switch
            v-model="form.can_comment"
            :active-value="1"
            :inactive-value="0"
            active-text="允許"
            inactive-text="禁言"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">確認</el-button>
      </template>
    </el-dialog>

    <!-- 會員資格 -->
    <el-dialog v-model="membershipDialogVisible" title="會員資格" width="380px">
      <p class="mb-3 text-sm text-gray-500">
        會員：{{ membershipTarget?.nickname }}
      </p>
      <el-form label-width="80px">
        <el-form-item label="天數">
          <el-input-number v-model="membershipDays" :min="1" :max="3650" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="membershipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMembership">確認</el-button>
      </template>
    </el-dialog>

    <!-- 餘額調整 -->
    <el-dialog v-model="balanceDialogVisible" title="餘額調整" width="400px">
      <p class="mb-3 text-sm text-gray-500">
        會員：{{ balanceTarget?.nickname }}，目前餘額：{{
          balanceTarget?.balance
        }}
      </p>
      <el-form :model="balanceForm" label-width="80px">
        <el-form-item label="類型">
          <el-radio-group v-model="balanceForm.type">
            <el-radio :value="1">增加</el-radio>
            <el-radio :value="2">減少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金額">
          <el-input v-model="balanceForm.amount" placeholder="請輸入金額" />
        </el-form-item>
        <el-form-item label="備注">
          <el-input v-model="balanceForm.remark" placeholder="選填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBalance">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>
