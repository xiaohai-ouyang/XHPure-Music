<template>
  <div class="playback-page">
    <button @click="back" class="back-btn">back</button>
    <div class="left">
      <div class="music-cover">
        <img :src="currentPlaying.cover" :alt="currentPlaying.title" />
      </div>
      <div class="controlers">
        <div class="progress-line">
          <input
            type="range"
            :max="playlistStore.currentPlayingDuration"
            :value="playlistStore.currentPlayingTime"
          />
        </div>
        <div class="ctl-btns">
          <button class="controls-btn" @click="playlistStore.playPrevious" aria-label="上一首">
            <i class="iconfont">&#xe722;</i>
          </button>
          <button class="controls-btn play-pause" @click="togglePlayPause" aria-label="播放/暂停">
            <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
            <i class="iconfont" v-else>&#xe67b;</i>
          </button>
          <button class="controls-btn" @click="playlistStore.playNext" aria-label="下一首">
            <i class="iconfont">&#xe72a;</i>
          </button>
        </div>
      </div>
    </div>
    <div class="right">
      <LrcParser
        :lyrics="playlistStore.currentPlaying?.lyrics || ''"
        :current-time="playlistStore.currentPlayingTime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { computed } from 'vue'
import LrcParser from '@/components/LrcParser.vue'

const playlistStore = usePlaylistStore()

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
  const audioElement = document.querySelector('audio')
  if (!audioElement) return

  if (playlistStore.isPlaying) {
    audioElement.pause()
  } else {
    audioElement.play().catch((error) => {
      console.error('播放失败:', error)
    })
  }
}
</script>

<style scoped lang="less">
.playback-page {
  .row-flex(center);
  padding: 20px;
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-repeat: no-repeat;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
}

.music-cover {
  width: 400px;
  height: 400px;
  overflow: hidden;
}

.left,
.right {
  flex: 1;
  .col-flex(center);
}
</style>
