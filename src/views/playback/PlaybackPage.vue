<script setup lang="ts">
import router from '@/router'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import LrcParser from '@/components/LrcParser.vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'

const playlistStore = usePlaylistStore()
const dominantColor = ref('linear-gradient(135deg, #222, #000)')
const dominantTextColor = ref('#fff') // 动态文字颜色
const coverLoaded = ref(false)
const moreListShow = ref(false)

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

function toggleMoreList() {
  moreListShow.value = !moreListShow.value
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

// 音频事件监听
onMounted(() => {
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  const onPlay = () => (playlistStore.isPlaying = true)
  const onPause = () => (playlistStore.isPlaying = false)
  const onTimeUpdate = () => (playlistStore.currentPlayingTime = audio.currentTime)
  const onEnded = () => playlistStore.playNext()

  audio.addEventListener('play', onPlay)
  audio.addEventListener('pause', onPause)
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('ended', onEnded)

  onUnmounted(() => {
    audio.removeEventListener('play', onPlay)
    audio.removeEventListener('pause', onPause)
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('ended', onEnded)
  })
})

// 更新背景和文字颜色
function updateBackgroundFromCover(cover: string) {
  if (!cover) return
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = cover
  img.onload = () => {
    const colorThief = new ColorThief()
    try {
      const palette: number[][] = colorThief.getPalette(img, 7)

      // 微调每个色块亮度
      const adjustedPalette = palette.map((c) => {
        let color = tinycolor({ r: c[0], g: c[1], b: c[2] })
        // 如果颜色很亮，稍微调暗；如果颜色暗，稍微调亮
        color = color.isLight() ? color.darken(10) : color.lighten(15)
        return color.toRgb()
      })

      // 生成渐变字符串
      const gradient = `linear-gradient(135deg, ${adjustedPalette
        .map((c) => `rgb(${c.r},${c.g},${c.b})`)
        .join(', ')})`

      dominantColor.value = gradient
      coverLoaded.value = true

      // 主色调文字颜色也做微调
      const mainColor = adjustedPalette[0]
      let textColor = tinycolor(mainColor)
      textColor = textColor.isLight() ? textColor.darken(10) : textColor.lighten(15)
      dominantTextColor.value = textColor.toString()
    } catch (err) {
      console.warn('颜色提取失败:', err)
      dominantColor.value = 'linear-gradient(135deg, #222, #000)'
      dominantTextColor.value = '#fff'
    }
  }
}

// 初始和封面变化监听
onMounted(() => {
  if (currentPlaying.value.cover) updateBackgroundFromCover(currentPlaying.value.cover)
})
watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    if (newCover) updateBackgroundFromCover(newCover)
  },
)

// --------- 进度条相关 ---------
const progressBar = ref<HTMLElement | null>(null)
const isDragging = ref(false)

function seekByClick(event: MouseEvent) {
  const bar = progressBar.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const ratio = Math.min(Math.max(clickX / rect.width, 0), 1)

  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return
  audio.currentTime = ratio * playlistStore.currentPlayingDuration
}

function startDrag(event: MouseEvent) {
  isDragging.value = true
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  const onMove = (e: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    const ratio = x / rect.width
    audio.currentTime = ratio * playlistStore.currentPlayingDuration
  }

  const onUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<template>
  <div class="playback-page" :style="{ background: dominantColor, color: dominantTextColor }">
    <div
      class="background-blur"
      :style="{ backgroundImage: `url(${currentPlaying.cover})` }"
      v-if="currentPlaying.cover"
    ></div>

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
            <button class="iconfont more-btn" @click="toggleMoreList" title="更多">&#xe71a;</button>

            <transition name="fade-slide">
              <div class="more-menu" v-show="moreListShow">
                <button class="more-menu-item"><i class="iconfont">&#xe720;</i>我喜欢</button>
                <button class="more-menu-item"><i class="iconfont">&#xe730;</i>添加到歌单</button>
                <button class="more-menu-item"><i class="iconfont">&#xe71e;</i>再放一次</button>
              </div>
            </transition>
          </div>
        </div>
        <div class="controlers">
          <div class="progress-line" ref="progressBar" @mousedown="startDrag" @click="seekByClick">
            <div
              class="progress-filled"
              :style="{
                width:
                  (playlistStore.currentPlayingTime / playlistStore.currentPlayingDuration) * 100 +
                  '%',
              }"
            ></div>
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
          :dominantTextColor="dominantTextColor"
          :lyrics="playlistStore.currentPlaying?.lyrics ?? ''"
          :current-time="playlistStore.currentPlayingTime"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@assets/styles/PlaybackPage/playbackPageStyle.less';
</style>
