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
  {
    path: '/playback',
    component: () => import('@views/home/PlaybackPage.vue'),
    meta: {
      title: '播放页',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
