<template>
  <div class="playback-page">
    <button @click="back">back</button>
    <div class="left">
      <div class="music-cover">
        <img :src="currentPlaying.cover" :alt="currentPlaying.title" />
      </div>
      <div class="controlers"></div>
    </div>
    <div class="right"></div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { computed } from 'vue'

const playlistStore = usePlaylistStore()

const currentPlaying = computed(
  () =>
    playlistStore.currentPlaying || {
      title: '',
      artist: '',
      album: '',
      cover: '',
    },
)

function back() {
  usePageStatusStore().isPlayBackExpand = false
  router.back()
}
</script>

<style scoped>
.playback-page {
  padding: 20px;
}

.music-cover {
  width: 500px;
  height: 500px;
  overflow: hidden;
}
</style>
