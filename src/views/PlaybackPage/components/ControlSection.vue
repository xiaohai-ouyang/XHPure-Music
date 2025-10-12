<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { formatTime, formatNegativeTime } from '@/utils/formatTime'

const playlistStore = usePlaylistStore()
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
</script>

<template>
  <div class="controlers">
    <!-- 进度条 -->
    <div class="progress-line" ref="progressBar" @mousedown="startDrag" @click="seekByClick">
      <div
        class="progress-filled"
        :style="{
          width:
            (playlistStore.currentPlayingTime / playlistStore.currentPlayingDuration) * 100 + '%',
        }"
      ></div>
    </div>

    <div class="timer">
      <span v-html="formatTime(playlistStore.currentPlayingTime)"></span>
      <span
        v-html="
          formatNegativeTime(playlistStore.currentPlayingTime, playlistStore.currentPlayingDuration)
        "
      ></span>
    </div>

    <!-- 控制按钮 -->
    <div class="ctl-btns">
      <div class="controls-btn">
        <button class="prev-btn" @click="() => playlistStore.playPrevious()">
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="play-pause" @click="togglePlayPause">
          <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
          <i class="iconfont" v-else>&#xe67b;</i>
        </button>
        <button class="next-btn" @click="() => playlistStore.playNext()">
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>

      <div class="function-btn">
        <button
          class="mode-switch-btn iconfont"
          v-html="playlistStore.playModeIcon"
          :class="playlistStore.playMode"
          @click="playlistStore.cyclePlayMode"
          :aria-label="`${playlistStore.playModeLabel}`"
        ></button>

        <button
          class="mute-btn iconfont"
          @click="toggleMute"
          :title="muteTitle"
          v-html="muteIcon"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.controlers {
  width: 400px;

  .ctl-btns {
    .row-flex(@justify: center, @align: center,@gap: 20px);
    margin-top: 10px;

    .iconfont {
      font-size: 34px;
    }

    button,
    .iconfont {
      color: inherit;
    }
  }

  .controls-btn {
    margin-right: auto;
  }

  .controls-btn,
  .function-btn {
    .row-flex(@align: center, @justify: center,@gap: 15px);
  }

  .mode-switch-btn,
  .mute-btn {
    font-size: 26px !important;
  }
}

.timer {
  width: 400px;
  font-size: 12px;
  .row-flex(@align: center, @justify: space-between);
  margin-bottom: 12px;
}

.progress-line .progress-filled {
  background: currentColor;
}

.progress-line {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 5px;
  cursor: pointer;
  position: relative;

  .progress-filled {
    height: 100%;
    background: currentColor;
    border-radius: 3px;
    width: 0%;
    transition: width 0.1s linear;
  }
}
</style>
