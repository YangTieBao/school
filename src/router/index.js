import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/revisePassword',
    name: 'revisePassword',
    component: () => import('../views/revisePassword.vue')
  },
  {
    path: '/backManage',
    name: 'backManage',
    component: () => import('../views/backManage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/backManage/checkSchedule',
        name: 'checkSchedule',
        component: () => import('../views/checkSchedule.vue')
      },
      {
        path: '/backManage/all',
        name: 'all',
        component: () => import('../views/allTable.vue')
      },
      {
        path: '/backManage',
        redirect: '/backManage/all'
      }
    ]
  },
  {
    path: '*',
    redirect: '/login'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果没有登录（Vuex 中没有 userID 或 password），则跳转到登录页面
    if (!store.state.userID || !store.state.password) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 保存用户想去的页面，用于登录后跳转
      });
    } else {
      next(); // 已经登录，继续访问
    }
  } else {
    next(); // 不需要登录，继续访问
  }
});

export default router
