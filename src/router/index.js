import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/monitor'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: () => import('@/views/Monitor.vue')
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('@/views/Statistics.vue')
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/views/Maintenance.vue')
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('@/views/Users.vue')
    },
    {
      path: '/alarm',
      name: 'Alarm',
      component: () => import('@/views/Alarm.vue')
    }
  ]
});
