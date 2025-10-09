<script setup lang="ts">
import router from '@/router'
import { computed, ref, onMounted, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import LrcParser from '@/components/LrcParser.vue'
import ColorThief from 'colorthief'

const playlistStore = usePlaylistStore()
const dominantColor = ref('linear-gradient(135deg, #222, #000)')
const coverLoaded = ref(false)

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

function back() {
  usePageStatusStore().isPlayBackExpand = false
  router.back()
}

function togglePlayPause() {
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  if (playlistStore.isPlaying) {
    audio.pause()
  } else {
    audio.play().catch((error) => {
      console.error('播放失败:', error)
    })
  }
}

// 同步音频事件
onMounted(() => {
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  audio.addEventListener('play', () => (playlistStore.isPlaying = true))
  audio.addEventListener('pause', () => (playlistStore.isPlaying = false))
  audio.addEventListener('timeupdate', () => {
    playlistStore.currentPlayingTime = audio.currentTime
  })
  audio.addEventListener('ended', playlistStore.playNext)
})

// 根据封面提取多色渐变背景
function updateBackgroundFromCover(cover: string) {
  if (!cover) return
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = cover
  img.onload = () => {
    const colorThief = new ColorThief()
    try {
      const palette = colorThief.getPalette(img, 5)
      const gradient = `linear-gradient(135deg, ${palette
        .map((c) => `rgb(${c.join(',')})`)
        .join(', ')})`
      dominantColor.value = gradient
      coverLoaded.value = true
    } catch (err) {
      console.warn('颜色提取失败:', err)
      dominantColor.value = 'linear-gradient(135deg, #222, #000)'
    }
  }
}

onMounted(() => {
  if (currentPlaying.value.cover) updateBackgroundFromCover(currentPlaying.value.cover)
})

watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    if (newCover) updateBackgroundFromCover(newCover)
  },
)

function onSeek(event: Event) {
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return
  const value = (event.target as HTMLInputElement).value
  audio.currentTime = Number(value)
}
</script>

<template>
  <div class="playback-page" :style="{ background: dominantColor }">
    <!-- 背景模糊封面层 -->
    <div
      class="background-blur"
      :style="{ backgroundImage: `url(${currentPlaying.cover})` }"
      v-if="currentPlaying.cover"
    ></div>

    <!-- 内容 -->
    <div class="content">
      <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i>Back</button>

      <div class="left">
        <div class="music-cover">
          <img :src="currentPlaying.cover" :alt="currentPlaying.title" />
        </div>
        <div class="music-info">
          <div class="mleft">
            <div class="title">{{ currentPlaying.title }}</div>
            <div class="artist">{{ currentPlaying.artist }}</div>
          </div>
          <div class="mright">
            <button class="iconfont more-btn" title="更多">&#xe71a;</button>
          </div>
        </div>

        <div class="controlers">
          <div class="progress-line">
            <input
              type="range"
              :max="playlistStore.currentPlayingDuration"
              :value="playlistStore.currentPlayingTime"
              @input="onSeek"
            />
          </div>
          <div class="ctl-btns">
            <button class="controls-btn prev-btn" @click="playlistStore.playPrevious">
              <i class="iconfont">&#xe722;</i>
            </button>
            <button class="controls-btn play-pause" @click="togglePlayPause">
              <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
              <i class="iconfont" v-else>&#xe67b;</i>
            </button>
            <button class="controls-btn next-btn" @click="playlistStore.playNext">
              <i class="iconfont">&#xe72a;</i>
            </button>
          </div>
        </div>
      </div>

      <div class="right">
        <LrcParser
          :lyrics="playlistStore.currentPlaying?.lyrics ?? ''"
          :current-time="playlistStore.currentPlayingTime"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.playback-page {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 1.2s ease;
  background-size: 300% 300%;
  animation: gradientMove 10s ease infinite;
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
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  padding: 20px;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
  color: #fff;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    width: 100px;
  }

  .iconfont {
    font-size: 26px;
    margin-right: 6px;
  }
}

.left,
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.music-cover {
  width: 380px;
  height: 380px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
  }
}

.music-info {
  width: 400px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
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

.more-btn {
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  transition: 0.2s;

  &.iconfont {
    font-size: 28px !important;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.controlers {
  width: 400px;

  .ctl-btns {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;

    .iconfont {
      font-size: 34px;
      color: white;
    }
  }

  input[type='range'] {
    width: 100%;
    cursor: pointer;
  }
}

.iconfont {
  color: white;
}
</style>
