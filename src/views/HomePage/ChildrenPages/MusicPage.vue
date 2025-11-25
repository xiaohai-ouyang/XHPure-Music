<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useScrollRestore } from '@/composables/useScrollRestore'
import { useMusicPicker } from '@/composables/useMusicPicker'
import { formatTimeDetailed } from '@/utils/formatTime'
import { usePlaylistStore } from '@/stores/playlistStores'
import MusicListItem from '@/components/MusicPage/MusicListItem.vue'
import MusicFunctionBar from '@/components/MusicPage/MusicFunctionBar.vue'
import EmptyMusicState from '@/components/MusicPage/EmptyMusicState.vue'

const listContainer = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const playbackQueueStore = usePlaybackQueueStore()
const musicStore = useMusicMetaStore()
const playlistStore = usePlaylistStore()
const { pickMusic } = useMusicPicker()
const currentPlayingId = computed(() => playbackQueueStore.currentPlayingId)
useScrollRestore({ containerRef: listContainer, key: 'music-list' })

function handleMusicClick(music: MusicInfo) {
  playbackQueueStore.addToPlaybackQueue(music)
}

function handleAddToPlaylist(music: MusicInfo) {
  playlistStore.addInPlaylist('favorite', music)
}

interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
}

function pushAllToPlaylist() {
  musicStore.musicList.forEach((music) => {
    playbackQueueStore.addToPlaybackQueue(music)
  })
}

// 虚拟滚动逻辑
const ITEM_HEIGHT = 151 // 146px item height + 5px gap
const BUFFER = 5
const scrollTop = ref(0)
const containerHeight = ref(window.innerHeight)
const headerHeight = ref(50) // 预估高度

const updateContainerHeight = () => {
  if (listContainer.value) {
    containerHeight.value = listContainer.value.clientHeight
  }
  if (headerRef.value) {
    headerHeight.value = headerRef.value.offsetHeight
  }
}

const onScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)
  // 初始获取一次 scrollTop，以防 useScrollRestore 已经恢复了位置
  if (listContainer.value) {
    scrollTop.value = listContainer.value.scrollTop
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
})

const visibleRange = computed(() => {
  const listScrollTop = Math.max(0, scrollTop.value - headerHeight.value)
  const startIndex = Math.floor(listScrollTop / ITEM_HEIGHT)
  const renderCount = Math.ceil(containerHeight.value / ITEM_HEIGHT)

  return {
    start: Math.max(0, startIndex - BUFFER),
    end: Math.min(musicStore.musicList.length, startIndex + renderCount + BUFFER),
  }
})

const visibleData = computed(() => {
  return musicStore.musicList.slice(visibleRange.value.start, visibleRange.value.end)
})

const totalListHeight = computed(() => musicStore.musicList.length * ITEM_HEIGHT)
const offsetY = computed(() => visibleRange.value.start * ITEM_HEIGHT)
</script>

<template>
  <div class="xhpure-music" ref="listContainer" @scroll="onScroll">
    <EmptyMusicState v-if="musicStore.isEmpty" @pick-music="pickMusic" />

    <template v-else>
      <div ref="headerRef">
        <MusicFunctionBar
          :music-count="musicStore.musicList.length"
          :total-minutes="formatTimeDetailed(musicStore.totalDuration).totalMins.toString()"
          @push-all-to-playlist="pushAllToPlaylist"
        />
      </div>

      <div class="music-item-box" :style="{ height: totalListHeight + 'px', position: 'relative' }">
        <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
          <MusicListItem
            v-for="music in visibleData"
            :key="music.id"
            :music="music"
            :current-playing-id="currentPlayingId"
            @click="handleMusicClick"
            @add-to-playlist="handleAddToPlaylist"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.music-item-box {
  // 移除原来的 flex 布局，因为现在由 virtual-list-content 接管
  // .col-flex(@align: stretch,@gap: 5px);
}

.virtual-list-content {
  .col-flex(@align: stretch,@gap: 5px);
}
</style>
