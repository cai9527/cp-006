<template>
  <div class="alarm-page">
    <PageHeader title="报警预警" />

    <AlarmSummary :alarms="alarms" />

    <FilterCard>
      <el-form inline label-width="100px">
        <el-form-item label="报警级别">
          <el-select v-model="filterLevel" placeholder="全部" clearable>
            <el-option label="警告" :value="1"></el-option>
            <el-option label="严重" :value="2"></el-option>
            <el-option label="紧急" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable>
            <el-option label="未处理" :value="0"></el-option>
            <el-option label="已处理" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAlarms">筛选</el-button>
          <el-button @click="batchHandle" v-if="selectedAlarms.length">
            <i class="el-icon-check"></i> 批量处理 ({{ selectedAlarms.length }})
          </el-button>
        </el-form-item>
      </el-form>
    </FilterCard>

    <el-table :data="filteredAlarms" border stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="lift_code" label="设备编号" width="120"></el-table-column>
      <el-table-column prop="lift_name" label="设备名称" min-width="120"></el-table-column>
      <el-table-column prop="type" label="报警类型" width="120">
        <template slot-scope="scope">
          <span class="badge type-badge">
            <i class="el-icon-s-promotion"></i>
            <span :style="{ color: $status.getAlarmTypeColor(scope.row.type) }">
              {{ $status.getAlarmTypeText(scope.row.type) }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="报警级别" width="100">
        <template slot-scope="scope">
          <StatusBadge type="alarm" :value="scope.row.level" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="报警描述" min-width="180"></el-table-column>
      <el-table-column prop="status" label="处理状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
            {{ $status.getAlarmStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="报警时间" width="180"></el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="success"
            @click="handleAlarm(scope.row)"
            :disabled="scope.row.status === 1"
          >处理</el-button>
          <el-button size="small" type="danger" @click="deleteAlarm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <DataPagination
      :total="filteredAlarms.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Alarm',
  data() {
    return {
      alarms: [],
      filterLevel: null,
      filterStatus: null,
      selectedAlarms: [],
      pageSize: 10,
      currentPage: 1
    };
  },
  computed: {
    filteredAlarms() {
      return this.alarms.filter(a => {
        if (this.filterLevel && a.level !== this.filterLevel) return false;
        if (this.filterStatus !== null && this.filterStatus !== undefined && a.status !== this.filterStatus) return false;
        return true;
      });
    }
  },
  mounted() {
    this.loadAlarms();
  },
  methods: {
    loadAlarms() {
      axios.get('/api/alarms').then(res => {
        if (res.data.success) {
          this.alarms = res.data.data || [];
        }
      });
    },
    handleSelectionChange(selection) {
      this.selectedAlarms = selection;
    },
    handleAlarm(alarm) {
      this.$confirm(`确认处理该报警：${alarm.description}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        axios.put(`/api/alarms/${alarm.id}/handle`).then(res => {
          if (res.data.success) {
            this.$message.success('处理成功');
            this.loadAlarms();
          }
        });
      }).catch(() => {});
    },
    batchHandle() {
      this.$confirm(`确认批量处理选中的 ${this.selectedAlarms.length} 条报警？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        const ids = this.selectedAlarms.map(a => a.id);
        axios.put('/api/alarms/batch-handle', { ids }).then(res => {
          if (res.data.success) {
            this.$message.success('批量处理成功');
            this.loadAlarms();
          }
        });
      }).catch(() => {});
    },
    deleteAlarm(alarm) {
      this.$confirm(`确定要删除该报警记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`/api/alarms/${alarm.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadAlarms();
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
.alarm-page {
  padding: 20px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.type-badge i {
  font-size: 14px;
}
</style>
