import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true,
    meta: {
      title: '第三方登录'
    }
  },
  {
    path: '/news',
    component: () => import('@/views/entertainment/news'),
    hidden: true,
    meta: {
      title: '资讯'
    }
  },
  {
    path: '/video',
    component: () => import('@/views/entertainment/video'),
    hidden: true,
    meta: {
      title: '视频'
    }
  },
  {
    path: '/videoInfo',
    component: () => import('@/views/entertainment/videoInfo'),
    hidden: true,
    meta: {
      title: '视频详情'
    }
  },
  {
    path: '/music',
    component: () => import('@/views/entertainment/music'),
    hidden: true,
    meta: {
      title: '音乐'
    }
  },
  {
    path: '/book',
    component: () => import('@/views/entertainment/book'),
    hidden: true,
    meta: {
      title: '阅读'
    }
  },
  {
    path: '/chapter',
    component: () => import('@/views/entertainment/chapter'),
    hidden: true,
    meta: {
      title: '阅读章节详情'
    }
  },
  {
    path: '/chat',
    component: () => import('@/views/entertainment/chat'),
    hidden: true,
    meta: {
      title: '聊天室'
    }
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [

]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
