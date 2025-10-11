<template>
  <div class="homePage">
    <MyNav />
    <div class="main-container" ref="mainContainer">
      <MyHeader />
      <div class="main-page">
        <router-view></router-view>
      </div>
      <MyPlayerBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import MyHeader from '@components/Header/MyHeader.vue'
import MyNav from '@components/Nav/MyNav.vue'
import MyPlayerBar from '@components/PlayerBar/MyPlayerBar.vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'

const mainContainer = ref<HTMLElement | null>(null)
const pageStore = usePageStatusStore()
const pageWidth = ref<number | null>(null)

let resizeObserver: ResizeObserver | null = null

function observeContainer() {
  if (!mainContainer.value) return
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    pageWidth.value = entry.contentRect.width
    pageStore.pageWidth = pageWidth.value
  })
  resizeObserver.observe(mainContainer.value)
}

onMounted(() => {
  observeContainer()
})

onUnmounted(() => {
  if (resizeObserver && mainContainer.value) {
    resizeObserver.unobserve(mainContainer.value)
    resizeObserver = null
  }
})
</script>

<style lang="less" scoped>
.homePage {
  .row-flex();
  background-color: @lightMode-mainPage-bgColor;
}

.main-container {
  flex: 1;
}

.main-page {
  padding: 35px 0 50px 0;
  height: 100vh;
  overflow: hidden;
}
</style>
