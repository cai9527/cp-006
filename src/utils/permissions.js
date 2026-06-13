const ROLE_ADMIN = 1;
const ROLE_NORMAL = [2, 3];

const ADMIN_ONLY_ROUTES = ['/users'];

export function getUser() {
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

export function getUserRole() {
  const user = getUser();
  return user ? user.role : null;
}

export function isAdmin() {
  return getUserRole() === ROLE_ADMIN;
}

export function isNormalUser() {
  return ROLE_NORMAL.includes(getUserRole());
}

export function isLoggedIn() {
  return !!getUser();
}

export function canAccessRoute(path) {
  if (!isLoggedIn()) return false;
  if (isAdmin()) return true;
  if (ADMIN_ONLY_ROUTES.some(r => path.startsWith(r))) return false;
  return true;
}

export function canWrite() {
  return isAdmin();
}

export function logout() {
  sessionStorage.removeItem('user');
}

export function getRoleText(role) {
  const texts = { 1: '管理员', 2: '操作员', 3: '维护人员' };
  return texts[role] || '未知';
}

export default {
  ROLE_ADMIN,
  ROLE_NORMAL,
  ADMIN_ONLY_ROUTES,
  getUser,
  getUserRole,
  isAdmin,
  isNormalUser,
  isLoggedIn,
  canAccessRoute,
  canWrite,
  logout,
  getRoleText
};
