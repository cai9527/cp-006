<template>
  <div class="maintenance-page">
    <PageHeader title="维护管理">
      <el-button type="primary" @click="showAddDialog">
        <i class="el-icon-plus"></i> 新建维护
      </el-button>
    </PageHeader>

    <FilterCard>
      <el-form inline label-width="100px">
        <el-form-item label="维护状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable>
            <el-option
              v-for="opt in $status.getMaintenanceStatusOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维护类型">
          <el-select v-model="filterType" placeholder="全部" clearable>
            <el-option
              v-for="opt in $status.getMaintenanceTypeOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecords">筛选</el-button>
        </el-form-item>
      </el-form>
    </FilterCard>

    <el-table :data="filteredRecords" border stripe>
      <el-table-column prop="code" label="维护单号" width="160"></el-table-column>
      <el-table-column prop="lift_name" label="设备名称" min-width="120"></el-table-column>
      <el-table-column prop="type" label="维护类型" width="120">
        <template slot-scope="scope">
          <span class="badge type-badge">
            <i class="el-icon-setting"></i>
            <span :style="{ color: $status.getMaintenanceStatusColor(scope.row.status) }">
              {{ $status.getMaintenanceTypeText(scope.row.type) }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="维护内容" min-width="180"></el-table-column>
      <el-table-column prop="operator" label="维护人员" width="120"></el-table-column>
      <el-table-column prop="scheduled_date" label="计划日期" width="140"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <StatusBadge type="maintenance" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="startMaintenance(scope.row)"
            :disabled="scope.row.status !== 0"
          >开始</el-button>
          <el-button
            size="small"
            type="success"
            @click="completeMaintenance(scope.row)"
            :disabled="scope.row.status !== 1"
          >完成</el-button>
          <el-button size="small" @click="editRecord(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRecord(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <DataPagination
      :total="filteredRecords.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog
      :title="editingRecord.id ? '编辑维护' : '新建维护'"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form :model="editingRecord" :rules="formRules" ref="mForm" label-width="100px">
        <el-form-item label="设备" prop="lift_id">
          <el-select v-model="editingRecord.lift_id" placeholder="请选择设备" filterable>
            <el-option
              v-for="lift in lifts"
              :key="lift.id"
              :label="`${lift.name} (${lift.code})`"
              :value="lift.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维护类型" prop="type">
          <el-select v-model="editingRecord.type" placeholder="请选择类型">
            <el-option
              v-for="opt in $status.getMaintenanceTypeOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维护内容" prop="description">
          <el-input v-model="editingRecord.description" type="textarea" :rows="3" placeholder="请输入维护内容"></el-input>
        </el-form-item>
        <el-form-item label="维护人员" prop="operator">
          <el-input v-model="editingRecord.operator" placeholder="请输入维护人员姓名"></el-input>
        </el-form-item>
        <el-form-item label="计划日期" prop="scheduled_date">
          <el-date-picker
            v-model="editingRecord.scheduled_date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" v-if="editingRecord.id" prop="status">
          <el-select v-model="editingRecord.status" placeholder="请选择状态">
            <el-option
              v-for="opt in $status.getMaintenanceStatusOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <FormActions
        slot="footer"
        :submitting="submitting"
        @submit="saveRecord"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Maintenance',
  data() {
    return {
      records: [],
      lifts: [],
      filterStatus: null,
      filterType: null,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      submitting: false,
      editingRecord: {
        id: null,
        lift_id: null,
        type: 1,
        description: '',
        operator: '',
        scheduled_date: '',
        status: 0
      },
      formRules: {
        lift_id: [{ required: true, message: '请选择设备', trigger: 'change' }],
        type: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
        description: [{ required: true, message: '请输入维护内容', trigger: 'blur' }],
        operator: [{ required: true, message: '请输入维护人员', trigger: 'blur' }],
        scheduled_date: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
      }
    };
  },
  computed: {
    filteredRecords() {
      return this.records.filter(r => {
        if (this.filterStatus !== null && this.filterStatus !== undefined && r.status !== this.filterStatus) return false;
        if (this.filterType && r.type !== this.filterType) return false;
        return true;
      });
    }
  },
  mounted() {
    this.loadRecords();
    this.loadLifts();
  },
  methods: {
    loadRecords() {
      axios.get('/api/maintenance_records').then(res => {
        if (res.data.success) {
          this.records = res.data.data || [];
        }
      });
    },
    loadLifts() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.lifts = res.data.data || [];
        }
      });
    },
    showAddDialog() {
      this.editingRecord = {
        id: null,
        lift_id: null,
        type: 1,
        description: '',
        operator: '',
        scheduled_date: '',
        status: 0
      };
      this.dialogVisible = true;
    },
    editRecord(record) {
      this.editingRecord = { ...record };
      this.dialogVisible = true;
    },
    saveRecord() {
      this.$refs.mForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const request = this.editingRecord.id
          ? axios.put(`/api/maintenance_records/${this.editingRecord.id}`, this.editingRecord)
          : axios.post('/api/maintenance_records', this.editingRecord);
        request.then(res => {
          if (res.data.success) {
            this.$message.success(this.editingRecord.id ? '修改成功' : '创建成功');
            this.dialogVisible = false;
            this.loadRecords();
          }
        }).finally(() => {
          this.submitting = false;
        });
      });
    },
    startMaintenance(record) {
      axios.put(`/api/maintenance_records/${record.id}`, { status: 1 }).then(res => {
        if (res.data.success) {
          this.$message.success('维护已开始');
          this.loadRecords();
        }
      });
    },
    completeMaintenance(record) {
      axios.put(`/api/maintenance_records/${record.id}`, { status: 2 }).then(res => {
        if (res.data.success) {
          this.$message.success('维护已完成');
          this.loadRecords();
        }
      });
    },
    deleteRecord(record) {
      this.$confirm(`确定要删除维护单"${record.code}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`/api/maintenance_records/${record.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadRecords();
          }
        });
      }).catch(() => {});
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleSizeChange(size) {
      this.pageSize = size;
    }
  }
};
</script>

<style>
.maintenance-page {
  padding: 20px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}
</style>
