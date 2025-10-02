<script lang="ts" setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()
const musicItemRefs = ref<HTMLElement[]>([])
const currentModeIndex = ref(0)
const modeSwitchRefs = ref<HTMLElement[]>([])

/**
 * 清空播放列表
 */
function clearPlaylist() {
  const audioElement = document.querySelector('audio')
  if (audioElement) {
    audioElement.src = ''
    playlistStore.isPlaying = false
  }

  playlistStore.clearPlaylist()
}

/**
 * 从播放列表中移除指定歌曲
 * @param index 要移除的歌曲索引
 */
function handleRemove(index: number) {
  const audioElement = document.querySelector('audio')

  // 如果要删除的是当前正在播放的歌曲且是最后一首歌
  if (index === playlistStore.currentPlayingIndex && playlistStore.playlist.length === 1) {
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }
  }

  playlistStore.removeFromPlaylist(index)
}

// 播放模式配置
const iconList = [
  {
    icon: '&#xe727;',
    title: '单曲循环',
    mode: 'loop',
  },
  {
    icon: '&#xe734;',
    title: '随机播放',
    mode: 'random',
  },
  {
    icon: '&#xea22;',
    title: '列表播放',
    mode: 'list',
  },
]

/**
 * 切换播放模式
 */
function switchMode() {
  currentModeIndex.value = (currentModeIndex.value + 1) % iconList.length
  playlistStore.playMode = iconList[currentModeIndex.value].mode
}

/**
 * 查找当前正在播放的音乐项
 * @returns 正在播放的元素或null
 */
function findPlayingItem(): HTMLElement | null {
  const items = musicItemRefs.value
  for (const item of items) {
    if (item.classList.contains('playing')) {
      return item
    }
  }
  return null
}

/**
 * 滚动到当前正在播放的音乐项
 */
function scrollToPlayingItem() {
  nextTick(() => {
    findPlayingItem()?.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
    })
  })
}

// 监听播放列表或当前播放索引变化，自动滚动到正在播放的项
watch([() => playlistStore.playlist, () => playlistStore.currentPlayingIndex], () => {
  scrollToPlayingItem()
})

// 监听播放模式变化，同步更新界面显示
watch(
  () => playlistStore.playMode,
  (newMode) => {
    const index = iconList.findIndex((item) => item.mode === newMode)
    if (index !== -1) {
      currentModeIndex.value = index
    }
  },
  { immediate: true },
)

// 组件挂载时滚动到正在播放的项
onMounted(() => {
  scrollToPlayingItem()
})
</script>

<template>
  <div class="my-playlists">
    <div class="empty-playlist" v-if="playlistStore.isPlayingListEmpty">
      <p>播放列表为空</p>
    </div>
    <div class="has-playlist" v-else>
      <div class="controls-btn">
        <button
          class="mode-switch"
          @click="switchMode"
          :data-mode="iconList[currentModeIndex].mode"
          ref="modeSwitchRefs"
        >
          <span v-html="iconList[currentModeIndex].icon" class="iconfont"></span>
          {{ iconList[currentModeIndex].title }}
        </button>
        <button class="clear-list" @click="clearPlaylist">清空列表</button>
      </div>
      <div class="my-playlists-container">
        <div
          v-for="(music, index) in playlistStore.playlist"
          :key="index"
          class="music-item-wrapper"
        >
          <!-- 音乐项 -->
          <div
            class="music-item"
            @click="playlistStore.setCurrentPlaying(music, index)"
            :class="{ playing: index === playlistStore.currentPlayingIndex }"
            ref="musicItemRefs"
          >
            <!-- 专辑图 -->
            <div class="left">
              <div class="cover">
                <img :src="String(music.cover)" class="music-cover" />
              </div>
            </div>
            <!-- 音乐信息 -->
            <div class="info">
              <div class="title">{{ music.title }}</div>
              <div class="artist">
                {{ music.artist }} -
                {{ music.album }}
              </div>
            </div>
            <!-- 删除按钮 -->
            <div class="right">
              <button class="remove-btn iconfont" @click.stop="handleRemove(index)">
                &#xe721;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.my-playlists {
  position: fixed;
  right: 0;
  bottom: 50px;
  width: 350px;
  background-color: rgb(255, 255, 255);
  box-shadow: -4px -2px 20px 0px rgba(0, 0, 0, 0.03);

  .my-playlists-container {
    .col-flex();
    gap: 3px;
    max-height: 510px;
    overflow: auto;
    position: relative;
  }
}

.music-item {
  .row-flex();
  align-items: center;
  gap: 5px;
  cursor: pointer;
  position: relative;

  &:hover {
    .title {
      color: @lightMode-music-playingTextColor;
    }
  }
}

.left .cover {
  width: 70px;
  height: 70px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.right {
  margin-left: auto;
  margin-right: 10px;

  button {
    font-size: 28px;
  }
}

.info {
  .col-flex();
  gap: 5px;
}

.artist {
  font-size: 13px;
}

.playing {
  background-color: rgba(133, 133, 133, 0.24);

  .title {
    color: @lightMode-music-playingTextColor;
  }

  .title,
  .artist {
    font-weight: 500;
  }
}

.empty-playlist {
  .row-flex(center);
  height: 100px;

  p {
    font-size: 18px;
  }
}

.controls-btn {
  .row-flex();
  height: 50px;
  padding: 5px;
  gap: 10px;

  button {
    .row-flex(center);
    gap: 5px;
    flex: 1;
    font-size: 15px !important;
    background-color: #90e0ef;
    border-radius: 5px;
    transition: all 0.2s ease-in-out;

    .iconfont {
      font-size: 17px;
    }
  }
}
</style>
