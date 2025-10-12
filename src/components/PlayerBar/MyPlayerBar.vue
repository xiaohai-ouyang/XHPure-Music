<script lang="ts" setup>
import defaultCover from '@assets/images/defaultCover-lightMode.png'
import myPlayList from '@/components/PlayerBar/MyPlaylists.vue'
import { ref } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useMarqueeScroll } from '@/composables/useTextAutoScroll'

const playlistStore = usePlaylistStore()
const infoRef = ref<HTMLElement | null>(null)
const { togglePlayPause } = useAudioPlayer()
const { containerRef } = useMarqueeScroll(25)
</script>

<template>
  <div class="player-bar" :style="{ width: usePageStatusStore().pageWidth + 'px' }">
    <div class="left">
      <div class="cover">
        <img
          :src="(playlistStore.currentPlaying?.cover as string) || defaultCover"
          alt="专辑封面"
          class="music-cover"
        />
      </div>
      <div class="info" ref="infoRef" @click="usePageStatusStore().isPlayBackExpand = true">
        <div ref="containerRef" class="title xiaoHi-marquee-container">
          <div class="xiaoHi-marquee-content">
            {{ playlistStore.currentPlaying?.title || '暂无播放' }}
          </div>
        </div>
        <div class="artist">
          {{ playlistStore.currentPlaying?.artist || '未知艺术家' }}
        </div>
      </div>
    </div>

    <div class="right">
      <div class="controls">
        <button
          class="controls-btn"
          @click="() => playlistStore.playPrevious()"
          aria-label="上一首"
        >
          <i class="iconfont">&#xe722;</i>
        </button>
        <button class="controls-btn play-pause" @click="togglePlayPause" aria-label="播放/暂停">
          <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
          <i class="iconfont" v-else>&#xe67b;</i>
        </button>
        <button class="controls-btn" @click="() => playlistStore.playNext()" aria-label="下一首">
          <i class="iconfont">&#xe72a;</i>
        </button>
      </div>
      <button class="playlist-btn" @click="usePageStatusStore().togglePlaylist">
        <i class="iconfont">&#xe716;</i>
        <span class="playlist-count">播放列表</span>
      </button>
    </div>
    <my-play-list
      v-show="usePageStatusStore().isPlaylistShow"
      @close="usePageStatusStore().isPlaylistShow = false"
    />
  </div>
</template>

<style scoped lang="less">
.player-bar,
.right {
  .row-flex();
}

.controls-btn,
.playlist-btn {
  .row-flex(@align: center);
}

i {
  font-size: 23px;
}

.player-bar {
  height: 50px;
  background-color: white;
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
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  .col-flex();

  .title {
    font-weight: 500;
    color: @lightMode-music-playingTextColor;
    display: inline-block;
    position: relative;
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
