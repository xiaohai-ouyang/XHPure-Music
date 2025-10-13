<template>
  <div class="playlist-list-page">
    <div class="playlist-grid">
      <PlaylistCard
        v-for="item in playlists"
        :key="item.id"
        :playlist="item"
        @click="goDetail(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PlaylistCard from '@/components/Playlist/PlaylistCard.vue'

const router = useRouter()

const playlists = ref([
  {
    id: 'favorite',
    name: '我最喜欢的',
    cover: '/src/assets/images/logo.png',
  },
])

function goDetail(id: string) {
  router.push(`/page/playlists/${id}`)
}
</script>

<style scoped lang="less">
.playlist-list-page {
  padding: 20px;

  .page-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .filter-bar {
    margin-bottom: 16px;

    span {
      margin-right: 10px;
      cursor: pointer;
      color: #666;
      &.active {
        color: #d33;
        font-weight: bold;
      }
    }
  }

  .playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}
</style>
