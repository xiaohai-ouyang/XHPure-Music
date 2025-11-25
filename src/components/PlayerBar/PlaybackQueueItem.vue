<template>
  <div
    ref="itemRef"
    class="music-item"
    :class="{ playing: music.id === currentPlayingId }"
    @click.stop="setCurrentPlaying(music)"
  >
    <div class="cover">
      <img :src="String(music.cover)" :alt="`专辑封面：${music.album}`" class="music-cover" />
    </div>

    <div class="info">
      <div class="title">{{ music.title }}</div>
      <div class="artist">{{ music.artist }} - {{ music.album }}</div>
    </div>

    <div class="remove-btn">
      <button
        v-if="music.id"
        class="iconfont"
        @click.stop="handleRemove(music.id)"
        :aria-label="`${music.id}`"
      >
        &#xe721;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MusicInfo } from '@/stores/musicMetaStores'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'

interface Props {
  music: MusicInfo
  currentPlayingId: string | null
}

defineProps<Props>()

const itemRef = ref<HTMLElement | null>(null)
const playbackQueueStore = usePlaybackQueueStore()

const setCurrentPlaying = (music: MusicInfo) => {
  playbackQueueStore.setCurrentPlaying(music)
}

const handleRemove = (musicId: string) => {
  playbackQueueStore.removeFromplaybackQueue(musicId)
}

defineExpose({
  $el: itemRef,
})
</script>

<style scoped lang="less">
.music-item {
  .row-flex(@align:center,@gap: 5px);
  cursor: pointer;
  padding: 8px 5px 8px 5px;
  transition: all 0.1s ease-in-out;
  border-radius: 8px;
  width: 100%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);

    .title {
      color: @lightMode-dominant-textColor;
    }
  }
}

.cover {
  width: 70px;
  height: 70px;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-btn {
  margin-left: auto;
  margin-right: 8px;

  button {
    font-size: 24px;
    color: #999;
    transition: color 0.2s;

    &:hover {
      color: #f00;
    }
  }
}

.info {
  .col-flex(@gap:4px);
  min-width: 0;
  max-width: 165px;

  .title {
    font-size: 15px;
    font-weight: 400;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.1s ease-in-out;
  }

  .artist {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.playing {
  background-color: rgba(133, 133, 133, 0.24);

  .title,
  .artist {
    font-weight: 500;
  }

  .title {
    color: @lightMode-dominant-textColor;
  }
}
</style>
