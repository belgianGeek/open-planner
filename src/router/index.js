import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import RequestVue from '../views/RequestVue.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
      path: '/locations',
      name: 'locations.manage',
      component: () => import('../views/LocationsManagement.vue'),
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/new-request',
      name: 'home.new_request',
      component: RequestVue
    },
    {
      path: '/request-success',
      name: 'request-success',
      component: () => import('../views/RequestSuccess.vue')
    },
    {
      path: '/users',
      name: 'users.manage',
      component: () => import('../views/UsersManagement.vue'),
      props: true
    },
    {
      path: '/user/3',
      name: 'users.details',
      component: () => import('../views/UserDetail.vue')
    }
  ]
})

export default router;
