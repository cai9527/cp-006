import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/views/Login.vue';
import Monitor from '@/views/Monitor.vue';
import Statistics from '@/views/Statistics.vue';
import Maintenance from '@/views/Maintenance.vue';
import Users from '@/views/Users.vue';
import Alarm from '@/views/Alarm.vue';

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
      component: Login
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: Monitor
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: Statistics
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: Maintenance
    },
    {
      path: '/users',
      name: 'Users',
      component: Users
    },
    {
      path: '/alarm',
      name: 'Alarm',
      component: Alarm
    }
  ]
});
