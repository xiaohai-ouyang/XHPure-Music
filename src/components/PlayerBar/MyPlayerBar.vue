<script lang="ts" setup>
import defaultCover from '@assets/images/defaultCover-lightMode.png'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { ref, watch } from 'vue'
import myPlayList from '@/components/PlayerBar/MyPlaylists.vue'

const playlistStore = usePlaylistStore()
const audioElement = ref<HTMLAudioElement | null>(null)
const infoRef = ref<HTMLElement | null>(null)

function autoScroll(event: MouseEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('scrolling')

  if (target.scrollWidth > target.clientWidth) {
    setTimeout(() => {
      target.classList.add('scrolling')
    }, 100)
  }
}

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
          :src="(playlistStore.currentPlaying?.cover as string) || defaultCover"
          alt="专辑封面"
          class="music-cover"
        />
      </div>
      <div class="info" ref="infoRef">
        <div
          class="title"
          @mouseenter="autoScroll"
          @mouseleave="(e) => (e.target as HTMLElement).classList.remove('scrolling')"
        >
          {{ playlistStore.currentPlaying?.title || '暂无播放' }}
        </div>
        <div class="artist">
          {{ playlistStore.currentPlaying?.artist || '未知艺术家' }}
        </div>
      </div>
    </div>

    <button class="to-playback-btn" @click="usePageStatusStore().isPlayBackExpand = true">
      点击展开播放页
    </button>

    <div class="right">
      <div class="controls">
        <button class="controls-btn" @click="playPrevious" aria-label="上一首">
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="controls-btn play-pause" @click="togglePlay" aria-label="播放/暂停">
          <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
          <i class="iconfont" v-else>&#xe67b;</i>
        </button>
        <button class="controls-btn" @click="playNext" aria-label="下一首">
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>
      <button class="playlist-btn" @click="usePageStatusStore().togglePlaylist">
        <i class="iconfont">&#xe716;</i>
        <span class="playlist-count">播放列表</span>
      </button>
    </div>
    <Transition name="list">
      <my-play-list
        v-show="usePageStatusStore().isPlaylistShow"
        @close="usePageStatusStore().isPlaylistShow = false"
      />
    </Transition>
  </div>

  <audio ref="audioElement" />
</template>

<style scoped lang="less">
.list-enter-active,
.list-leave-active {
  max-height: 600px;
  transition: max-height 0.3s;
}

.list-enter-from,
.list-leave-to {
  max-height: 0;
}

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
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;

  .col-flex();

  .title {
    font-weight: 500;
    color: @lightMode-music-playingTextColor;
    display: inline-block;
    position: relative;
  }

  .artist {
    font-size: 14px;
  }
}

.right {
  align-items: center;
  margin-right: 10px;
  margin-left: auto;
}

.controls,
.controls-btn {
  .row-flex(center);
}

.controls {
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

.scrolling {
  display: inline-block;
  position: relative;
  animation: scrolling 15s linear infinite alternate;
  animation-delay: 0.5s;
}

@keyframes scrolling {
  to {
    transform: translateX(calc(-100% - 50px));
  }
}

.to-playback-btn {
  margin-left: auto;
  height: 80%;
  padding: 10px;
  border-radius: 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: @lightMode-playBar-btnHoverBg;
  }
}
</style>
