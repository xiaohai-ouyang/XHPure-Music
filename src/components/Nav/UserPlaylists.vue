<template>
  <div class="user-playlist">
    <div class="user-playlist-container">
      <div
        v-for="playlist in playlists.slice(0, 5)"
        :key="playlist.id"
        class="user-playlist-item"
        @click="goToPlaylist(playlist.id)"
      >
        <i class="iconfont">&#xe761;</i>{{ playlist.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlaylistStore } from '@/stores/playlistStores'
import { useRouter } from 'vue-router'

const playlistStore = usePlaylistStore()
const playlists = playlistStore.getPlaylists()
const router = useRouter()

function goToPlaylist(id: string) {
  router.push(`/page/playlists/${id}`)
}
</script>

<style scoped lang="less">
.user-playlist {
  position: relative;
  margin-top: auto;
  margin-bottom: 40px;
  background-color: white;
  border-radius: @nav-borderRadius;
}

.user-playlist-container {
  .col-flex(@justify: flex-start);
  width: 100%;
  padding: 2px;
}

.user-playlist-item {
  .row-flex(@justify: flex-start, @align: center);
  height: 40px;
  color: @lightMode-nav-activeColor;
  text-decoration: none;
  padding: 5px 25px 5px 30px;
  width: 100%;
  gap: 20px;
  transition: all 0.2s;
  border-radius: @nav-borderRadius;
  white-space: nowrap;

  &:hover {
    background: @lightMode-nav-hoverColor;
  }
}

i {
  font-size: 28px;
}
</style>
