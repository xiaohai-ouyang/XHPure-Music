<template>
  <div class="playback-page">
    <button @click="back">back</button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

function back() {
  usePageStatusStore().isPlayBackExpand = false
  router.back()
}
</script>

<style scoped>
.playback-page {
  padding: 20px;
}
</style>
