<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()
const musicItemRefs = ref<HTMLElement[]>([])

function clearPlaylist() {
  const audio = document.querySelector('audio')
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audio.load()
  }
  playlistStore.isPlaying = false
  playlistStore.clearPlaylist()
}

function handleRemove(musicId: string | undefined) {
  if (musicId) {
    playlistStore.removeFromPlaylist(musicId)
  }
}

function scrollToPlayingItem() {
  nextTick(() => {
    const index = playlistStore.playlist.findIndex(
      (music) => music.id === playlistStore.currentPlayingId,
    )
    const el = musicItemRefs.value[index]
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })
}

watch(
  () => [playlistStore.playlist, playlistStore.currentPlayingId],
  () => {
    scrollToPlayingItem()
  },
  { flush: 'post' },
)

onMounted(() => {
  scrollToPlayingItem()
})
</script>

<template>
  <div class="my-playlists">
    <div v-if="playlistStore.isPlayingListEmpty" class="empty-playlist">
      <p>播放列表为空</p>
    </div>

    <div v-else class="has-playlist">
      <div class="controls-btn">
        <button
          class="mode-switch"
          :class="playlistStore.playMode"
          @click="playlistStore.cyclePlayMode"
          :aria-label="`${playlistStore.playModeLabel}`"
        >
          <span class="iconfont" v-html="playlistStore.playModeIcon" aria-hidden="true"></span>
          {{ playlistStore.playModeLabel }}
        </button>

        <button class="clear-list" @click="clearPlaylist" aria-label="清空播放列表">
          清空列表
        </button>
      </div>

      <TransitionGroup name="fade" tag="div" class="my-playlists-container">
        <div
          v-for="(music, index) in playlistStore.playlist"
          :key="music.id"
          class="music-item"
          :class="{ playing: music.id === playlistStore.currentPlayingId }"
          @click="playlistStore.setCurrentPlaying(music)"
          :ref="
            (el) => {
              if (el) musicItemRefs[index] = el as HTMLElement
            }
          "
        >
          <div class="cover">
            <img :src="String(music.cover)" :alt="`专辑封面：${music.album}`" class="music-cover" />
          </div>

          <div class="info">
            <div class="title">{{ music.title }}</div>
            <div class="artist">{{ music.artist }} - {{ music.album }}</div>
          </div>

          <div class="remove-btn">
            <button
              class="iconfont"
              @click.stop="handleRemove(music.id)"
              :aria-label="`${music.id}`"
            >
              &#xe721;
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="less">
.my-playlists {
  position: fixed;
  right: 0;
  bottom: 50px;
  width: 350px;
  max-height: 600px;
  background-color: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 999;

  .my-playlists-container {
    .col-flex();
    max-height: 516px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .has-playlist {
    width: 100%;
  }
}

.music-item {
  .row-flex(@align:center,@gap: 5px);
  cursor: pointer;
  padding: 8px 10px;
  transition: all 0.1s ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);

    .title {
      color: @lightMode-music-playingTextColor;
    }
  }
}

.fade-enter-active,
.fade-leave-active,
.fade-move {
  transition: all 0.4s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}

.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(0px);
}

.cover {
  width: 70px;
  height: 70px;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-btn {
  margin-left: auto;
  margin-right: 8px;

  button {
    font-size: 24px;
    color: #999;
    transition: color 0.2s;

    &:hover {
      color: #f00;
    }
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 200px;

  .title {
    font-size: 15px;
    font-weight: 400;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.1s ease-in-out;
  }

  .artist {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.playing {
  background-color: rgba(133, 133, 133, 0.24);

  .title,
  .artist {
    font-weight: 500;
  }

  .title {
    color: @lightMode-music-playingTextColor;
  }
}

.empty-playlist {
  .col-flex(@align:center,@justify: center);
  height: 100px;

  p {
    font-size: 18px;
    color: #999;
  }
}

.controls-btn {
  gap: 10px;
  padding: 5px 12px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;

  button {
    gap: 6px;
    flex: 1;
    padding: 8px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .iconfont {
    font-size: 17px;
  }

  .clear-list {
    background-color: #000814;
  }

  &,
  button {
    .row-flex(center);
  }
  .loop {
    background-color: #e63946;
  }

  .random {
    background-color: #8338ec;
  }

  .list {
    background-color: #0088ff;
  }
}
</style>
