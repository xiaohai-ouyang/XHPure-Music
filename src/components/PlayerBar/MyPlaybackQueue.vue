<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useplaybackQueueStore } from '@/stores/playbackQueueStores'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import type { MusicInfo } from '@/stores/musicMetaStores'
import PlaybackQueueItem from './PlaybackQueueItem.vue'

const playbackQueueStores = useplaybackQueueStore()
const pageStatusStore = usePageStatusStore()
const musicItemRefs = ref<InstanceType<typeof PlaybackQueueItem>[]>([])

function clearplaybackQueue() {
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
  playbackQueueStores.isPlaying = false
  // 清空播放列表
  playbackQueueStores.clearplaybackQueue()
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
    const index = playbackQueueStores.playbackQueue.findIndex(
      (music: MusicInfo) => music.id === playbackQueueStores.currentPlayingId,
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
  () => [playbackQueueStores.playbackQueue, playbackQueueStores.currentPlayingId],
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
    <div v-show="playbackQueueStores.isplaybackQueueEmpty" class="empty-playlist">
      <p>播放队列为空</p>
    </div>

    <div v-show="!playbackQueueStores.isplaybackQueueEmpty" class="has-playlist">
      <div class="controls-btn">
        <button
          class="mode-switch"
          :class="playbackQueueStores.playMode"
          @click.stop="playbackQueueStores.cyclePlayMode"
          :aria-label="`${playbackQueueStores.playModeLabel}`"
        >
          <span
            class="iconfont"
            v-html="playbackQueueStores.playModeIcon"
            aria-hidden="true"
          ></span>
          {{ playbackQueueStores.playModeLabel }}
        </button>

        <button class="clear-list" @click.stop="clearplaybackQueue" aria-label="清空播放队列">
          清空队列
        </button>
      </div>

      <TransitionGroup name="fade" tag="div" class="my-playback-queue-container">
        <PlaybackQueueItem
          v-for="(music, index) in playbackQueueStores.playbackQueue"
          :key="music.id"
          :music="music"
          :current-playing-id="playbackQueueStores.currentPlayingId"
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
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.has-playlist {
  .col-flex();
  max-height: 510px;
}

.controls-btn {
  .row-flex(@justify:space-between, @align:center,@gap: 20px);
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
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
    background-color: #f0f0f0;
    transition: all 0.3s ease;

    &.loop {
      background-color: #ff5c5c;
      color: white;
    }

    &.random {
      background-color: #5c9dff;
      color: white;
    }
  }

  .clear-list {
    padding: 5px 10px;
    background-color: #f0f0f0;
    transition: all 0.3s ease;

    &:hover {
      background-color: #ff5c5c;
      color: white;
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
  color: #999;
}
</style>
