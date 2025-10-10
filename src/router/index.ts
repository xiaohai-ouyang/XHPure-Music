// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    component: () => import('@views/welcome/WelcomePage.vue'),
  },
  {
    path: '/playback',
    component: () => import('@views/playback/PlaybackPage.vue'),
  },
  {
    path: '/page',
    component: () => import('@views/home/HomePage.vue'),
    redirect: '/page/music',
    children: [
      {
        path: 'music',
        component: () => import('@views/home/MusicPage.vue'),
        meta: {
          title: '歌曲',
        },
      },
      {
        path: 'albums',
        component: () => import('@views/home/AlbumsPage.vue'),
        meta: {
          title: '专辑',
        },
      },
      {
        path: 'artists',
        component: () => import('@views/home/ArtistsPage.vue'),
        meta: {
          title: '艺术家',
        },
      },
      {
        path: 'playlists',
        component: () => import('@views/home/PlaylistsPage.vue'),
        meta: {
          title: '歌单',
        },
      },
      {
        path: 'folders',
        component: () => import('@views/home/FoldersPage.vue'),
        meta: {
          title: '文件夹',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果浏览器有保存的滚动位置（后退/前进）
    if (savedPosition) {
      return savedPosition
    }
    // 默认滚动到顶部
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
