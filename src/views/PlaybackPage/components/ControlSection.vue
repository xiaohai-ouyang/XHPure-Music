<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { formatTime, formatNegativeTime } from '@/utils/formatTime'

const playbackQueueStore = usePlaybackQueueStore()
const { togglePlayPause, startDrag, seekByClick, progressBar } = useAudioPlayer()

// 静音状态
const isMuted = ref(false)
const volumeBeforeMute = ref(1) // 保存静音前的音量

/**
 * 切换静音状态
 */
const toggleMute = () => {
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  if (isMuted.value) {
    // 取消静音，恢复之前的音量
    audio.volume = volumeBeforeMute.value
    isMuted.value = false
  } else {
    // 静音，保存当前音量
    volumeBeforeMute.value = audio.volume
    audio.volume = 0
    isMuted.value = true
  }
}

const muteTitle = computed(() => (isMuted.value ? '取消静音' : '静音'))

// 计算进度条的比例值
const progressRatio = computed(() => {
  if (playbackQueueStore.currentPlayingDuration <= 0) return 0
  return playbackQueueStore.currentPlayingTime / playbackQueueStore.currentPlayingDuration
})
</script>

<template>
  <div class="controlers">
    <!-- 进度条 -->
    <div class="progress-line" ref="progressBar" @mousedown="startDrag" @click="seekByClick">
      <div class="progress-filled" :style="{ transform: `scaleX(${progressRatio})` }"></div>
    </div>

    <div class="timer">
      <span v-html="formatTime(playbackQueueStore.currentPlayingTime)"></span>
      <span
        v-html="
          formatNegativeTime(
            playbackQueueStore.currentPlayingTime,
            playbackQueueStore.currentPlayingDuration,
          )
        "
      ></span>
    </div>

    <!-- 控制按钮 -->
    <div class="ctl-btns">
      <div class="controls-btn">
        <button class="prev-btn" @click="() => playbackQueueStore.playPrevious()">
          <icon-ph-skip-back :size="32" />
        </button>
        <button class="play-pause" @click="togglePlayPause">
          <icon-ph-play v-if="!playbackQueueStore.isPlaying" :size="32" />
          <icon-ph-pause v-else :size="32" />
        </button>
        <button class="next-btn" @click="() => playbackQueueStore.playNext()">
          <icon-ph-skip-forward :size="32" />
        </button>
      </div>

      <div class="function-btn">
        <button
          class="mode-switch-btn"
          :class="playbackQueueStore.playMode"
          @click="playbackQueueStore.cyclePlayMode"
          :aria-label="`${playbackQueueStore.playModeLabel}`"
        >
          <icon-ph-repeat v-if="playbackQueueStore.playMode === 'loop'" :size="20" />
          <icon-ph-shuffle v-else-if="playbackQueueStore.playMode === 'random'" :size="20" />
          <icon-ph-list-numbers v-else :size="20" />
        </button>

        <button class="mute-btn" @click="toggleMute" :title="muteTitle">
          <icon-ph-speaker-x v-if="isMuted" :size="20" />
          <icon-ph-speaker-high v-else :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.controlers {
  width: 100%;

  .ctl-btns {
    .row-flex(@justify: space-between, @align: center);
    margin-top: 2vmin;
    width: 100%;

    button {
      .col-flex(@align:center);
      color: inherit;
    }
  }

  .controls-btn,
  .function-btn {
    .flex-x-center(@gap: 1.5vmin);
  }
}

.timer {
  width: 100%;
  font-size: 1.2vmin;
  .row-flex(@align: center, @justify: space-between);
  margin-bottom: 1.2vmin;
}

.progress-line {
  width: 100%;
  height: 0.6vmin;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.3vmin;
  margin-bottom: 0.5vmin;
  cursor: pointer;
  position: relative;
  transform-origin: left center;

  .progress-filled {
    height: 100%;
    background: currentColor;
    border-radius: 0.3vmin;
    width: 100%;
    transform-origin: left center;
    transform: scaleX(0);
  }
}
</style>
