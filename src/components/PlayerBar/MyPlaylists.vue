<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()
const musicItemRefs = ref<HTMLElement[]>([])

/**
 * 清空播放列表
 */
function clearPlaylist() {
  const audio = document.querySelector('audio')
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audio.load()
  }
  playlistStore.isPlaying = false
  playlistStore.clearPlaylist()
}

/**
 * 从播放列表中移除指定歌曲
 * @param musicId 要移除的歌曲ID
 */
function handleRemove(musicId: string | undefined) {
  if (musicId) {
    playlistStore.removeFromPlaylist(musicId)
  }
}

/**
 * 滚动到当前正在播放的音乐项
 */
function scrollToPlayingItem() {
  nextTick(() => {
    const index = playlistStore.playlist.findIndex(
      (music) => music.id === playlistStore.currentPlayingId,
    )
    const el = musicItemRefs.value[index]
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  })
}

// 监听播放列表或当前播放索引变化，自动滚动
watch(
  () => [playlistStore.playlist, playlistStore.currentPlayingId],
  () => {
    scrollToPlayingItem()
  },
  { flush: 'post' }, // 确保 DOM 更新后执行
)

// 组件挂载时滚动到当前播放项
onMounted(() => {
  scrollToPlayingItem()
})
</script>

<template>
  <div class="my-playlists">
    <!-- 播放列表为空 -->
    <div v-if="playlistStore.isPlayingListEmpty" class="empty-playlist">
      <p>播放列表为空</p>
    </div>

    <!-- 播放列表非空 -->
    <div v-else class="has-playlist">
      <!-- 控制按钮 -->
      <div class="controls-btn">
        <button
          class="mode-switch"
          @click="playlistStore.cyclePlayMode"
          :aria-label="`切换播放模式：${playlistStore.playModeLabel}`"
        >
          <span class="iconfont" v-html="playlistStore.playModeIcon" aria-hidden="true"></span>
          {{ playlistStore.playModeLabel }}
        </button>

        <button class="clear-list" @click="clearPlaylist" aria-label="清空播放列表">
          清空列表
        </button>
      </div>

      <!-- 带动画的播放列表 -->
      <TransitionGroup name="fade" tag="div" class="my-playlists-container">
        <div
          v-for="(music, index) in playlistStore.playlist"
          :key="music.id"
          class="music-item"
          :class="{ playing: music.id === playlistStore.currentPlayingId }"
          @click="playlistStore.setCurrentPlaying(music)"
          :ref="
            (el) => {
              if (el) musicItemRefs[index] = el as HTMLElement
            }
          "
        >
          <!-- 专辑图 -->
          <div class="left">
            <div class="cover">
              <img
                :src="String(music.cover)"
                :alt="`专辑封面：${music.album}`"
                class="music-cover"
              />
            </div>
          </div>

          <!-- 音乐信息 -->
          <div class="info">
            <div class="title">{{ music.title }}</div>
            <div class="artist">{{ music.artist }} - {{ music.album }}</div>
          </div>

          <!-- 删除按钮 -->
          <div class="right">
            <button
              class="remove-btn iconfont"
              @click.stop="handleRemove(music.id)"
              :aria-label="`删除歌曲：${music.title}`"
            >
              &#xe721;
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="less">
.my-playlists {
  position: fixed;
  right: 0;
  bottom: 50px;
  width: 350px;
  max-height: 600px;
  background-color: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px 0 0 12px;
  overflow: hidden;
  z-index: 999;

  .my-playlists-container {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 510px;
    overflow-y: auto;
    padding: 10px 0;
  }
}

.music-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);

    .title {
      color: @lightMode-music-playingTextColor;
    }
  }
}

/* 动画效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
  height: 0;
  margin: 0;
  padding: 0;
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}

/* 专辑图 */
.left .cover {
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

/* 删除按钮 */
.right {
  margin-left: auto;
  margin-right: 8px;

  button {
    font-size: 24px;
    color: #999;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #f00;
    }
  }
}

/* 音乐信息 */
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* 防止文本溢出 */

  .title {
    font-size: 15px;
    font-weight: 400;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artist {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 当前播放样式 */
.playing {
  background-color: rgba(133, 133, 133, 0.24);

  .title,
  .artist {
    font-weight: 500;
  }

  .title {
    color: @lightMode-music-playingTextColor;
  }
}

/* 空状态 */
.empty-playlist {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;

  p {
    font-size: 18px;
    color: #999;
  }
}

/* 控制按钮 */
.controls-btn {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    padding: 8px;
    font-size: 15px;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    background-color: #90e0ef;
    color: #000;
    cursor: pointer;
    transition: all 0.2s ease;

    .iconfont {
      font-size: 17px;
    }

    &:hover {
      background-color: #00b4d8;
      color: white;
    }
  }
}
</style>
