<script lang="ts" setup>
import defaultCover from '@assets/images/defaultCover-lightMode.png'
import myPlaybackQueue from '@/components/PlayerBar/MyPlaybackQueue.vue'
import { ref } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { useplaybackQueueStore } from '@/stores/playbackQueueStores'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const playbackQueueStores = useplaybackQueueStore()
const infoRef = ref<HTMLElement | null>(null)
const { togglePlayPause } = useAudioPlayer()
</script>

<template>
  <div class="player-bar" :style="{ width: usePageStatusStore().pageWidth + 'px' }">
    <div class="left">
      <div class="cover">
        <img
          :src="(playbackQueueStores.currentPlaying?.cover as string) || defaultCover"
          alt="专辑封面"
          class="music-cover"
        />
      </div>
      <div class="info" ref="infoRef" @click="usePageStatusStore().isPlayBackExpand = true">
        <div class="title">
          {{ playbackQueueStores.currentPlaying?.title || '暂无播放' }}
        </div>
        <div class="artist">
          {{ playbackQueueStores.currentPlaying?.artist || '未知艺术家' }}
        </div>
      </div>
    </div>

    <div class="right">
      <div class="controls">
        <button
          class="controls-btn"
          @click="() => playbackQueueStores.playPrevious()"
          aria-label="上一首"
        >
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="controls-btn play-pause" @click="togglePlayPause" aria-label="播放/暂停">
          <i class="iconfont" v-if="!playbackQueueStores.isPlaying">&#xe63d;</i>
          <i class="iconfont" v-else>&#xe67b;</i>
        </button>
        <button
          class="controls-btn"
          @click="() => playbackQueueStores.playNext()"
          aria-label="下一首"
        >
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>
      <button class="playlist-btn" @click="usePageStatusStore().toggleisPlayQueueShow">
        <i class="iconfont">&#xe716;</i>
        <span class="playlist-count">播放列表</span>
      </button>
    </div>
    <my-playback-queue />
  </div>
</template>

<style scoped lang="less">
.player-bar,
.right,
.controls-btn,
.playlist-btn {
  .row-flex(@align: center);
}

i {
  font-size: 23px;
}

.player-bar {
  height: 50px;
  background-color: @lightMode-secondary-bgColor;
  align-items: center;
  position: fixed;
  bottom: 0;

  .left {
    .row-flex(@align: center, @justify: center);
  }

  .right {
    align-items: center;
    margin-right: 10px;
    margin-left: auto;
  }
}

.cover {
  width: 50px;
  height: 50px;
  overflow: hidden;
}

.music-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  margin-left: 10px;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  .col-flex();

  .title {
    font-weight: 500;
    color: @lightMode-dominant-textColor;
  }

  .artist {
    font-size: 14px;
  }
}

.controls,
.controls-btn {
  .row-flex(center);
}

.controls {
  gap: 5px;
  margin-right: 10px;
}

.playlist-btn {
  height: 35px;
  background-color: @lightMode-playBar-btnBg;
  border-radius: 8px;
  padding: 0 8px;

  &:hover {
    background-color: @lightMode-playBar-btnHoverBg;
  }
}
</style>
