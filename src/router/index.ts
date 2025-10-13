// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    component: () => import('@views/WelcomePage/WelcomePage.vue'),
  },
  {
    path: '/playback',
    component: () => import('@views/PlaybackPage/PlaybackPage.vue'),
  },
  {
    path: '/page',
    component: () => import('@views/HomePage/HomePage.vue'),
    redirect: '/page/music',
    children: [
      {
        path: 'music',
        component: () => import('@views/HomePage/ChildrenPages/MusicPage.vue'),
        meta: {
          title: '歌曲',
        },
      },
      {
        path: 'albums',
        component: () => import('@views/HomePage/ChildrenPages/AlbumsPage.vue'),
        meta: {
          title: '专辑',
        },
      },
      {
        path: 'artists',
        component: () => import('@views/HomePage/ChildrenPages/ArtistsPage.vue'),
        meta: {
          title: '艺术家',
        },
      },
      {
        path: 'playlists',
        component: () => import('@views/HomePage/ChildrenPages/PlaylistsPages/PlaylistsPage.vue'),
        meta: {
          title: '歌单',
        },
      },
      {
        path: 'playlists/:id',
        component: () =>
          import('@views/HomePage/ChildrenPages/PlaylistsPages/PlaylistDetailPage.vue'),
        meta: {
          title: '歌单详情',
        },
      },
      {
        path: 'folders',
        component: () => import('@views/HomePage/ChildrenPages/FoldersPage.vue'),
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
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
