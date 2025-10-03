<script setup lang="ts">
import { usePageStatusStore } from '@/stores/pageStatusStores'
</script>

<template>
  <div class="myPlaybackPage">
    <button @click="usePageStatusStore().isPlayBackExpand = false">关闭</button>
  </div>
</template>
