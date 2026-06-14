import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/common.css';
import axios from 'axios';
import permissions, { getUserRole, isAdmin, canWrite, isLoggedIn, canAccessRoute } from './utils/permissions';
import statusMappers from './utils/statusMappers';
import formatters from './utils/formatters';
import validators from './utils/validators';
import Components from './components/index.js';

Vue.use(ElementUI);
Vue.use(Components);

axios.interceptors.request.use(config => {
  const role = getUserRole();
  if (role) {
    config.headers['X-User-Role'] = role;
  }
  return config;
}, error => Promise.reject(error));

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        ElementUI.MessageBox.alert('登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          callback: () => {
            sessionStorage.removeItem('user');
            router.push('/login');
          }
        });
      } else if (error.response.status === 403) {
        ElementUI.Message.error(error.response.data && error.response.data.message ? error.response.data.message : '权限不足');
      }
    }
    return Promise.reject(error);
  }
);

Vue.prototype.$axios = axios;
Vue.prototype.$permissions = permissions;

Vue.prototype.$status = statusMappers;
Vue.prototype.$format = formatters;
Vue.prototype.$validators = validators;

Vue.mixin({
  computed: {
    $isAdmin() { return isAdmin(); },
    $canWrite() { return canWrite(); },
    $isLoggedIn() { return isLoggedIn(); },
    $currentUser() { return permissions.getUser(); }
  },
  methods: {
    $canAccessRoute(path) { return canAccessRoute(path); }
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
