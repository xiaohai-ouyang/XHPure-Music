<script setup lang="ts">
import router from '@/router'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import LrcParser from '@/components/LrcParser.vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'
import defaultCover from '@assets/images/defaultCover-lightMode.png'

const playlistStore = usePlaylistStore()
const dominantColor = ref('linear-gradient(135deg, #222, #000)')
const dominantTextColor = ref('#fff')
const coverLoaded = ref(false)
const moreListShow = ref(false)
const removeChinese = ref(false)

// 监听当前歌词是否包含中文，用于翻译按钮显示
const lyricsText = computed(
  () => (playlistStore.currentPlaying?.lyrics as string | undefined) ?? '',
)
const hasChinese = computed(() => /[\u4e00-\u9fff]/.test(lyricsText.value))

const translationTooltip = computed(() => (removeChinese.value ? '显示中文' : '隐藏中文'))

interface MusicInfoTyped {
  id?: string
  url?: string
  title?: string
  artist?: string
  album?: string
  cover?: string
  lyrics?: string
  [key: string]: unknown
}

const currentPlaying = computed<MusicInfoTyped>(
  () =>
    playlistStore.currentPlaying || {
      title: '',
      artist: '',
      album: '',
      cover: '',
      lyrics: '',
    },
)

// 切换中文显示
function toggleChinese() {
  removeChinese.value = !removeChinese.value
}

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

// 监听 audio
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

// 根据封面提取背景色
function updateBackgroundFromCover(cover: string) {
  if (!cover) return
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = cover
  img.onload = () => {
    const colorThief = new ColorThief()
    try {
      const palette: number[][] = colorThief.getPalette(img, 7)
      const adjustedPalette = palette.map((c) => {
        let color = tinycolor({ r: c[0], g: c[1], b: c[2] })
        color = color.isLight() ? color.darken(10) : color.lighten(15)
        return color.toRgb()
      })

      dominantColor.value = `linear-gradient(135deg, ${adjustedPalette.map((c) => `rgb(${c.r},${c.g},${c.b})`).join(', ')})`
      coverLoaded.value = true

      const mainColor = adjustedPalette[0]
      let textColor = tinycolor(mainColor)
      textColor = textColor.isLight() ? textColor.darken(10) : textColor.lighten(15)
      dominantTextColor.value = textColor.toString()
    } catch {
      dominantColor.value = 'linear-gradient(135deg, #222, #000)'
      dominantTextColor.value = '#fff'
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

// 进度条拖拽
const progressBar = ref<HTMLElement | null>(null)
const isDragging = ref(false)

function seekByClick(event: MouseEvent) {
  const bar = progressBar.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)

  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return
  audio.currentTime = ratio * playlistStore.currentPlayingDuration
}

function startDrag() {
  isDragging.value = true
  const audio = document.querySelector('audio') as HTMLAudioElement | null
  if (!audio) return

  const onMove = (e: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width
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
      :style="{ backgroundImage: `url(${currentPlaying.cover || defaultCover})` }"
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
            <button
              class="iconfont translation-btn"
              v-if="hasChinese"
              @click="toggleChinese"
              :title="translationTooltip"
            >
              &#xe644;
            </button>

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
          :lyrics="lyricsText"
          :current-time="playlistStore.currentPlayingTime"
          :remove-chinese="removeChinese"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@assets/styles/PlaybackPage/playbackPageStyle.less';
</style>
