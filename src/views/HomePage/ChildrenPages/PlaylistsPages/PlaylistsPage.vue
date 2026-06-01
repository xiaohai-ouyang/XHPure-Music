<template>
  <div class="playlist-list-page">
    <div class="playlist-grid">
      <div class="add-playlist-card" @click="isCreating = true">
        <div class="img-wrap">
          <img :src="addIcon" alt="新建播放列表" />
        </div>
        <p>创建播放列表</p>
      </div>

      <PlaylistCard
        v-for="item in playlistStore.playlist"
        :key="item.id"
        :playlist="item"
        @click="goDetail(item.id)"
      />
    </div>

    <CreatePlaylistDialog v-if="isCreating" @false="isCreating = false" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStores'
import PlaylistCard from '@/components/Playlist/PlaylistCard.vue'
import CreatePlaylistDialog from '@/components/Playlist/CreatePlaylistDialog.vue'
import addIcon from '@/assets/images/add.png'

const router = useRouter()
const playlistStore = usePlaylistStore()
const isCreating = ref(false)

function goDetail(id: string) {
  router.push(`/page/playlists/${id}`)
}
</script>

<style scoped lang="less">
.playlist-list-page {
  padding: 20px 10px;

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
      color: @lightMode-text-sub;
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

.add-playlist-card {
  .col-flex(@justify: center, @align: center);

  .img-wrap {
    background-color: @lightMode-hover-bg;
    margin-top: auto;
    padding: 40px;
    border-radius: 10px;
  }

  p {
    margin-top: 5px;
    margin-right: auto;
  }
}
</style>
