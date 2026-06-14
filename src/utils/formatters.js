export function formatIdCard(idCard) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 6) + '********' + idCard.slice(-4);
}

export function formatPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

export function formatDuration(seconds) {
  const secs = Math.floor(seconds || 0);
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  if (mins > 0) {
    return mins + '分' + remainSecs + '秒';
  }
  return remainSecs + '秒';
}

export function formatDurationWithHours(seconds) {
  const secs = Math.floor(seconds || 0);
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainSecs = secs % 60;
  if (hours > 0) {
    return hours + '小时' + mins + '分' + remainSecs + '秒';
  }
  if (mins > 0) {
    return mins + '分' + remainSecs + '秒';
  }
  return remainSecs + '秒';
}

export function formatPercent(value, decimals = 0) {
  const num = Number(value) || 0;
  return (num * 100).toFixed(decimals) + '%';
}

export function formatNumber(value, decimals = 0) {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

export function formatWeight(weight) {
  const num = Number(weight) || 0;
  return num.toFixed(0) + 'kg';
}

export function formatFloor(floor) {
  return (Number(floor) || 0) + 'F';
}

export function formatSpeed(speed) {
  const num = Number(speed) || 0;
  return num.toFixed(2) + 'm/s';
}

export function formatDate(date, withTime = false) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date);
  if (isNaN(d.getTime())) return date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

export function formatDateTimeForStorage(date) {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export function getLoadPercentage(currentWeight, maxWeight) {
  const current = Number(currentWeight) || 0;
  const max = Number(maxWeight) || 1;
  return Math.round((current / max) * 100);
}

export function getLoadColor(percentage) {
  const p = Number(percentage) || 0;
  if (p > 80) return '#f56c6c';
  if (p > 60) return '#e6a23c';
  return '#67c23a';
}

export function getLoadColorByWeight(currentWeight, maxWeight) {
  return getLoadColor(getLoadPercentage(currentWeight, maxWeight));
}

export function calcLicenseStatus(expiryDate) {
  if (!expiryDate) return 'normal';
  const now = new Date();
  const expiry = new Date(expiryDate.replace(/-/g, '/'));
  const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 90) return 'expiring';
  return 'normal';
}

const LICENSE_STATUS_TYPES = {
  normal: 'success',
  expiring: 'warning',
  expired: 'danger'
};

const LICENSE_STATUS_TEXTS = {
  normal: '正常',
  expiring: '即将过期',
  expired: '已过期'
};

export function getLicenseStatusType(expiryDate) {
  const status = calcLicenseStatus(expiryDate);
  return LICENSE_STATUS_TYPES[status] || 'info';
}

export function getLicenseStatusText(expiryDate) {
  const status = calcLicenseStatus(expiryDate);
  return LICENSE_STATUS_TEXTS[status] || '未知';
}

export function getLicenseTagType(type) {
  const map = {
    'A1': 'danger', 'A2': 'danger', 'A3': 'warning',
    'B1': 'warning', 'B2': 'warning',
    'C1': 'success', 'C2': 'success', 'C3': 'success', 'C4': 'success',
    'D': 'info', 'E': 'info', 'F': 'info'
  };
  return map[type] || '';
}

const AVATAR_COLORS = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#5EB2EF', '#85CE61', '#EEBE77', '#F78989', '#ABAFB8'
];

export function getAvatarColor(name, colors = AVATAR_COLORS) {
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getGenderText(gender) {
  return gender === 1 ? '男' : '女';
}

export function getGenderClass(gender) {
  return gender === 1 ? 'gender-male' : 'gender-female';
}

export function generateRandomId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export default {
  formatIdCard,
  formatPhone,
  formatDuration,
  formatDurationWithHours,
  formatPercent,
  formatNumber,
  formatWeight,
  formatFloor,
  formatSpeed,
  formatDate,
  formatDateTimeForStorage,
  getLoadPercentage,
  getLoadColor,
  getLoadColorByWeight,
  calcLicenseStatus,
  getLicenseStatusType,
  getLicenseStatusText,
  getLicenseTagType,
  getAvatarColor,
  getGenderText,
  getGenderClass,
  generateRandomId
};
