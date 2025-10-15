<template>
  <div class="playlist-layout">
    <div class="playlist-header">
      <img
        :src="playlist.cover"
        :alt="playlist.name"
        class="playlist-cover"
        @error="handleCoverError"
      />
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <div class="playlist-detail">
          <p class="playlist-track-number">
            •共<span class="num">{{ trackNum }}</span
            >首歌
          </p>
          <p class="playlist-total-time"><span class="num">4000</span>分钟</p>
        </div>

        <div class="playlist-actions">
          <button class="play-all">播放全部</button>
          <button class="add-to-queue" @click="clearPlaylistTracks">清空播放列表</button>
        </div>
      </div>
    </div>
    <div class="playlist-tracks">
      <div
        v-for="(track, index) in playlist.tracks"
        :key="index"
        class="track-item"
        :class="{ 'not-imported': !isTrackImported(track) }"
        @click="playTrack(track)"
      >
        <span class="track-title">{{ track.title }}</span>
        <span class="track-artist">{{ getArtistByTrack(track) }}</span>
        <!-- 如果track已导入，显示更多歌曲信息 -->
        <div v-if="isTrackImported(track)" class="track-details">
          <span class="track-album">{{ getMusicById(track.id)?.album || '未知专辑' }}</span>
          <span class="track-duration">{{ formatDuration(track.duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { useplaybackQueueStore } from '@/stores/playbackQueueStores'
import type { MusicInfo } from '@/stores/musicMetaStores'
import type { Track, Playlist } from '@/types/fileSystem'
import { formatTime } from '@/utils/formatTime'

const props = defineProps<{
  playlist: Playlist
  trackNum: number
}>()

const emit = defineEmits(['clear-tracks'])

const musicStore = useMusicMetaStore()
const playbackQueueStore = useplaybackQueueStore()

/**
 * 检查歌曲是否已导入（通过检查track.id是否存在且能找到对应的音乐）
 * @param track 歌曲track信息
 * @returns 是否已导入
 */
function isTrackImported(track: Track): boolean {
  if (!track.id) return false
  return !!getMusicById(track.id)
}

/**
 * 播放指定的歌曲
 * @param track 要播放的歌曲track信息
 */
function playTrack(track: Track) {
  // 如果歌曲未导入，则不执行任何操作
  if (!isTrackImported(track)) {
    return
  }

  // 根据track.id找到对应的音乐信息
  const music = getMusicById(track.id)
  if (music) {
    // 将歌曲添加到播放队列并播放
    playbackQueueStore.addToplaybackQueue(music)
  }
}

/**
 * 根据track信息获取艺术家信息
 * @param track 歌曲track信息
 * @returns 艺术家名称
 */
function getArtistByTrack(track: Track): string {
  // 如果track已导入，使用id查找
  if (isTrackImported(track)) {
    const musicById = getMusicById(track.id)
    if (musicById) {
      return (musicById.artist as string) || '未知艺术家'
    }
  }

  // 否则使用md5和duration查找
  const music = musicStore.musicList.find(
    (m: MusicInfo) => m.md5 === track.md5 && m.duration === track.duration,
  )
  return (music?.artist as string) || '未知艺术家'
}

/**
 * 根据歌曲ID获取歌曲完整信息
 * @param id 歌曲ID
 * @returns 歌曲信息对象
 */
function getMusicById(id: string): MusicInfo | undefined {
  return musicStore.musicList.find((music: MusicInfo) => music.id === id)
}

/**
 * 格式化歌曲时长
 * @param duration 歌曲时长（秒）
 * @returns 格式化后的时长字符串
 */
function formatDuration(duration: number): string {
  return formatTime(duration)
}

/**
 * 清空播放列表
 * 该方法会清空当前播放列表中的所有歌曲
 */
function clearPlaylistTracks() {
  // 触发父组件清空播放列表事件
  emit('clear-tracks', props.playlist.id)
}

function handleCoverError(event: Event) {
  const imgElement = event.target as HTMLImageElement
  // 当封面加载失败时，使用默认封面
  imgElement.src = '/src/assets/images/logo.png'
}
</script>

<style scoped lang="less">
.playlist-layout {
  padding: 10px 20px;
}

.playlist-header {
  display: flex;
  margin-bottom: 20px;
}

.playlist-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  margin-right: 20px;
  object-fit: cover;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.playlist-info {
  .col-flex(@justify: flex-end);
}

.playlist-name {
  font-size: 22px;
  font-weight: bold;
}

.playlist-detail {
  .row-flex(@align: center,@gap: 10px);
  font-size: 15px;
  color: #666;
  .num {
    color: #333;
  }
  margin-bottom: 10px;
}

.playlist-tracks {
  .track-item {
    .col-flex(@align: flex-start);
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.not-imported {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
      }
    }

    .track-title {
      font-weight: 500;
    }

    .track-artist {
      color: #666;
      font-size: 14px;
    }

    .track-details {
      .row-flex(@justify: space-between);
      width: 100%;
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.playlist-actions {
  .row-flex(@align: center,@gap: 10px);

  button {
    padding: 5px 15px;
    border-radius: 20px;
    color: rgb(255, 255, 255);
    background: @lightMode-dominant-textColor;
  }
}
</style>
