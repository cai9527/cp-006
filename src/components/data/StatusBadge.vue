<template>
  <span :class="badgeClass">
    <slot>{{ text }}</slot>
  </span>
</template>

<script>
import {
  getLiftStatusClass, getLiftStatusText,
  getLiftTypeClass, getLiftTypeText,
  getAlarmLevelClass, getAlarmLevelText,
  getMaintenanceStatusClass, getMaintenanceStatusText,
  getUserRoleClass, getUserRoleText,
  getUserStatusClass, getUserStatusText,
  getRunStatusClass, getRunStatusText
} from '@/utils/statusMappers';

export default {
  name: 'StatusBadge',
  props: {
    type: {
      type: String,
      required: true,
      validator: v => ['lift', 'liftType', 'alarm', 'maintenance', 'role', 'user', 'run'].includes(v)
    },
    value: { type: [Number, String], required: true }
  },
  computed: {
    badgeClass() {
      const fn = {
        lift: getLiftStatusClass,
        liftType: getLiftTypeClass,
        alarm: getAlarmLevelClass,
        maintenance: getMaintenanceStatusClass,
        role: getUserRoleClass,
        user: getUserStatusClass,
        run: getRunStatusClass
      }[this.type];
      return fn ? fn(this.value) : '';
    },
    text() {
      const fn = {
        lift: getLiftStatusText,
        liftType: getLiftTypeText,
        alarm: getAlarmLevelText,
        maintenance: getMaintenanceStatusText,
        role: getUserRoleText,
        user: getUserStatusText,
        run: getRunStatusText
      }[this.type];
      return fn ? fn(this.value) : '';
    }
  }
};
</script>
