<template>
  <div class="music-item" :class="{ isPlaying: isCurrentPlaying }" @click="handleClick">
    <div class="left">
      <img :src="(music.cover as string) || ''" class="music-cover" />
    </div>
    <div class="right">
      <SmartMarquee class="music-title">{{ music.title }}</SmartMarquee>
      <SmartMarquee class="music-artist">
        {{ music.artist }} - <span class="music-album">{{ music.album }}</span>
      </SmartMarquee>
    </div>
    <div class="add">
      <button @click="handleAddToPlaylist">添加到播放列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SmartMarquee from '@/components/Common/SmartMarquee.vue'
import type { MusicInfo } from '@/stores/musicMetaStores'

interface Props {
  music: MusicInfo
  currentPlayingId: string | null
}

interface Emits {
  (e: 'click', music: MusicInfo): void
  (e: 'addToPlaylist', music: MusicInfo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isCurrentPlaying = computed(() => props.currentPlayingId === props.music.id)

const handleClick = () => {
  emit('click', props.music)
}

const handleAddToPlaylist = (event: Event) => {
  event.stopPropagation()
  emit('addToPlaylist', props.music)
}
</script>

<style lang="less" scoped>
.music-item {
  .row-flex(@align: center, @gap: 10px);
  cursor: pointer;
  position: relative;
  font-weight: 500;
  padding: 8px 10px;
  transition: all 0.2s ease-in-out;

  .left {
    height: 130px;
  }

  .right {
    .col-flex(@align: center);
    max-width: 450px;
    white-space: nowrap;
  }

  .right,
  .music-item {
    gap: 10px;
  }

  .music-title {
    font-size: 24px;
  }
}

.music-cover {
  width: 130px;
  height: 130px;
  object-fit: cover;
  border-radius: 10px;
}

.isPlaying {
  background-color: @lightMode-music-playingBgColor;

  .music-title {
    color: @lightMode-dominant-textColor;
    font-weight: 600;
  }
  .music-artist {
    font-weight: 500;
  }
}

.add {
  margin-left: auto;

  button {
    padding: 10px;
    background: #ff4b4b;
    border-radius: 10px;
    color: white;
  }
}
</style>
