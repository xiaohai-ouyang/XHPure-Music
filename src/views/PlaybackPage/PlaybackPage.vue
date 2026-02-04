<script setup lang="ts">
import LrcParser from '@/components/PlaybackPage/LrcParser.vue'
import { computed, ref, watch } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useDominantColor } from '@/composables/useDominantColor'
import HeaderSection from './components/HeaderSection.vue'
import CoverSection from './components/CoverSection.vue'
import ControlSection from './components/ControlSection.vue'
import { usePlaylistStore } from '@/stores/playlistStores'
import ColorWheel from './components/ColorWheel.vue'

// 播放列表和页面状态管理
const playbackQueueStore = usePlaybackQueueStore()
const playlistStore = usePlaylistStore()

// 创建默认的音乐信息对象，避免重复创建
const defaultMusicInfo = {
  title: '',
  artist: '',
  album: '',
  cover: '',
  lyrics: '',
}

// 当前播放的音乐信息
const currentPlaying = computed(() => playbackQueueStore.currentPlaying || defaultMusicInfo)

// 更多菜单显示状态
const moreListShow = ref(false)

// 色盘显示状态
const isColorWheelHovered = ref(false)

/**
 * 切换更多菜单显示状态
 */
const toggleMoreList = () => (moreListShow.value = !moreListShow.value)

// 播放状态
const isPlaying = computed(() => playbackQueueStore.isPlaying)

// 主题颜色相关功能
const { pageStyle, setCover, backgroundStyle, coverUrl, textColors, selectedColorIndex } =
  useDominantColor()

// 监听封面变化并更新背景
watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    setCover(newCover as string)
  },
  { immediate: true },
)
</script>

<template>
  <div class="playback-page" :style="pageStyle" :class="{ paused: !isPlaying }">
    <!-- 背景模糊效果 -->
    <div v-if="coverUrl" class="background-blur" :style="backgroundStyle"></div>

    <div class="content">
      <HeaderSection />

      <main>
        <div class="left">
          <CoverSection @toggle-more-list="toggleMoreList">
            <template #more-menu>
              <!-- 更多操作菜单 -->
              <transition name="fade-slide">
                <div class="more-menu" v-show="moreListShow">
                  <button
                    class="more-menu-item"
                    @click="playlistStore.addInPlaylist('favorite', currentPlaying)"
                  >
                    <i class="iconfont">&#xe761;</i><span>我喜欢</span>
                  </button>
                  <button class="more-menu-item">
                    <i class="iconfont add">&#xe730;</i><span>添加到歌单</span>
                  </button>
                </div>
              </transition>
            </template>
          </CoverSection>

          <ControlSection />
        </div>

        <!-- 歌词显示区域 -->
        <div
          class="right"
          v-if="
            currentPlaying.lyrics &&
            typeof currentPlaying.lyrics === 'string' &&
            currentPlaying.lyrics.trim()
          "
        >
          <LrcParser
            :dominantTextColor="textColors[selectedColorIndex]"
            :lyrics="(currentPlaying.lyrics as string) || ''"
            :current-time="playbackQueueStore.currentPlayingTime"
            :remove-chinese="playbackQueueStore.removeChinese"
          />
          <ColorWheel
            class="floating-color-wheel"
            :class="{ 'wheel-hide': !isColorWheelHovered }"
            @mouseenter="isColorWheelHovered = true"
            @mouseleave="isColorWheelHovered = false"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
.playback-page {
  .row-flex(@align:center);
  position: relative;
  height: 100vh;
  min-width: 840px;
  min-height: 670px;
  overflow: hidden;
  background-size: 300% 300%;
  animation: gradientMove 10s ease infinite;
  will-change: background-position, filter, color;
  color: inherit;

  * {
    user-select: none;
  }

  .title,
  .artist,
  .more-menu-item,
  .iconfont,
  button {
    color: inherit;
  }
}

.playback-page.paused {
  animation-play-state: paused;
}

.progress-line .progress-filled {
  background: currentColor;
}

.background-blur {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(100px) brightness(0.6);
  transform: scale(1.2);
  z-index: 0;
  opacity: 0.8;
  transition: opacity 1s ease;
  will-change: transform, opacity;
}

.playback-page.paused .background-blur {
  filter: blur(60px) brightness(0.45);
  opacity: 0.7;
  will-change: auto;
  transition:
    filter 0.6s ease,
    opacity 0.6s ease;
}

.content {
  .col-flex();
  z-index: 2;
  padding: 10px;
  width: 100%;
  height: 100%;
}

main {
  .row-flex(@align: center,@justify: space-around);
  position: relative;
  width: 100%;
  height: 100%;

  .right {
    flex: 1;
    position: relative;
    .row-flex(@align: center );
  }

  .floating-color-wheel {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .wheel-hide {
    opacity: 0.5;
    transform: translateY(-50%) translateX(65%);
  }

  .left {
    flex: 1;
    .col-flex(@align: center );
  }
}

.music-info {
  * {
    transition: all 0.3s linear;
  }
}

.more-menu {
  .col-flex(@align: flex-start,@justify: center ,@gap: 0.5vmin);
  position: absolute;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  bottom: 52%;
  right: -32%;
  padding: 0 0.8vmin;
  border-radius: 0.5vmin;
  z-index: 999;
  overflow: hidden;

  .iconfont {
    .row-flex(@align: center,@justify: center);
    font-size: 2.8vmin;
    width: 2.8vmin;
    height: 2.8vmin;
  }

  .add {
    font-size: 3.2vmin;
  }

  .more-menu-item {
    .row-flex(@align: center,@justify: flex-start,@gap: 0.5vmin);
    width: 100%;
    height: 4vmin;
    cursor: pointer;

    user-select: none;
  }

  span {
    margin: auto;
    text-align: center;
    font-size: 1.4vmin;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: bottom left;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-10px, 10px) scale(0.95);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
    filter: brightness(1);
  }
  25% {
    background-position: 50% 100%;
    filter: brightness(1.1);
  }
  50% {
    background-position: 100% 50%;
    filter: brightness(1.2);
  }
  75% {
    background-position: 50% 0%;
    filter: brightness(1.1);
  }
  100% {
    background-position: 0% 50%;
    filter: brightness(1);
  }
}
</style>
