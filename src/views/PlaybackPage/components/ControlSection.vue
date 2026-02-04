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
const muteIcon = computed(() => (isMuted.value ? '&#xeca9;' : '&#xeca6;'))

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
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="play-pause" @click="togglePlayPause">
          <i class="iconfont" v-if="!playbackQueueStore.isPlaying">&#xe63d;</i>
          <i class="iconfont" v-else>&#xe67b;</i>
        </button>
        <button class="next-btn" @click="() => playbackQueueStore.playNext()">
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>

      <div class="function-btn">
        <button
          class="mode-switch-btn"
          :class="playbackQueueStore.playMode"
          @click="playbackQueueStore.cyclePlayMode"
          :aria-label="`${playbackQueueStore.playModeLabel}`"
        >
          <i class="iconfont" v-html="playbackQueueStore.playModeIcon"></i>
        </button>

        <button class="mute-btn iconfont" @click="toggleMute" :title="muteTitle">
          <i class="iconfont" v-html="muteIcon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.controlers {
  width: 40vmin;

  .ctl-btns {
    .row-flex(@justify: center, @align: center, @gap: 2vmin);
    margin-top: 2vmin;
    height: 3vmin;
    overflow: hidden;

    button,
    .iconfont {
      .col-flex(@align:center);
      color: inherit;
    }
  }

  .controls-btn {
    margin-right: auto;

    .iconfont {
      font-size: 3.4vmin;
    }
  }

  .function-btn {
    .iconfont {
      font-size: 2.8vmin;
    }
  }

  .controls-btn,
  .function-btn {
    .row-flex(@align: center, @justify: center, @gap: 1.5vmin);
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

.progress-line .progress-filled {
  background: currentColor;
}
</style>
