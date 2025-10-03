import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import '@/assets/styles/variables.less'
import 'animate.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

import { usePageStatusStore } from '@/stores/pageStatusStores'
import { watch } from 'vue'

const pageStore = usePageStatusStore()

watch(
  () => pageStore.isPlayBackExpand,
  (newVal) => {
    const currentPath = router.currentRoute.value.path

    if (newVal && currentPath !== '/playback') {
      router.push('/playback')
    } else if (!newVal && currentPath === '/playback') {
      router.back()
    }
  },
  { immediate: false },
)

router.beforeEach((to, from, next) => {
  const title = to.meta.title as string | undefined
  pageStore.currentPageTitle = title || '默认标题'
  next()
})

app.mount('#app')
