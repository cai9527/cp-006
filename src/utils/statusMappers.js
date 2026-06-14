const LIFT_STATUS = {
  STOP: 0,
  RUNNING: 1,
  ERROR: 2,
  MAINTENANCE: 3
};

const LIFT_STATUS_CLASSES = {
  [LIFT_STATUS.STOP]: 'status-stop',
  [LIFT_STATUS.RUNNING]: 'status-running',
  [LIFT_STATUS.ERROR]: 'status-error',
  [LIFT_STATUS.MAINTENANCE]: 'status-maintenance'
};

const LIFT_STATUS_TEXTS = {
  [LIFT_STATUS.STOP]: '停止',
  [LIFT_STATUS.RUNNING]: '运行中',
  [LIFT_STATUS.ERROR]: '故障',
  [LIFT_STATUS.MAINTENANCE]: '维护中'
};

export function getLiftStatusClass(status) {
  return LIFT_STATUS_CLASSES[status] || LIFT_STATUS_CLASSES[LIFT_STATUS.STOP];
}

export function getLiftStatusText(status) {
  return LIFT_STATUS_TEXTS[status] || LIFT_STATUS_TEXTS[LIFT_STATUS.STOP];
}

const LIFT_TYPES = {
  LIFT: 1,
  ELEVATOR: 2,
  CARGO: 3
};

const LIFT_TYPE_CLASSES = {
  [LIFT_TYPES.LIFT]: 'type-lift',
  [LIFT_TYPES.ELEVATOR]: 'type-elevator',
  [LIFT_TYPES.CARGO]: 'type-cargo'
};

const LIFT_TYPE_TEXTS = {
  [LIFT_TYPES.LIFT]: '施工升降机',
  [LIFT_TYPES.ELEVATOR]: '乘客电梯',
  [LIFT_TYPES.CARGO]: '货梯'
};

const LIFT_TYPE_OPTIONS = [
  { label: LIFT_TYPE_TEXTS[LIFT_TYPES.LIFT], value: LIFT_TYPES.LIFT },
  { label: LIFT_TYPE_TEXTS[LIFT_TYPES.ELEVATOR], value: LIFT_TYPES.ELEVATOR },
  { label: LIFT_TYPE_TEXTS[LIFT_TYPES.CARGO], value: LIFT_TYPES.CARGO }
];

export function getLiftTypeClass(type) {
  return LIFT_TYPE_CLASSES[type] || '';
}

export function getLiftTypeText(type) {
  return LIFT_TYPE_TEXTS[type] || '未知';
}

export function getLiftTypeOptions() {
  return LIFT_TYPE_OPTIONS.slice();
}

export function getLiftStatusOptions() {
  return Object.keys(LIFT_STATUS_TEXTS).map(Number).map(k => ({
    label: LIFT_STATUS_TEXTS[k],
    value: k
  }));
}

const ALARM_LEVELS = {
  WARNING: 1,
  SERIOUS: 2,
  URGENT: 3
};

const ALARM_LEVEL_CLASSES = {
  [ALARM_LEVELS.WARNING]: 'level-warning',
  [ALARM_LEVELS.SERIOUS]: 'level-serious',
  [ALARM_LEVELS.URGENT]: 'level-urgent'
};

const ALARM_LEVEL_TEXTS = {
  [ALARM_LEVELS.WARNING]: '警告',
  [ALARM_LEVELS.SERIOUS]: '严重',
  [ALARM_LEVELS.URGENT]: '紧急'
};

const ALARM_LEVEL_COLORS = {
  [ALARM_LEVELS.WARNING]: '#e6a23c',
  [ALARM_LEVELS.SERIOUS]: '#f56c6c',
  [ALARM_LEVELS.URGENT]: '#ff4d4f'
};

const ALARM_LEVEL_CARD_CLASSES = {
  [ALARM_LEVELS.WARNING]: 'card-warning',
  [ALARM_LEVELS.SERIOUS]: 'card-serious',
  [ALARM_LEVELS.URGENT]: 'card-urgent'
};

const ALARM_LEVEL_ICONS = {
  [ALARM_LEVELS.WARNING]: 'el-icon-warning-outline',
  [ALARM_LEVELS.SERIOUS]: 'el-icon-warning',
  [ALARM_LEVELS.URGENT]: 'el-icon-bell'
};

export function getAlarmLevelClass(level) {
  return ALARM_LEVEL_CLASSES[level] || '';
}

export function getAlarmLevelText(level) {
  return ALARM_LEVEL_TEXTS[level] || '未知';
}

export function getAlarmLevelColor(level) {
  return ALARM_LEVEL_COLORS[level] || '#909399';
}

export function getAlarmLevelCardClass(level) {
  return ALARM_LEVEL_CARD_CLASSES[level] || '';
}

export function getAlarmLevelIcon(level) {
  return ALARM_LEVEL_ICONS[level] || 'el-icon-bell';
}

export function getAlarmLevelOptions() {
  return [
    { label: '全部', value: 0 },
    { label: ALARM_LEVEL_TEXTS[ALARM_LEVELS.WARNING], value: ALARM_LEVELS.WARNING },
    { label: ALARM_LEVEL_TEXTS[ALARM_LEVELS.SERIOUS], value: ALARM_LEVELS.SERIOUS },
    { label: ALARM_LEVEL_TEXTS[ALARM_LEVELS.URGENT], value: ALARM_LEVELS.URGENT }
  ];
}

const ALARM_TYPES = {
  OVERLOAD: 1,
  OVERSPEED: 2,
  FAULT: 3,
  MAINTENANCE_REMIND: 4
};

const ALARM_TYPE_TEXTS = {
  [ALARM_TYPES.OVERLOAD]: '超载报警',
  [ALARM_TYPES.OVERSPEED]: '超速报警',
  [ALARM_TYPES.FAULT]: '故障报警',
  [ALARM_TYPES.MAINTENANCE_REMIND]: '维护提醒'
};

const ALARM_TYPE_COLORS = {
  [ALARM_TYPES.OVERLOAD]: '#f56c6c',
  [ALARM_TYPES.OVERSPEED]: '#e6a23c',
  [ALARM_TYPES.FAULT]: '#909399',
  [ALARM_TYPES.MAINTENANCE_REMIND]: '#67c23a'
};

export function getAlarmTypeText(type) {
  return ALARM_TYPE_TEXTS[type] || '未知';
}

export function getAlarmTypeColor(type) {
  return ALARM_TYPE_COLORS[type] || '#909399';
}

export function getAlarmTypeEntries() {
  return Object.keys(ALARM_TYPE_TEXTS).map(Number).map(k => ({
    type: k,
    name: ALARM_TYPE_TEXTS[k],
    color: ALARM_TYPE_COLORS[k]
  }));
}

const MAINTENANCE_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2
};

const MAINTENANCE_STATUS_CLASSES = {
  [MAINTENANCE_STATUS.PENDING]: 'status-pending',
  [MAINTENANCE_STATUS.PROCESSING]: 'status-processing',
  [MAINTENANCE_STATUS.COMPLETED]: 'status-completed'
};

const MAINTENANCE_STATUS_TEXTS = {
  [MAINTENANCE_STATUS.PENDING]: '待处理',
  [MAINTENANCE_STATUS.PROCESSING]: '进行中',
  [MAINTENANCE_STATUS.COMPLETED]: '已完成'
};

const MAINTENANCE_STATUS_COLORS = {
  [MAINTENANCE_STATUS.PENDING]: '#f56c6c',
  [MAINTENANCE_STATUS.PROCESSING]: '#e6a23c',
  [MAINTENANCE_STATUS.COMPLETED]: '#67c23a'
};

const MAINTENANCE_TYPES = {
  DAILY: 1,
  REGULAR: 2,
  REPAIR: 3
};

const MAINTENANCE_TYPE_TEXTS = {
  [MAINTENANCE_TYPES.DAILY]: '日常保养',
  [MAINTENANCE_TYPES.REGULAR]: '定期检修',
  [MAINTENANCE_TYPES.REPAIR]: '故障维修'
};

export function getMaintenanceStatusClass(status) {
  return MAINTENANCE_STATUS_CLASSES[status] || '';
}

export function getMaintenanceStatusText(status) {
  return MAINTENANCE_STATUS_TEXTS[status] || '未知';
}

export function getMaintenanceStatusColor(status) {
  return MAINTENANCE_STATUS_COLORS[status] || '#909399';
}

export function getMaintenanceStatusOptions(withAll = true) {
  const base = Object.keys(MAINTENANCE_STATUS_TEXTS).map(Number).map(k => ({
    label: MAINTENANCE_STATUS_TEXTS[k],
    value: k
  }));
  if (withAll) {
    return [{ label: '全部', value: -1 }, ...base];
  }
  return base;
}

export function getMaintenanceTypeText(type) {
  return MAINTENANCE_TYPE_TEXTS[type] || '未知';
}

export function getMaintenanceTypeOptions() {
  return Object.keys(MAINTENANCE_TYPE_TEXTS).map(Number).map(k => ({
    label: MAINTENANCE_TYPE_TEXTS[k],
    value: k
  }));
}

export function getMaintenanceStatusEntries() {
  return Object.keys(MAINTENANCE_STATUS_TEXTS).map(Number).map(k => ({
    status: k,
    name: MAINTENANCE_STATUS_TEXTS[k],
    color: MAINTENANCE_STATUS_COLORS[k]
  }));
}

const USER_ROLES = {
  ADMIN: 1,
  OPERATOR: 2,
  MAINTAINER: 3
};

const USER_ROLE_CLASSES = {
  [USER_ROLES.ADMIN]: 'role-admin',
  [USER_ROLES.OPERATOR]: 'role-operator',
  [USER_ROLES.MAINTAINER]: 'role-maintainer'
};

const USER_ROLE_TEXTS = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.OPERATOR]: '操作员',
  [USER_ROLES.MAINTAINER]: '维护人员'
};

export function getUserRoleClass(role) {
  return USER_ROLE_CLASSES[role] || '';
}

export function getUserRoleText(role) {
  return USER_ROLE_TEXTS[role] || '未知';
}

export function getUserRoleOptions() {
  return Object.keys(USER_ROLE_TEXTS).map(Number).map(k => ({
    label: USER_ROLE_TEXTS[k],
    value: k
  }));
}

const USER_STATUS = {
  DISABLED: 0,
  ACTIVE: 1
};

const USER_STATUS_CLASSES = {
  [USER_STATUS.DISABLED]: 'status-disabled',
  [USER_STATUS.ACTIVE]: 'status-active'
};

const USER_STATUS_TEXTS = {
  [USER_STATUS.DISABLED]: '禁用',
  [USER_STATUS.ACTIVE]: '启用'
};

export function getUserStatusClass(status) {
  return USER_STATUS_CLASSES[status] || '';
}

export function getUserStatusText(status) {
  return USER_STATUS_TEXTS[status] || '未知';
}

export function getUserStatusOptions() {
  return Object.keys(USER_STATUS_TEXTS).map(Number).map(k => ({
    label: USER_STATUS_TEXTS[k],
    value: k
  }));
}

const RUN_STATUS = {
  ABNORMAL: 0,
  NORMAL: 1
};

const RUN_STATUS_CLASSES = {
  [RUN_STATUS.ABNORMAL]: 'status-abnormal',
  [RUN_STATUS.NORMAL]: 'status-normal'
};

const RUN_STATUS_TEXTS = {
  [RUN_STATUS.ABNORMAL]: '异常',
  [RUN_STATUS.NORMAL]: '正常'
};

export function getRunStatusClass(status) {
  return RUN_STATUS_CLASSES[status] || '';
}

export function getRunStatusText(status) {
  return RUN_STATUS_TEXTS[status] || '未知';
}

const ALARM_STATUS = {
  PENDING: 0,
  HANDLED: 1
};

const ALARM_STATUS_TEXTS = {
  [ALARM_STATUS.PENDING]: '未处理',
  [ALARM_STATUS.HANDLED]: '已处理'
};

export function getAlarmStatusText(status) {
  return ALARM_STATUS_TEXTS[status] || '未知';
}

export function getAlarmStatusOptions(withAll = true) {
  const base = Object.keys(ALARM_STATUS_TEXTS).map(Number).map(k => ({
    label: ALARM_STATUS_TEXTS[k],
    value: k
  }));
  if (withAll) {
    return [{ label: '全部', value: -1 }, ...base];
  }
  return base;
}

export default {
  LIFT_STATUS,
  LIFT_TYPES,
  ALARM_LEVELS,
  ALARM_TYPES,
  MAINTENANCE_STATUS,
  MAINTENANCE_TYPES,
  USER_ROLES,
  USER_STATUS,
  RUN_STATUS,
  ALARM_STATUS,
  getLiftStatusClass,
  getLiftStatusText,
  getLiftStatusOptions,
  getLiftTypeClass,
  getLiftTypeText,
  getLiftTypeOptions,
  getAlarmLevelClass,
  getAlarmLevelText,
  getAlarmLevelColor,
  getAlarmLevelCardClass,
  getAlarmLevelIcon,
  getAlarmLevelOptions,
  getAlarmTypeText,
  getAlarmTypeColor,
  getAlarmTypeEntries,
  getMaintenanceStatusClass,
  getMaintenanceStatusText,
  getMaintenanceStatusColor,
  getMaintenanceStatusOptions,
  getMaintenanceTypeText,
  getMaintenanceTypeOptions,
  getMaintenanceStatusEntries,
  getUserRoleClass,
  getUserRoleText,
  getUserRoleOptions,
  getUserStatusClass,
  getUserStatusText,
  getUserStatusOptions,
  getRunStatusClass,
  getRunStatusText,
  getAlarmStatusText,
  getAlarmStatusOptions
};
