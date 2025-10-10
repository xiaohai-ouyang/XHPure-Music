<script setup lang="ts">
import router from '@/router'
import LrcParser from '@/components/LrcParser.vue'
import { computed, ref, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useDominantColor } from '@/composables/useDominantColor'
import { useChineseToggle } from '@/composables/useChineseToggle'

const playlistStore = usePlaylistStore()
const pageStatusStore = usePageStatusStore()

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

const lyricsText = computed(() => (currentPlaying.value.lyrics as string) || '')
const { removeChinese, hasChinese, toggleChinese, translationTooltip } = useChineseToggle(
  lyricsText.value,
)

const { dominantColor, dominantTextColor, updateBackgroundFromCover } = useDominantColor()

watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    if (newCover) {
      updateBackgroundFromCover(newCover as string)
    }
  },
  { immediate: true },
)

const { togglePlayPause, startDrag, seekByClick, progressBar } = useAudioPlayer()
const moreListShow = ref(false)
const toggleMoreList = () => (moreListShow.value = !moreListShow.value)
const back = () => {
  pageStatusStore.isPlayBackExpand = false
  router.back()
}
</script>

<template>
  <div class="playback-page" :style="{ background: dominantColor, color: dominantTextColor }">
    <div
      class="background-blur"
      :style="{ backgroundImage: `url(${currentPlaying.cover || ''})` }"
      v-if="currentPlaying.cover"
    ></div>

    <div class="content">
      <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i>Back</button>

      <div class="left">
        <div class="music-cover">
          <img
            :src="(currentPlaying.cover as string) || ''"
            :alt="(currentPlaying.title as string) || ''"
          />
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
                <button class="more-menu-item"><i class="iconfont">&#xe761;</i>我喜欢</button>
                <button class="more-menu-item"><i class="iconfont">&#xe730;</i>添加到歌单</button>
                <button class="more-menu-item"><i class="iconfont">&#xe66e;</i>再放一次</button>
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
