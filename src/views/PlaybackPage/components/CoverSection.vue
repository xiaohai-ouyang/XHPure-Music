<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useLrcParser } from '@/composables/useLrcParser'

const playlistStore = usePlaylistStore()

// 当前播放的音乐信息
const currentPlaying = computed(
  () =>
    playlistStore.currentPlaying || {
      title: '',
      artist: '',
      album: '',
      cover: '',
      lyrics: '',
    },
)

// 歌词文本
const lyricsText = computed(() => (currentPlaying.value.lyrics as string) || '')

// 判断是否为双语歌词与是否显示去中文按钮
const { showRemoveChineseButton } = useLrcParser(
  lyricsText,
  ref(undefined),
  ref(null),
  computed(() => playlistStore.removeChinese),
)

const shouldShowRemoveChinese = computed(() => showRemoveChineseButton.value)

const translationTooltip = computed(() =>
  playlistStore.currentSongRemoveChinese ? '显示中文' : '隐藏中文',
)

/**
 * 切换中文显示状态
 */
const onToggleChinese = () => {
  if (playlistStore.currentPlayingId) {
    const newState = !playlistStore.removeChinese
    playlistStore.setSongChineseState(playlistStore.currentPlayingId, newState)
    playlistStore.removeChinese = newState
  }
}

/**
 * 切换更多菜单显示状态
 */
const onToggleMoreList = () => {
  emit('toggleMoreList')
}

// 定义组件事件
const emit = defineEmits<{
  toggleMoreList: []
}>()
</script>

<template>
  <!-- 音乐封面 -->
  <div class="music-cover">
    <img
      :src="(currentPlaying.cover as string) || ''"
      :alt="(currentPlaying.title as string) || ''"
    />
  </div>

  <!-- 音乐信息 -->
  <div class="music-info">
    <div class="music-info-main">
      <div class="title">{{ currentPlaying.title }}</div>
      <div class="artist">{{ currentPlaying.artist }}</div>
    </div>

    <div class="music-info-actions">
      <button
        class="remove-chinese-btn"
        v-if="shouldShowRemoveChinese"
        @click="onToggleChinese"
        :title="translationTooltip"
      >
        <i class="iconfont">&#xe644;</i>
      </button>

      <!-- 更多操作按钮 -->
      <button class="more-btn" @click="onToggleMoreList" title="更多">
        <i class="iconfont">&#xe71a;</i>
      </button>

      <slot name="more-menu"></slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.music-cover {
  width: 380px;
  height: 380px;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
  }
}

.music-info {
  .row-flex(@align: center, @justify: space-between);
  width: 400px;
  font-weight: 500;
  margin: 20px 0;
  text-align: left;

  .title {
    font-size: 22px;
  }

  .artist {
    font-size: 16px;
    opacity: 0.8;
  }

  .music-info-main {
    max-width: 320px;
  }

  .music-info-actions {
    .row-flex(@align: center,@gap: 10px);

    .iconfont {
      font-size: 32px;
    }
  }
}

.remove-chinese-btn {
  transition: color 0.2s ease;
  &,
  .iconfont {
    color: inherit;
  }

  &:hover {
    color: #ffffff;
  }
}

.more-btn {
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  transition: 0.3s;
  @size: 32px;
  width: @size;
  height: @size;

  &,
  .iconfont {
    color: inherit;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>
