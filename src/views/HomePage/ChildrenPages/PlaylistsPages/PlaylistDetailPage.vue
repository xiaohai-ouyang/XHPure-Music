<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PlaylistLayout from '@/components/Playlist/PlaylistLayout.vue'
import { usePlaylistStore } from '@/stores/playlistStores'

const route = useRoute()
const playlistStore = usePlaylistStore()

// 定义播放列表数据类型
interface Track {
  title: string
  artist: string
}

interface PlaylistData {
  id: number | string
  name: string
  cover: string
  desc: string
  tracks: Track[]
}

const playlist = ref<PlaylistData | null>(null)

function loadPlaylist() {
  const id = route.params.id as string

  const playlists = playlistStore.getPlaylists()
  const foundPlaylist = playlists.find((p) => p.id === id)

  if (foundPlaylist) {
    playlist.value = {
      id: foundPlaylist.id,
      name: foundPlaylist.name,
      cover: foundPlaylist.cover,
      tracks: foundPlaylist.tracks,
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

// 监听路由参数变化
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

    <PlaylistLayout :playlist="playlist" />
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
