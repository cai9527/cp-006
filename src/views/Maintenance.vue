<template>
  <div class="maintenance-page">
    <div class="page-header">
      <h2>维护管理</h2>
      <el-button type="primary" @click="showAddForm = true">
        <i class="el-icon-plus"></i> 新增维护记录
      </el-button>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterLift" placeholder="选择升降机">
        <el-option label="全部" :value="0"></el-option>
        <el-option v-for="lift in lifts" :key="lift.id" :label="lift.name" :value="lift.id"></el-option>
      </el-select>
      <el-select v-model="filterStatus" placeholder="选择状态">
        <el-option label="全部" :value="-1"></el-option>
        <el-option label="待处理" :value="0"></el-option>
        <el-option label="进行中" :value="1"></el-option>
        <el-option label="已完成" :value="2"></el-option>
      </el-select>
      <el-button type="default" @click="loadRecords">筛选</el-button>
    </div>
    
    <el-table :data="records" border>
      <el-table-column prop="lift_name" label="升降机" width="150"></el-table-column>
      <el-table-column prop="type" label="维护类型" width="120">
        <template slot-scope="scope">
          {{ getTypeName(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="维护内容" min-width="200"></el-table-column>
      <el-table-column prop="worker" label="维护人员" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <span :class="getStatusClass(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column prop="completed_at" label="完成时间" width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status !== 2" size="small" @click="editRecord(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === 0" size="small" type="primary" @click="startRecord(scope.row)">开始维护</el-button>
          <el-button v-if="scope.row.status === 1" size="small" type="success" @click="completeRecord(scope.row)">完成维护</el-button>
          <el-button v-if="scope.row.status !== 2" size="small" type="danger" @click="deleteRecord(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="维护记录" :visible.sync="showAddForm" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="升降机">
          <el-select v-model="form.lift_id" required>
            <el-option v-for="lift in lifts" :key="lift.id" :label="lift.name" :value="lift.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维护类型">
          <el-select v-model="form.type" required>
            <el-option label="日常保养" :value="1"></el-option>
            <el-option label="定期检修" :value="2"></el-option>
            <el-option label="故障维修" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维护内容">
          <el-textarea v-model="form.content" rows="4"></el-textarea>
        </el-form-item>
        <el-form-item label="维护人员">
          <el-input v-model="form.worker"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Maintenance',
  data() {
    return {
      lifts: [],
      records: [],
      filterLift: 0,
      filterStatus: -1,
      showAddForm: false,
      form: {
        id: null,
        lift_id: '',
        type: 1,
        content: '',
        worker: '',
        status: 0
      }
    };
  },
  mounted() {
    this.loadLifts();
    this.loadRecords();
  },
  methods: {
    loadLifts() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.lifts = res.data.data;
        }
      });
    },
    loadRecords() {
      const params = {};
      if (this.filterLift > 0) params.lift_id = this.filterLift;
      if (this.filterStatus >= 0) params.status = this.filterStatus;
      
      axios.get('/api/maintenance', { params }).then(res => {
        if (res.data.success) {
          this.records = res.data.data;
        }
      });
    },
    getTypeName(type) {
      const types = ['', '日常保养', '定期检修', '故障维修'];
      return types[type] || '未知';
    },
    getStatusClass(status) {
      const classes = ['status-pending', 'status-processing', 'status-completed'];
      return classes[status] || '';
    },
    getStatusText(status) {
      const texts = ['待处理', '进行中', '已完成'];
      return texts[status] || '未知';
    },
    editRecord(record) {
      this.form = { ...record };
      this.showAddForm = true;
    },
    saveRecord() {
      if (!this.form.lift_id) {
        this.$message.error('请选择升降机');
        return;
      }
      
      const method = this.form.id ? 'put' : 'post';
      const url = this.form.id ? `/api/maintenance/${this.form.id}` : '/api/maintenance';
      
      axios[method](url, this.form).then(res => {
        if (res.data.success) {
          this.$message.success('保存成功');
          this.showAddForm = false;
          this.form = { id: null, lift_id: '', type: 1, content: '', worker: '', status: 0 };
          this.loadRecords();
        }
      });
    },
    startRecord(record) {
      axios.put(`/api/maintenance/${record.id}`, { ...record, status: 1 }).then(res => {
        if (res.data.success) {
          this.$message.success('已开始维护');
          this.loadRecords();
        }
      });
    },
    completeRecord(record) {
      axios.put(`/api/maintenance/${record.id}`, { 
        ...record, 
        status: 2,
        completed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }).then(res => {
        if (res.data.success) {
          this.$message.success('已完成维护');
          this.loadRecords();
        }
      });
    },
    deleteRecord(record) {
      this.$confirm('确定要删除这条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        axios.delete(`/api/maintenance/${record.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadRecords();
          }
        });
      });
    }
  }
};
</script>

<style>
.maintenance-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.status-pending {
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-processing {
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-completed {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
