<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { useplaybackQueueStore } from '@/stores/playbackQueueStores'
import { useScrollRestore } from '@/composables/useScrollRestore'
import { useMusicPicker } from '@/composables/useMusicPicker'
import { formatTimeDetailed } from '@/utils/formatTime'
import { usePlaylistStore } from '@/stores/playlistStores'
import MusicListItem from '@/components/MusicPage/MusicListItem.vue'
import MusicFunctionBar from '@/components/MusicPage/MusicFunctionBar.vue'
import EmptyMusicState from '@/components/MusicPage/EmptyMusicState.vue'

const listContainer = ref<HTMLElement | null>(null)
const playbackQueueStores = useplaybackQueueStore()
const musicStore = useMusicMetaStore()
const playlistStore = usePlaylistStore()
const { pickMusic } = useMusicPicker()
const currentPlayingId = computed(() => playbackQueueStores.currentPlayingId)
useScrollRestore({ containerRef: listContainer, key: 'music-list' })

function handleMusicClick(music: MusicInfo) {
  playbackQueueStores.addToplaybackQueue(music)
}

function handleAddToPlaylist(music: MusicInfo) {
  playlistStore.addInPlaylist('favorite', music)
}

interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
}

function pushAllToPlaylist() {
  musicStore.musicList.forEach((music) => {
    playbackQueueStores.addToplaybackQueue(music)
  })
}
</script>

<template>
  <div class="jiaoyan-music" ref="listContainer">
    <EmptyMusicState v-if="musicStore.isEmpty" @pick-music="pickMusic" />

    <template v-else>
      <MusicFunctionBar
        :music-count="musicStore.musicList.length"
        :total-minutes="formatTimeDetailed(musicStore.totalDuration).totalMins.toString()"
        @push-all-to-playlist="pushAllToPlaylist"
      />

      <div class="music-item-box">
        <MusicListItem
          v-for="music in musicStore.musicList"
          :key="music.id"
          :music="music"
          :current-playing-id="currentPlayingId"
          @click="handleMusicClick"
          @add-to-playlist="handleAddToPlaylist"
        />
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.music-item-box {
  .col-flex(@align: stretch,@gap: 5px);
}
</style>
