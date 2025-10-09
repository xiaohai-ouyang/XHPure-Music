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

<template>
  <div class="playback-page">
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
          <button class="iconfont more-btn" title="更多" aria-label="更多">&#xe71a;</button>
        </div>
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
          <button
            class="controls-btn prev-btn"
            @click="playlistStore.playPrevious"
            aria-label="上一首"
          >
            <i class="iconfont">&#xe722;</i>
          </button>
          <button class="controls-btn play-pause" @click="togglePlayPause" aria-label="播放/暂停">
            <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
            <i class="iconfont" v-else>&#xe67b;</i>
          </button>
          <button class="controls-btn next-btn" @click="playlistStore.playNext" aria-label="下一首">
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
</template>

<style scoped lang="less">
.playback-page {
  .row-flex(center);
  padding: 20px;
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-repeat: no-repeat;
}

.left,
.right {
  flex: 1;
  .col-flex(center);
}

.back-btn {
  .row-flex();
  align-items: center;
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
  font-size: 28px;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: hidden;
  transition: width 0.3s ease-in-out;

  &:hover {
    width: 100px;
  }

  & .iconfont {
    font-size: 30px !important;
  }
}

.music-cover {
  width: 400px;
  height: 400px;
  overflow: hidden;
}

.music-info {
  width: 400px;
  font-weight: 500;
  .row-flex();
  justify-content: space-between;
  margin: 10px 0 20px 0;

  .mleft {
    .col-flex(start);
  }

  .title {
    font-size: 20px;
  }

  .artist {
    font-size: 16px;
  }
}

.more-btn {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.089);
  backdrop-filter: blur(5px);

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
  }
}

.progress-line {
  width: 100%;
  margin-bottom: 10px;

  input {
    width: 100%;
  }
}

.controlers {
  width: 400px;

  .ctl-btns {
    .row-flex(center);
  }

  .iconfont {
    font-size: 32px !important;
  }
}

.left {
  button {
    flex: 1;
  }

  .iconfont {
    font-size: 25px;
  }
}
</style>
