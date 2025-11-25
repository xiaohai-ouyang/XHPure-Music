<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import type { MusicInfo } from '@/stores/musicMetaStores'
import PlaybackQueueItem from './PlaybackQueueItem.vue'

const playbackQueueStore = usePlaybackQueueStore()
const pageStatusStore = usePageStatusStore()
const musicItemRefs = ref<InstanceType<typeof PlaybackQueueItem>[]>([])

function clearPlaybackQueue() {
  // 获取页面中的audio元素
  const audio = document.querySelector('audio')
  if (audio) {
    // 暂停音频播放
    audio.pause()
    // 重置播放时间
    audio.currentTime = 0
    // 清空音频源
    audio.src = ''
    // 重新加载音频元素
    audio.load()
  }
  // 设置播放状态为停止
  playbackQueueStore.isPlaying = false
  // 清空播放列表
  playbackQueueStore.clearPlaybackQueue()
}

function setMusicItemRef(el: InstanceType<typeof PlaybackQueueItem> | null, index: number) {
  if (el) {
    if (musicItemRefs.value.length <= index) {
      musicItemRefs.value = new Array(index + 1)
    }
    musicItemRefs.value[index] = el
  }
}

function scrollToPlayingItem() {
  nextTick(() => {
    const index = playbackQueueStore.playbackQueue.findIndex(
      (music: MusicInfo) => music.id === playbackQueueStore.currentPlayingId,
    )
    const el = musicItemRefs.value[index]?.$el
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })
}

watch(
  () => [playbackQueueStore.playbackQueue, playbackQueueStore.currentPlayingId],
  () => {
    scrollToPlayingItem()
  },
  { flush: 'post' },
)

import { heightTransition } from '@/utils/heightTransition'
const playbackQueueRef = ref<HTMLElement | null>(null)

// 监听播放队列显示状态变化，每次显示时执行 heightTransition
watch(
  () => pageStatusStore.isPlayQueueShow,
  (newVal) => {
    if (playbackQueueRef.value) {
      heightTransition({ value: playbackQueueRef.value }, newVal)
    }
  },
)

onMounted(() => {
  scrollToPlayingItem()
})
</script>

<template>
  <div class="my-playback-queue" ref="playbackQueueRef" @click.stop>
    <div v-show="playbackQueueStore.isPlaybackQueueEmpty" class="empty-playlist">
      <p>播放队列为空</p>
    </div>

    <div v-show="!playbackQueueStore.isPlaybackQueueEmpty" class="has-playlist">
      <div class="controls-btn">
        <button
          class="mode-switch"
          :class="playbackQueueStore.playMode"
          @click.stop="playbackQueueStore.cyclePlayMode"
          :aria-label="`${playbackQueueStore.playModeLabel}`"
        >
          <span class="iconfont" v-html="playbackQueueStore.playModeIcon" aria-hidden="true"></span>
          {{ playbackQueueStore.playModeLabel }}
        </button>

        <button class="clear-list" @click.stop="clearPlaybackQueue" aria-label="清空播放队列">
          清空队列
        </button>
      </div>

      <TransitionGroup name="fade" tag="div" class="my-playback-queue-container">
        <PlaybackQueueItem
          v-for="(music, index) in playbackQueueStore.playbackQueue"
          :key="music.id"
          :music="music"
          :current-playing-id="playbackQueueStore.currentPlayingId"
          :ref="(el) => setMusicItemRef(el as InstanceType<typeof PlaybackQueueItem> | null, index)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="less">
.my-playback-queue {
  position: fixed;
  bottom: 50px;
  right: 0;
  width: 350px;
  height: 0;
  overflow: hidden;
  background-color: @lightMode-secondary-bgColor;
  border-radius: 8px 8px 0 0;
  z-index: 1000;
  box-shadow: -5px 0 15px @lightMode-shadow-color;
}

.has-playlist {
  .col-flex();
  max-height: 510px;
}

.controls-btn {
  .row-flex(@justify:space-between, @align:center,@gap: 20px);
  padding: 10px 15px;
  border-bottom: 1px solid @lightMode-border-color;
  font-size: 16px;

  button {
    flex: 1;
    height: 40px;
    cursor: pointer;
    border-radius: 10px;
  }

  .mode-switch {
    .row-flex(@align:center,@gap: 5px);
    padding: 5px 10px;
    background-color: @lightMode-button-bg;
    transition: all 0.3s ease;

    &.loop {
      background-color: @lightMode-color-danger;
      color: @lightMode-text-on-primary;
    }

    &.random {
      background-color: @lightMode-color-info;
      color: @lightMode-text-on-primary;
    }
  }

  .clear-list {
    padding: 5px 10px;
    background-color: @lightMode-button-bg;
    transition: all 0.3s ease;

    &:hover {
      background-color: @lightMode-color-danger;
      color: @lightMode-text-on-primary;
    }
  }
}

.my-playback-queue-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  .col-flex(@align:center,@gap:5px);
}

.empty-playlist {
  .col-flex(@align:center, @justify:center);
  height: 100px;
  color: @lightMode-text-tertiary;
}
</style>
