<template>
  <div class="playlist-card" @click="$emit('click')">
    <div class="cover-wrap">
      <img :src="playlist.cover" class="cover" />
    </div>
    <p class="name">{{ playlist.name }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Playlist } from '@/types/fileSystem'

defineProps<{
  playlist: Playlist
}>()
</script>

<style scoped lang="less">
.playlist-card {
  cursor: pointer;

  .cover-wrap {
    position: relative;

    .cover {
      width: 100%;
      border-radius: 10px;
    }

    .play-count {
      position: absolute;
      top: 6px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 12px;
    }
  }

  .name {
    margin-top: 6px;

    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
