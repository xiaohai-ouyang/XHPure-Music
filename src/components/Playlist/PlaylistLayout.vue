<template>
  <div class="playlist-layout">
    <div class="playlist-header">
      <img
        :src="playlist.cover"
        :alt="playlist.name"
        class="playlist-cover"
        @error="handleCoverError"
      />
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <div class="playlist-detail">
          <p class="playlist-track-number">
            •共<span class="num">{{ trackNum }}</span
            >首歌
          </p>
          <p class="playlist-total-time"><span class="num">4000</span>分钟</p>
        </div>

        <div class="playlist-actions">
          <button class="play-all">播放全部</button>
          <button class="add-to-queue" @click="clearPlaylistTracks">清空播放列表</button>
        </div>
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
  tracks: Track[]
}

const props = defineProps<{
  playlist: Playlist
  trackNum: number
}>()

/**
 * 清空播放列表
 * 该方法会清空当前播放列表中的所有歌曲
 */
function clearPlaylistTracks() {
  // 清空播放列表
  props.playlist.tracks = []

  // TODO: 根据实际需求，可能还需要暂停当前播放的音频
  // 例如调用 audio.pause() 或相关的音频控制方法
}

function handleCoverError(event: Event) {
  const imgElement = event.target as HTMLImageElement
  // 当封面加载失败时，使用默认封面
  imgElement.src = '/src/assets/images/logo.png'
}
</script>

<style scoped lang="less">
.playlist-layout {
  padding: 10px 20px;
}

.playlist-header {
  display: flex;
  margin-bottom: 20px;
}

.playlist-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  margin-right: 20px;
  object-fit: cover;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.playlist-info {
  .col-flex(@justify: flex-end);
}

.playlist-name {
  font-size: 22px;
  font-weight: bold;
}

.playlist-detail {
  .row-flex(@align: center,@gap: 10px);
  font-size: 15px;
  color: #666;
  .num {
    color: #333;
  }
  margin-bottom: 10px;
}

.playlist-tracks {
  .track-item {
    .row-flex(@justify: space-between);
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

.playlist-actions {
  .row-flex(@align: center,@gap: 10px);

  button {
    padding: 5px 15px;
    border-radius: 20px;
    color: rgb(255, 255, 255);
    background: @lightMode-dominant-textColor;
  }
}
</style>
