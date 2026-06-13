<template>
  <div class="alarm-page">
    <div class="page-header">
      <h2>报警预警</h2>
      <div class="header-actions">
        <el-select v-model="filterLevel" placeholder="报警级别">
          <el-option label="全部" :value="0"></el-option>
          <el-option label="警告" :value="1"></el-option>
          <el-option label="严重" :value="2"></el-option>
          <el-option label="紧急" :value="3"></el-option>
        </el-select>
        <el-select v-model="filterStatus" placeholder="处理状态">
          <el-option label="全部" :value="-1"></el-option>
          <el-option label="未处理" :value="0"></el-option>
          <el-option label="已处理" :value="1"></el-option>
        </el-select>
        <el-button type="primary" @click="loadAlarms">筛选</el-button>
        <el-button type="success" @click="handleAll" :disabled="!$canWrite">全部处理</el-button>
      </div>
    </div>
    
    <div class="alarm-summary">
      <div class="summary-item warning">
        <span class="summary-icon">⚠</span>
        <span class="summary-count">{{ warningCount }}</span>
        <span class="summary-label">警告</span>
      </div>
      <div class="summary-item serious">
        <span class="summary-icon">!</span>
        <span class="summary-count">{{ seriousCount }}</span>
        <span class="summary-label">严重</span>
      </div>
      <div class="summary-item urgent">
        <span class="summary-icon">🚨</span>
        <span class="summary-count">{{ urgentCount }}</span>
        <span class="summary-label">紧急</span>
      </div>
    </div>
    
    <div class="alarm-list">
      <div 
        v-for="alarm in alarms" 
        :key="alarm.id" 
        :class="['alarm-item', getLevelClass(alarm.level), { handled: alarm.status === 1 }]"
      >
        <div class="alarm-header">
          <div :class="['level-badge', getLevelClass(alarm.level)]">
            {{ getLevelText(alarm.level) }}
          </div>
          <div class="alarm-time">{{ alarm.created_at }}</div>
          <div v-if="alarm.status === 1" class="handled-badge">已处理</div>
        </div>
        <div class="alarm-content">
          <div class="alarm-lift">{{ alarm.lift_name }}</div>
          <div class="alarm-message">{{ alarm.message }}</div>
          <div class="alarm-type">{{ getTypeText(alarm.type) }}</div>
        </div>
        <div class="alarm-actions">
          <el-button 
            v-if="alarm.status === 0" 
            size="small" 
            type="primary" 
            @click="handleAlarm(alarm)"
            :disabled="!$canWrite"
          >
            处理
          </el-button>
          <el-button 
            v-if="alarm.status === 1" 
            size="small" 
            type="default"
            disabled
          >
            已处理
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-if="alarms.length === 0" class="empty-state">
      <i class="el-icon-bell"></i>
      <p>暂无报警信息</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Alarm',
  data() {
    return {
      alarms: [],
      filterLevel: 0,
      filterStatus: -1
    };
  },
  computed: {
    warningCount() {
      return this.alarms.filter(a => a.level === 1 && a.status === 0).length;
    },
    seriousCount() {
      return this.alarms.filter(a => a.level === 2 && a.status === 0).length;
    },
    urgentCount() {
      return this.alarms.filter(a => a.level === 3 && a.status === 0).length;
    }
  },
  mounted() {
    this.loadAlarms();
    setInterval(() => {
      this.loadAlarms();
    }, 10000);
  },
  methods: {
    loadAlarms() {
      const params = {};
      if (this.filterLevel > 0) params.level = this.filterLevel;
      if (this.filterStatus >= 0) params.status = this.filterStatus;
      
      axios.get('/api/alarms', { params }).then(res => {
        if (res.data.success) {
          this.alarms = res.data.data;
        }
      });
    },
    getLevelClass(level) {
      const classes = ['', 'level-warning', 'level-serious', 'level-urgent'];
      return classes[level] || '';
    },
    getLevelText(level) {
      const texts = ['', '警告', '严重', '紧急'];
      return texts[level] || '未知';
    },
    getTypeText(type) {
      const types = ['', '超载报警', '超速报警', '故障报警', '维护提醒'];
      return types[type] || '未知';
    },
    handleAlarm(alarm) {
      axios.put(`/api/alarms/${alarm.id}`, {
        ...alarm,
        status: 1,
        handled_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }).then(res => {
        if (res.data.success) {
          this.$message.success('已处理');
          this.loadAlarms();
        }
      });
    },
    handleAll() {
      this.$confirm('确定要处理所有未处理的报警吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const pendingAlarms = this.alarms.filter(a => a.status === 0);
        pendingAlarms.forEach(alarm => {
          axios.put(`/api/alarms/${alarm.id}`, {
            ...alarm,
            status: 1,
            handled_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
          });
        });
        this.$message.success('批量处理成功');
        setTimeout(() => this.loadAlarms(), 500);
      });
    }
  }
};
</script>

<style>
.alarm-page {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.alarm-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.summary-item {
  flex: 1;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-item.warning {
  background: #fef9e7;
  border: 1px solid #f0c78a;
}

.summary-item.serious {
  background: #fff2e8;
  border: 1px solid #ffc069;
}

.summary-item.urgent {
  background: #fff1f0;
  border: 1px solid #ffa39e;
}

.summary-icon {
  font-size: 32px;
}

.summary-count {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}

.summary-label {
  color: #909399;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alarm-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #67c23a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.alarm-item.level-warning {
  border-left-color: #e6a23c;
}

.alarm-item.level-serious {
  border-left-color: #f56c6c;
}

.alarm-item.level-urgent {
  border-left-color: #ff4d4f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
  50% { box-shadow: 0 2px 15px rgba(255, 77, 79, 0.3); }
}

.alarm-item.handled {
  opacity: 0.7;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.level-warning {
  background: #fef9e7;
  color: #e6a23c;
}

.level-serious {
  background: #fff2e8;
  color: #f56c6c;
}

.level-urgent {
  background: #fff1f0;
  color: #ff4d4f;
}

.alarm-time {
  color: #909399;
  font-size: 12px;
}

.handled-badge {
  color: #67c23a;
  background: #e8f5e9;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.alarm-content {
  margin-bottom: 10px;
}

.alarm-lift {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.alarm-message {
  color: #606266;
  margin-bottom: 5px;
}

.alarm-type {
  color: #909399;
  font-size: 12px;
}

.alarm-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
}
</style>
