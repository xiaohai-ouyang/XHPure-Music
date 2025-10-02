import { createRouter, createWebHistory } from 'vue-router'
import { usePageStatusStore } from '@/stores/pageStatusStores'

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
    path: '/home',
    component: () => import('@views/home/HomePage.vue'),
    redirect: '/home/music',
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
})

router.beforeEach((to, from, next) => {
  // 动态设置页面标题
  const title = to.meta.title as string | undefined
  if (title) {
    const pageStore = usePageStatusStore()
    pageStore.currentPageTitle = title
  } else {
    const pageStore = usePageStatusStore()
    pageStore.currentPageTitle = '默认标题'
  }
  next()
})

export default router
