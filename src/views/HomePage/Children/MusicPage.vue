<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useScrollRestore } from '@/composables/useScrollRestore'
import { useMusicPicker } from '@/composables/useMusicPicker'

const listContainer = ref<HTMLElement | null>(null)
useScrollRestore({ containerRef: listContainer, key: 'music-list' })

const playlistStore = usePlaylistStore()
const musicStore = useMusicMetaStore()
const { loading, pickMusic } = useMusicPicker()

const currentPlayingId = computed(() => playlistStore.currentPlayingId)

function handleMusicClick(music: MusicInfo) {
  playlistStore.addToPlaylist(music)
}

interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
}
</script>

<template>
  <div class="jiaoyan-music" ref="listContainer">
    <div class="empty" v-if="musicStore.isEmpty">
      <button @click="pickMusic" :disabled="loading" class="add-to-list-btn">
        <span>添加音乐</span>
      </button>
    </div>

    <div class="music-item-box">
      <div
        class="music-item"
        :class="{ isPlaying: currentPlayingId === music.id }"
        v-for="music in musicStore.musicList"
        :key="music.id"
        @click="handleMusicClick(music)"
      >
        <div class="left">
          <img :src="(music.cover as string) || ''" class="music-cover" />
        </div>
        <div class="right">
          <div class="music-title">{{ music.title }}</div>
          <div class="music-artist">
            {{ music.artist }} - <span class="music-album">{{ music.album }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.jiaoyan-music {
  height: 100%;
  overflow-y: auto;
}

.empty {
  .col-flex(@align:center, @justify: center);
  height: 100%;
  width: 100%;

  .add-to-list-btn {
    padding: 10px;
    background-color: #0088ff;
    color: white;
    font-weight: 700;
    font-size: 25px;
    border-radius: 10px;
  }
}

.music-cover {
  width: 130px;
  height: 130px;
}

.music-item-box {
  .col-flex(@justify:flex-start,@gap:5px);
}

.music-item {
  .row-flex(@align: center, @gap: 10px);
  cursor: pointer;
  position: relative;

  .left {
    height: 130px;
  }

  .right {
    .col-flex();
  }

  .right,
  .music-item {
    gap: 10px;
  }

  .music-title {
    font-size: 24px;
  }
}

.isPlaying {
  background-color: @lightMode-music-playingBgColor;

  .music-title {
    color: @lightMode-music-playingTextColor;
    font-weight: 600;
  }
  .music-artist {
    font-weight: 500;
  }
}
</style>
