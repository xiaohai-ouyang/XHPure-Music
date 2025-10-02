<script lang="ts" setup>
import defaultCover from '@assets/images/defaultCover-lightMode.png'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { ref, watch } from 'vue'
import myPlayList from '@/components/PlayerBar/MyPlaylists.vue'

const playlistStore = usePlaylistStore()
const audioElement = ref<HTMLAudioElement | null>(null)
const isPlaylistShow = ref(false)

function replaySingle() {
  audioElement.value?.pause()
  audioElement.value?.load()
  audioElement.value?.play()
}

function playPrevious() {
  if (playlistStore.playlist.length === 1) {
    replaySingle()
  }
  playlistStore.playPrevious()
}

function playNext() {
  if (playlistStore.playlist.length === 1) {
    replaySingle()
  }
  playlistStore.playNext()
}

watch(
  () => playlistStore.currentPlaying,
  (music) => {
    if (!audioElement.value) return
    if (music?.url) {
      audioElement.value.src = music.url
      audioElement.value.play()
      playlistStore.isPlaying = true
    } else {
      audioElement.value.src = ''
      audioElement.value?.pause()
      playlistStore.isPlaying = false
    }
  },
  { deep: true },
)

watch(
  () => audioElement.value,
  (newAudioElement) => {
    if (newAudioElement) {
      newAudioElement.addEventListener('pause', () => {
        playlistStore.isPlaying = false
      })

      newAudioElement.addEventListener('play', () => {
        playlistStore.isPlaying = true
      })

      newAudioElement.addEventListener('ended', () => {
        if (playlistStore.playMode === 'loop') {
          if (playlistStore.currentPlaying?.url) {
            newAudioElement.src = playlistStore.currentPlaying.url
            newAudioElement.play()
          }
        } else {
          playlistStore.playNext()
        }
      })

      if (playlistStore.currentPlaying?.url) {
        newAudioElement.src = playlistStore.currentPlaying.url
        newAudioElement.play()
        playlistStore.isPlaying = true
      }
    }
  },
  { once: true },
)

/**
 * 切换播放/暂停状态
 */
function togglePlay() {
  if (!audioElement.value) return

  if (playlistStore.isPlaying) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}
</script>

<template>
  <div class="player-bar" :style="{ width: usePageStatusStore().pageWidth + 'px' }">
    <div class="left">
      <div class="cover">
        <img
          :src="(usePlaylistStore().currentPlaying?.cover as string) || defaultCover"
          class="music-cover"
        />
      </div>
      <div class="info" v-if="usePlaylistStore().currentPlaying">
        <div class="title">{{ usePlaylistStore().currentPlaying?.title }}</div>
        <div class="artist">
          {{ usePlaylistStore().currentPlaying?.artist }} -
          {{ usePlaylistStore().currentPlaying?.album }}
        </div>
      </div>
    </div>
    <div class="right">
      <div class="controls-btn">
        <button class="prev-btn" @click="playPrevious">
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="play-btn" @click="togglePlay">
          <i class="iconfont" v-if="playlistStore.isPlaying">&#xe67b;</i>
          <i class="iconfont" v-else>&#xe63d;</i>
        </button>
        <button class="next-btn" @click="playNext">
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>

      <button class="playlist-btn" @click="isPlaylistShow = !isPlaylistShow">
        <i class="iconfont">&#xe716;</i>
        <span class="playlist-count">播放列表</span>
      </button>
    </div>
    <my-play-list v-if="isPlaylistShow" @close="isPlaylistShow = false" />
  </div>

  <audio ref="audioElement" />
</template>

<style scoped lang="less">
.player-bar,
.right {
  .row-flex();
}

.controls-btn,
.playlist-btn {
  .row-flex(center);
}

i {
  font-size: 23px;
}

.player-bar {
  height: 50px;
  background-color: white;
  align-items: center;
  position: fixed;
  bottom: 0;
}

.cover {
  width: 50px;
  height: 50px;
  overflow: hidden;
}

.music-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.info {
  margin-left: 10px;
  .col-flex();

  .title {
    font-weight: 500;
    color: @lightMode-music-playingTextColor;
  }

  .artist {
    font-size: 14px;
  }
}

.right {
  margin-left: auto;
  align-items: center;
  margin-right: 10px;
}

.controls-btn {
  .row-flex(center);
  gap: 5px;
  margin-right: 10px;
}

.playlist-btn {
  height: 35px;
  background-color: @lightMode-playBar-btnBg;
  border-radius: 8px;
  padding: 0 8px;

  &:hover {
    background-color: @lightMode-playBar-btnHoverBg;
  }
}
</style>
