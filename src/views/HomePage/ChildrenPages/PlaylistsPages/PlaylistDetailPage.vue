<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PlaylistLayout from '@/components/Playlist/PlaylistLayout.vue'
import { usePlaylistStore } from '@/stores/playlistStores'
import { useCoverStorage } from '@/composables/useCoverStorage'
import type { Playlist } from '@/types/fileSystem'

const route = useRoute()
const playlistStore = usePlaylistStore()
const { getCover } = useCoverStorage()

const playlist = ref<Playlist | null>(null)

async function loadPlaylist() {
  const id = route.params.id as string

  const playlists = playlistStore.getPlaylists()
  const foundPlaylist = playlists.find((p: Playlist) => p.id === id)

  if (foundPlaylist) {
    if (foundPlaylist.cover.startsWith('indexeddb://')) {
      const playlistId = foundPlaylist.cover.replace('indexeddb://', '')
      const coverBlob = await getCover(playlistId)

      if (coverBlob) {
        const coverUrl = URL.createObjectURL(coverBlob)
        playlist.value = {
          id: foundPlaylist.id,
          name: foundPlaylist.name,
          cover: coverUrl,
          tracks: foundPlaylist.tracks,
        }
      } else {
        playlist.value = {
          id: foundPlaylist.id,
          name: foundPlaylist.name,
          cover: '/src/assets/images/favorite.png',
          tracks: foundPlaylist.tracks,
        }
      }
    } else {
      // 使用普通URL封面
      playlist.value = {
        id: foundPlaylist.id,
        name: foundPlaylist.name,
        cover: foundPlaylist.cover,
        tracks: foundPlaylist.tracks,
      }
    }
  } else {
    playlist.value = null
  }

  if (playlist.value) {
    route.meta.title = playlist.value.name
  }
}

// 清空播放列表
function clearPlaylistTracks(playlistId: string) {
  playlistStore.clearPlaylistTracks(playlistId)
  loadPlaylist()
}

onMounted(() => {
  loadPlaylist()
})

watch(
  () => route.params.id,
  () => {
    loadPlaylist()
  },
)
</script>

<template>
  <div v-if="playlist" class="playlist-detail-page">
    <RouterLink to="/page/playlists" class="back-btn">
      <i class="iconfont">&#xe79c;</i>
    </RouterLink>

    <PlaylistLayout
      :playlist="playlist"
      :trackNum="playlist.tracks.length"
      @clear-tracks="clearPlaylistTracks"
    />
  </div>
  <div v-else class="no-playlist">播放列表未找到</div>
</template>

<style lang="less" scoped>
.back-btn {
  .row-flex(@align: center, @justify: center);
  width: 40px;
  height: 40px;
  overflow: hidden;
  text-decoration: none;

  i {
    font-size: 30px;
  }
}
</style>
