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

function handleRemove(musicId: string) {
  playbackQueueStores.removeFromplaybackQueue(musicId)
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

function setCurrentPlaying(music: MusicInfo) {
  playbackQueueStores.setCurrentPlaying(music)
}

function setMusicItemRef(el: InstanceType<typeof PlaybackQueueItem> | null, index: number) {
  if (el) {
    if (musicItemRefs.value.length <= index) {
      musicItemRefs.value = new Array(index + 1)
    }
    musicItemRefs.value[index] = el
  }
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
  <div class="my-playback-queue" ref="playbackQueueRef">
    <div v-show="playbackQueueStores.isplaybackQueueEmpty" class="empty-playlist">
      <p>播放队列为空</p>
    </div>

    <div v-show="!playbackQueueStores.isplaybackQueueEmpty" class="has-playlist">
      <div class="controls-btn">
        <button
          class="mode-switch"
          :class="playbackQueueStores.playMode"
          @click="playbackQueueStores.cyclePlayMode"
          :aria-label="`${playbackQueueStores.playModeLabel}`"
        >
          <span
            class="iconfont"
            v-html="playbackQueueStores.playModeIcon"
            aria-hidden="true"
          ></span>
          {{ playbackQueueStores.playModeLabel }}
        </button>

        <button class="clear-list" @click="clearplaybackQueue" aria-label="清空播放队列">
          清空队列
        </button>
      </div>

      <TransitionGroup name="fade" tag="div" class="my-playback-queue-container">
        <PlaybackQueueItem
          v-for="(music, index) in playbackQueueStores.playbackQueue"
          :key="music.id"
          :music="music"
          :current-playing-id="playbackQueueStores.currentPlayingId"
          @set-current-playing="setCurrentPlaying"
          @remove="handleRemove"
          :ref="(el) => setMusicItemRef(el as InstanceType<typeof PlaybackQueueItem> | null, index)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="less">
.my-playback-queue {
  position: fixed;
  right: 0;
  bottom: 50px;
  width: 350px;
  height: 0;
  background-color: @lightMode-secondary-bgColor;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 5;

  .my-playback-queue-container {
    .col-flex();
    max-height: 516px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .has-playlist {
    width: 100%;
    transition: all 0.2s ease-in-out;
  }
}

.fade-enter-active,
.fade-leave-active,
.fade-move {
  transition: all 0.4s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}

.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(0px);
}

.empty-playlist {
  .col-flex(@align:center,@justify: center);
  height: 100px;

  p {
    font-size: 18px;
    color: #999;
  }
}

.controls-btn {
  gap: 10px;
  padding: 5px 12px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;

  button {
    gap: 6px;
    flex: 1;
    padding: 8px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .iconfont {
    font-size: 17px;
  }

  .clear-list {
    background-color: #000814;
  }

  &,
  button {
    .row-flex(@align:center ,@justify: center);
  }
  .loop {
    background-color: #e63946;
  }

  .random {
    background-color: #8338ec;
  }

  .list {
    background-color: #0088ff;
  }
}
</style>
