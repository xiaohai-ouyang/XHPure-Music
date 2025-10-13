<template>
  <div class="playlist-layout">
    <div class="playlist-header">
      <img :src="playlist.cover" :alt="playlist.name" class="playlist-cover" />
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <p class="playlist-desc">{{ playlist.desc }}</p>
      </div>
    </div>
    <div class="playlist-tracks">
      <div v-for="(track, index) in playlist.tracks" :key="index" class="track-item">
        <span class="track-title">{{ track.title }}</span>
        <span class="track-artist">{{ track.artist }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Track {
  title: string
  artist: string
}

interface Playlist {
  id: string
  name: string
  cover: string
  desc: string
  tracks: Track[]
}

defineProps<{
  playlist: Playlist
}>()
</script>

<style scoped lang="less">
.playlist-layout {
  padding: 20px;
}

.playlist-header {
  display: flex;
  margin-bottom: 30px;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  margin-right: 20px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.playlist-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.playlist-desc {
  color: #666;
}

.playlist-tracks {
  .track-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    .track-title {
      font-weight: 500;
    }

    .track-artist {
      color: #666;
    }
  }
}
</style>
