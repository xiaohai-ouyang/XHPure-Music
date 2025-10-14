<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PlaylistLayout from '@/components/Playlist/PlaylistLayout.vue'
import { usePlaylistStore } from '@/stores/playlistStores'
import { useCoverStorage } from '@/composables/useCoverStorage'

const route = useRoute()
const playlistStore = usePlaylistStore()
const { getCover } = useCoverStorage()

interface Track {
  title: string
  artist: string
}

interface PlaylistData {
  id: string
  name: string
  cover: string
  tracks: Track[]
}

const playlist = ref<PlaylistData | null>(null)

async function loadPlaylist() {
  const id = route.params.id as string

  const playlists = playlistStore.getPlaylists()
  const foundPlaylist = playlists.find((p) => p.id === id)

  if (foundPlaylist) {
    // 检查是否使用了IndexedDB存储的封面
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
        // 如果无法获取IndexedDB中的封面，使用默认封面
        playlist.value = {
          id: foundPlaylist.id,
          name: foundPlaylist.name,
          cover: '/src/assets/images/logo.png',
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

    <PlaylistLayout :playlist="playlist" :trackNum="playlist.tracks.length" />
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
