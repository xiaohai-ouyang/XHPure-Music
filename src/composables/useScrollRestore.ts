import { onMounted, nextTick, onBeforeUnmount, type Ref } from 'vue'
import { useRoute } from 'vue-router'

interface Options {
  containerRef: Ref<HTMLElement | null>
  key?: string
}

const scrollPositions = new Map<string, number>()

export function useScrollRestore({ containerRef, key }: Options) {
  const route = useRoute()
  const scrollKey = key || route.fullPath

  onMounted(() => {
    nextTick(() => {
      const saved = scrollPositions.get(scrollKey)
      if (containerRef.value && saved !== undefined) {
        containerRef.value.scrollTop = saved
      }
    })
  })

  onBeforeUnmount(() => {
    if (containerRef.value) {
      scrollPositions.set(scrollKey, containerRef.value.scrollTop)
    }
  })

  return {
    restoreScroll: () => {
      if (containerRef.value) {
        const saved = scrollPositions.get(scrollKey)
        if (saved !== undefined) containerRef.value.scrollTop = saved
      }
    },
  }
}
