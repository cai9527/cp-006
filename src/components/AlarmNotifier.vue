<template>
  <transition-group
    name="alarm-slide"
    tag="div"
    class="alarm-notifier-container"
  >
    <div
      v-for="alarm in visibleAlarms"
      :key="alarm.uid"
      :class="['alarm-popup', alarm.level === 1 ? 'alarm-warning' : 'alarm-critical']"
      @click="goToDetail(alarm)"
    >
      <div class="popup-icon">
        <i :class="alarm.level === 1 ? 'el-icon-warning-outline' : 'el-icon-bell'"></i>
      </div>
      <div class="popup-body">
        <div class="popup-header">
          <span :class="['popup-type', alarm.level === 1 ? 'type-warning' : 'type-critical']">
            {{ alarm.level === 1 ? '预警' : '报警' }}
          </span>
          <span class="popup-time">{{ alarm.created_at }}</span>
        </div>
        <div class="popup-title">{{ alarm.title }}</div>
        <div class="popup-desc">{{ alarm.description }}</div>
      </div>
      <button class="popup-close" @click.stop="dismiss(alarm.uid)">
        <i class="el-icon-close"></i>
      </button>
    </div>
  </transition-group>
</template>

<script>
import alarmNotifier from '@/utils/alarmNotifier';

let uidCounter = 0;

export default {
  name: 'AlarmNotifier',
  data() {
    return {
      alarms: []
    };
  },
  computed: {
    visibleAlarms() {
      return this.alarms.slice(0, alarmNotifier.MAX_VISIBLE);
    }
  },
  mounted() {
    alarmNotifier.$on(alarmNotifier.NOTIFY_EVENT, this.handleNotify);
  },
  beforeDestroy() {
    alarmNotifier.$off(alarmNotifier.NOTIFY_EVENT, this.handleNotify);
    this.alarms.forEach(a => {
      if (a._timer) clearTimeout(a._timer);
    });
  },
  methods: {
    handleNotify(alarm) {
      const uid = ++uidCounter;
      const enriched = {
        ...alarm,
        uid,
        _timer: null
      };

      this.alarms.unshift(enriched);

      enriched._timer = setTimeout(() => {
        this.dismiss(uid);
      }, alarmNotifier.AUTO_DISMISS_MS);
    },
    dismiss(uid) {
      const idx = this.alarms.findIndex(a => a.uid === uid);
      if (idx === -1) return;
      const alarm = this.alarms[idx];
      if (alarm._timer) clearTimeout(alarm._timer);
      this.alarms.splice(idx, 1);
    },
    goToDetail(alarm) {
      if (alarm._timer) clearTimeout(alarm._timer);
      const idx = this.alarms.findIndex(a => a.uid === alarm.uid);
      if (idx !== -1) this.alarms.splice(idx, 1);
      this.$router.push('/alarm');
    }
  }
};
</script>

<style>
.alarm-notifier-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

.alarm-popup {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.alarm-popup::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.alarm-popup.alarm-warning {
  border: 1px solid #e6a23c;
}

.alarm-popup.alarm-warning::before {
  background: #e6a23c;
}

.alarm-popup.alarm-critical {
  border: 1px solid #f56c6c;
}

.alarm-popup.alarm-critical::before {
  background: #f56c6c;
}

.alarm-popup:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  transform: translateX(-2px);
}

.popup-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.alarm-warning .popup-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.alarm-critical .popup-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.alarm-critical .popup-icon {
  animation: critical-pulse 1.5s ease-in-out infinite;
}

@keyframes critical-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.popup-body {
  flex: 1;
  min-width: 0;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.popup-type {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}

.type-warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.type-critical {
  background: #fef0f0;
  color: #f56c6c;
}

.popup-time {
  font-size: 11px;
  color: #c0c4cc;
}

.popup-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popup-close {
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 14px;
  padding: 4px;
  margin-left: 8px;
  line-height: 1;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}

.popup-close:hover {
  color: #909399;
  background: #f5f7fa;
}

.alarm-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.alarm-slide-leave-active {
  transition: all 0.25s ease-in;
}

.alarm-slide-enter {
  transform: translateX(100%);
  opacity: 0;
}

.alarm-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.alarm-slide-move {
  transition: transform 0.3s ease;
}
</style>
