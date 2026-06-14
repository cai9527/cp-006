export function validateIdCard(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入身份证号码'));
    return;
  }
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的身份证号码'));
    return;
  }
  callback();
}

export function validatePhone(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入联系电话'));
    return;
  }
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的手机号码'));
    return;
  }
  callback();
}

export function validatePhoneOptional(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  validatePhone(rule, value, callback);
}

export function validateLicenseNo(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入驾驶证号码'));
    return;
  }
  const reg = /^[A-Za-z0-9]{12,18}$/;
  if (!reg.test(value)) {
    callback(new Error('驾驶证号码格式不正确'));
    return;
  }
  callback();
}

export function validateDeviceCode(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入设备编号'));
    return;
  }
  const reg = /^[A-Za-z0-9_-]+$/;
  if (!reg.test(value)) {
    callback(new Error('设备编号只能包含字母、数字、下划线和中划线'));
    return;
  }
  callback();
}

export function validateWeight(rule, value, callback) {
  if (value === null || value === undefined || value === '') {
    callback(new Error('请输入最大载重'));
    return;
  }
  const num = Number(value);
  if (isNaN(num) || num < 100) {
    callback(new Error('最大载重不能小于100kg'));
    return;
  }
  callback();
}

export function validateFloor(rule, value, callback) {
  if (value === null || value === undefined || value === '') {
    callback(new Error('请输入总楼层数'));
    return;
  }
  const num = Number(value);
  if (isNaN(num) || num < 1) {
    callback(new Error('总楼层数不能小于1'));
    return;
  }
  callback();
}

export function validateRequired(message) {
  return function(rule, value, callback) {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      callback(new Error(message || '该项为必填项'));
      return;
    }
    callback();
  };
}

export function validateLength(min, max, fieldName) {
  return function(rule, value, callback) {
    if (!value) {
      callback();
      return;
    }
    const len = String(value).length;
    if (min !== undefined && len < min) {
      callback(new Error(`${fieldName || '该字段'}长度不能小于 ${min} 个字符`));
      return;
    }
    if (max !== undefined && len > max) {
      callback(new Error(`${fieldName || '该字段'}长度不能大于 ${max} 个字符`));
      return;
    }
    callback();
  };
}

export function validateEmail(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'));
    return;
  }
  callback();
}

export function validateNumberRange(min, max, fieldName) {
  return function(rule, value, callback) {
    if (value === null || value === undefined || value === '') {
      callback();
      return;
    }
    const num = Number(value);
    if (isNaN(num)) {
      callback(new Error(`${fieldName || '该字段'}必须是数字`));
      return;
    }
    if (min !== undefined && num < min) {
      callback(new Error(`${fieldName || '该字段'}不能小于 ${min}`));
      return;
    }
    if (max !== undefined && num > max) {
      callback(new Error(`${fieldName || '该字段'}不能大于 ${max}`));
      return;
    }
    callback();
  };
}

export function validatePastDate(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const date = new Date(value.replace(/-/g, '/'));
  if (date.getTime() > Date.now()) {
    callback(new Error('日期不能晚于今天'));
    return;
  }
  callback();
}

export function validateFutureDate(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const date = new Date(value.replace(/-/g, '/'));
  const yesterday = Date.now() - 86400000;
  if (date.getTime() < yesterday) {
    callback(new Error('日期不能早于今天'));
    return;
  }
  callback();
}

export function buildFieldRules(config) {
  const rules = [];
  if (config.required) {
    rules.push({ required: true, message: config.requiredMessage || `请输入${config.label || '该项'}`, trigger: config.trigger || 'blur' });
  }
  if (config.min !== undefined || config.max !== undefined) {
    rules.push({
      min: config.min,
      max: config.max,
      message: `${config.label || '该字段'}长度在 ${config.min || 0} 到 ${config.max || '不限'} 个字符`,
      trigger: config.trigger || 'blur'
    });
  }
  if (config.validator) {
    rules.push({ validator: config.validator, trigger: config.trigger || 'blur' });
  }
  if (config.type) {
    rules.push({ type: config.type, message: config.typeMessage || `请输入正确的${config.label || '格式'}`, trigger: config.trigger || 'blur' });
  }
  return rules;
}

export default {
  validateIdCard,
  validatePhone,
  validatePhoneOptional,
  validateLicenseNo,
  validateDeviceCode,
  validateWeight,
  validateFloor,
  validateRequired,
  validateLength,
  validateEmail,
  validateNumberRange,
  validatePastDate,
  validateFutureDate,
  buildFieldRules
};
