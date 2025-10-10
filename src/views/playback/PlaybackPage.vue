<script setup lang="ts">
import router from '@/router'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import LrcParser from '@/components/LrcParser.vue'
import ColorThief from 'colorthief'

const playlistStore = usePlaylistStore()
const dominantColor = ref('linear-gradient(135deg, #222, #000)')
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

watch(dominantColor, () => {
  coverLoaded.value = false
  setTimeout(() => (coverLoaded.value = true), 1500)
})

function updateBackgroundFromCover(cover: string) {
  if (!cover) return
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = cover
  img.onload = () => {
    const colorThief = new ColorThief()
    try {
      const palette: number[][] = colorThief.getPalette(img, 7)
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

<style scoped src="@assets/styles/PlaybackPage/playbackPageStyle.less" lang="less"></style>
