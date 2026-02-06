<template>
  <div class="function-bar">
    <button class="add-all-btn" @click="onPushAllToPlaylist">全部播放</button>
    <div class="music-num">•音乐库中有<span class="num" v-html="musicCount"></span>首歌</div>
    <div class="music-time"><span class="num" v-html="totalMinutes"></span>分钟</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  musicCount: number
  totalMinutes: string
}

interface Emits {
  (e: 'pushAllToPlaylist'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const onPushAllToPlaylist = () => {
  emit('pushAllToPlaylist')
}
</script>

<style lang="less" scoped>
.function-bar {
  gap: 10px;
  padding: 5px 8px;
  background-color: @lightMode-secondary-bgColor;
  position: sticky;
  top: 0;
  z-index: 10;

  .add-all-btn {
    background-color: @lightMode-dominant-textColor;
    color: white;
    padding: 10px;
    border-radius: 8px;
  }

  &,
  .music-num,
  .music-time {
    .row-flex(@align: center);
  }
}
</style>
