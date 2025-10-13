<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PlaylistLayout from '@/components/Playlist/PlaylistLayout.vue'

const route = useRoute()
// 定义播放列表数据类型
interface Track {
  title: string
  artist: string
}

interface PlaylistData {
  id: number | string
  name: string
  cover: string
  desc: string
  tracks: Track[]
}

interface PlaylistMap {
  [key: string]: PlaylistData
}

const playlist = ref<PlaylistData | null>(null)

onMounted(() => {
  const id = route.params.id as string
  // 模拟数据（实际可从 store / API 加载）
  const data: PlaylistMap = {
    favorite: {
      id: 1,
      name: '我最喜欢的',
      cover: '/covers/p1.jpg',
      desc: '青葱记忆里的经典歌曲',
      tracks: [{ title: '轨迹', artist: '周杰伦' }],
    },
    '2': {
      id: '2',
      name: '重返2009',
      cover: '/covers/p2.jpg',
      desc: '怀旧流行精选',
      tracks: [{ title: '稻香', artist: '周杰伦' }],
    },
  }
  playlist.value = data[id]

  if (playlist.value) {
    route.meta.title = playlist.value.name
  }
})
</script>

<template>
  <div v-if="playlist" class="playlist-detail-page">
    <PlaylistLayout :playlist="playlist" />
  </div>
  <div v-else class="no-playlist">播放列表未找到</div>
</template>
