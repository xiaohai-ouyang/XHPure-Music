<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useLrcParser } from '@/composables/useLrcParser'
import SmartMarquee from '@/components/Common/SmartMarquee.vue'

const playbackQueueStores = usePlaybackQueueStore()

// 当前播放的音乐信息
const currentPlaying = computed(
  () =>
    playbackQueueStores.currentPlaying || {
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
  computed(() => playbackQueueStores.removeChinese),
)

const shouldShowRemoveChinese = computed(() => showRemoveChineseButton.value)
const translationTooltip = computed(() => (playbackQueueStores.removeChinese ? '显示中文' : '隐藏中文'))

/**
 * 切换中文显示状态
 */
const onToggleChinese = () => {
  if (playbackQueueStores.currentPlayingId) {
    const newState = !playbackQueueStores.removeChinese
    playbackQueueStores.setSongChineseState(playbackQueueStores.currentPlayingId, newState)
    playbackQueueStores.removeChinese = newState
  }
}

/**
 * 切换更多菜单显示状态
 */
const emit = defineEmits<{
  toggleMoreList: []
}>()
const onToggleMoreList = () => {
  emit('toggleMoreList')
}
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
      <SmartMarquee class="title" :text="currentPlaying.title as string" :duration="40" />
      <SmartMarquee class="artist" :text="currentPlaying.artist as string" :duration="40" />
    </div>

    <!-- 音乐信息操作按钮 -->
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
  font-weight: 400;
  margin: 20px 0;
  white-space: nowrap;
  transition: all 0.25s ease;
  position: relative;

  .music-info-main {
    max-width: 280px;
    overflow: hidden;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
  }

  .artist {
    font-size: 16px;
    opacity: 0.8;
  }
}

.music-info .music-info-actions {
  .row-flex(@align: center, @gap: 10px);

  .iconfont {
    font-size: 32px;
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
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  @size: 32px;
  width: @size;
  height: @size;

  &,
  .iconfont {
    color: inherit;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
