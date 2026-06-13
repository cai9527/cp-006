import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/views/Login.vue';
import Monitor from '@/views/Monitor.vue';
import Statistics from '@/views/Statistics.vue';
import Maintenance from '@/views/Maintenance.vue';
import Users from '@/views/Users.vue';
import Alarm from '@/views/Alarm.vue';
import { isLoggedIn, canAccessRoute } from '@/utils/permissions';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/monitor'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: Monitor,
      meta: { requiresAuth: true, adminOnly: false }
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: Statistics,
      meta: { requiresAuth: true, adminOnly: false }
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: Maintenance,
      meta: { requiresAuth: true, adminOnly: false }
    },
    {
      path: '/users',
      name: 'Users',
      component: Users,
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/alarm',
      name: 'Alarm',
      component: Alarm,
      meta: { requiresAuth: true, adminOnly: false }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    if (isLoggedIn()) {
      return next('/monitor');
    }
    return next();
  }

  if (!isLoggedIn()) {
    return next('/login');
  }

  if (!canAccessRoute(to.path)) {
    Vue.prototype.$message && Vue.prototype.$message.error && Vue.prototype.$message.error('无权访问该页面');
    return next('/monitor');
  }

  next();
});

export default router;
