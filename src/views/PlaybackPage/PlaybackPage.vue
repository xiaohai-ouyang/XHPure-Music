<script setup lang="ts">
import router from '@/router'
import LrcParser from '@/components/Playback/LrcParser.vue'
import { computed, ref, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useDominantColor } from '@/composables/useDominantColor'
import { useLrcParser } from '@/composables/useLrcParser'

// 播放列表和页面状态管理
const playlistStore = usePlaylistStore()
const pageStatusStore = usePageStatusStore()

// 当前播放的音乐信息
const currentPlaying = computed(
  () =>
    playlistStore.currentPlaying || {
      title: '',
      artist: '',
      album: '',
      cover: '',
      lyrics: '',
    },
)

// 歌词文本
const lyricsText = computed(() => (currentPlaying.value.lyrics as string) || '')

// 中文翻译切换功能
const toggleChinese = () => {
  if (playlistStore.currentPlayingId) {
    const newState = !playlistStore.currentSongRemoveChinese
    playlistStore.setSongChineseState(playlistStore.currentPlayingId, newState)
    playlistStore.removeChinese = newState
  }
}

// 监听当前播放歌曲变化，同步中文显示状态
watch(
  () => playlistStore.currentPlayingId,
  (newId) => {
    if (newId) {
      playlistStore.removeChinese = playlistStore.currentSongRemoveChinese
    }
  },
  { immediate: true },
)

// 判断是否为双语歌词与是否显示去中文按钮
const { showRemoveChineseButton } = useLrcParser(
  lyricsText,
  ref(undefined),
  ref(null),
  computed(() => playlistStore.removeChinese),
)

// 直接使用 useLrcParser 提供的 showRemoveChineseButton 值
const shouldShowRemoveChinese = computed(() => showRemoveChineseButton.value)

// 主题颜色相关功能
const {
  selectedColorIndex,
  selectColor,
  textColors,
  pageStyle,
  setCover,
  backgroundStyle,
  coverUrl,
} = useDominantColor()

// 监听封面变化并更新背景
watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    setCover(newCover as string)
  },
  { immediate: true },
)

// 音频播放控制相关功能
const { togglePlayPause, startDrag, seekByClick, progressBar } = useAudioPlayer()

// 更多菜单显示状态
const moreListShow = ref(false)
const toggleMoreList = () => (moreListShow.value = !moreListShow.value)

// 返回上一页
const back = () => {
  pageStatusStore.isPlayBackExpand = false
  router.back()
}

// 播放状态
const isPlaying = computed(() => playlistStore.isPlaying)

const translationTooltip = computed(() =>
  playlistStore.currentSongRemoveChinese ? '显示中文' : '隐藏中文',
)
</script>

<template>
  <div class="playback-page" :style="pageStyle" :class="{ paused: !isPlaying }">
    <!-- 背景模糊效果 -->
    <div v-if="coverUrl" class="background-blur" :style="backgroundStyle"></div>

    <div class="content">
      <header>
        <!-- 返回按钮 -->
        <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i>返回</button>

        <!-- 颜色选择器 -->
        <div class="color-wheel">
          <div
            v-for="(color, index) in textColors"
            :key="index"
            class="color-item"
            :class="{ selected: index === selectedColorIndex }"
            :style="{ background: color }"
            @click="selectColor(index)"
          ></div>
        </div>
      </header>

      <main>
        <div class="left">
          <!-- 音乐封面 -->
          <div class="music-cover">
            <img
              :src="(currentPlaying.cover as string) || ''"
              :alt="(currentPlaying.title as string) || ''"
            />
          </div>

          <!-- 音乐信息 -->
          <div class="music-info">
            <div class="mleft">
              <div class="title">{{ currentPlaying.title }}</div>
              <div class="artist">{{ currentPlaying.artist }}</div>
            </div>

            <div class="mright">
              <button
                class="iconfont remove-chinese-btn"
                v-if="shouldShowRemoveChinese"
                @click="toggleChinese"
                :title="translationTooltip"
              >
                &#xe644;
              </button>

              <!-- 更多操作按钮 -->
              <button class="iconfont more-btn" @click="toggleMoreList" title="更多">
                &#xe71a;
              </button>

              <!-- 更多操作菜单 -->
              <transition name="fade-slide">
                <div class="more-menu" v-show="moreListShow">
                  <button class="more-menu-item"><i class="iconfont">&#xe761;</i>我喜欢</button>
                  <button class="more-menu-item"><i class="iconfont">&#xe730;</i>添加到歌单</button>
                  <button class="more-menu-item"><i class="iconfont">&#xe66e;</i>再放一次</button>
                </div>
              </transition>
            </div>
          </div>

          <!-- 播放控制区域 -->
          <div class="controlers">
            <!-- 进度条 -->
            <div
              class="progress-line"
              ref="progressBar"
              @mousedown="startDrag"
              @click="seekByClick"
            >
              <div
                class="progress-filled"
                :style="{
                  width:
                    (playlistStore.currentPlayingTime / playlistStore.currentPlayingDuration) *
                      100 +
                    '%',
                }"
              ></div>
            </div>

            <div class="timer">
              <span v-html="playlistStore.formatTime(playlistStore.currentPlayingTime)"></span>
              <span
                v-html="
                  playlistStore.formatNegativeTime(
                    playlistStore.currentPlayingTime,
                    playlistStore.currentPlayingDuration,
                  )
                "
              ></span>
            </div>

            <!-- 控制按钮 -->
            <div class="ctl-btns">
              <button class="controls-btn prev-btn" @click="() => playlistStore.playPrevious()">
                <i class="iconfont">&#xe722;</i>
              </button>
              <button class="controls-btn play-pause" @click="togglePlayPause">
                <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
                <i class="iconfont" v-else>&#xe67b;</i>
              </button>
              <button class="controls-btn next-btn" @click="() => playlistStore.playNext()">
                <i class="iconfont">&#xe72a;</i>
              </button>
            </div>
          </div>
        </div>

        <!-- 歌词显示区域 -->
        <div class="right">
          <LrcParser
            :dominantTextColor="textColors[selectedColorIndex]"
            :lyrics="lyricsText"
            :current-time="playlistStore.currentPlayingTime"
            :remove-chinese="playlistStore.removeChinese"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
.playback-page {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  .row-flex(@align:center);

  background-size: 300% 300%;
  animation: gradientMove 10s ease infinite;
  will-change: background-position, filter, color;
  color: inherit;

  .title,
  .artist,
  .more-menu-item,
  .ctl-btns button,
  .back-btn,
  .iconfont {
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

header {
  .row-flex();
  position: relative;
  height: 43px;
}

header .back-btn {
  .row-flex(@justify:center,@align:center);
  position: absolute;
  left: 0;
  top: 0;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  .iconfont {
    font-size: 26px;
    margin-right: 6px;
  }
}

header .color-wheel {
  .row-flex(@align: center, @justify: center, @gap: 15px);
  position: relative;
  margin: auto;

  .color-item {
    @size: 25px;
    width: @size;
    height: @size;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .selected {
    transform: scale(1.4);
    border: 1px solid #fff;
    pointer-events: none;
  }
}

main {
  .row-flex(@align: center,@justify: space-around);
  position: relative;
  width: 100%;
  height: 100%;

  .left,
  .right {
    flex: 1;
    .col-flex(@align: center );
  }
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

.music-cover {
  width: 380px;
  height: 380px;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
  }
}

.music-info {
  .row-flex(@align: center, @justify: space-between);
  width: 400px;
  font-weight: 500;
  margin: 20px 0;
  text-align: left;

  .title {
    font-size: 22px;
  }

  .artist {
    font-size: 16px;
    opacity: 0.8;
  }
}

.controlers {
  width: 400px;

  .ctl-btns {
    .row-flex(@justify: center, @align: center,@gap: 20px);
    margin-top: 10px;

    .iconfont {
      font-size: 34px;
    }
  }

  .mute-btn {
    margin-left: auto;
  }
}

.timer {
  width: 400px;
  font-size: 12px;
  .row-flex(@align: center, @justify: space-between);
  margin-bottom: 12px;
}

.music-info,
.controlers {
  * {
    transition: all 0.3s linear;
  }
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

.mright {
  position: relative;
  height: 28px;

  .more-menu {
    .col-flex(@align: flex-start,@justify: center);
    position: absolute;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    bottom: 15px;
    left: 35px;
    width: 128px;
    border-radius: 5px;
    z-index: 999;
    overflow: hidden;
  }

  .iconfont {
    font-size: 28px;
    margin: 0 5px;
  }

  .more-menu-item {
    .row-flex(@align: center);
    width: 100%;
    cursor: pointer;
    padding: 3px 0;
    user-select: none;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.remove-chinese-btn {
  transition: color 0.2s ease;
  &:hover {
    color: #ffffff;
  }
}

.more-btn {
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  transition: 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
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
</style>
