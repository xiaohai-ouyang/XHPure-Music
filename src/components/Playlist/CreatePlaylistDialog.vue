<template>
  <div class="my-dialog">
    <div class="my-dialog-contant">
      <header class="dialog-header">
        <p>新建播放列表</p>
        <button @click="$emit('false')">
          <i class="iconfont">&#xe603;</i>
        </button>
      </header>
      <div class="dialog-body">
        <div class="inp-field">
          <p>播放列表名称:</p>
          <input
            type="text"
            placeholder="播放列表名称"
            v-model="playlistName"
            @focus="inputing = true"
            @blur="inputing = false"
          />
          <span :class="{ inputing: inputing }"></span>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="create-btn" @click="createPlaylist">创建</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { generateShortId } from '@/utils/idGenerator'
import { usePlaylistStore } from '@/stores/playlistStores'
const emit = defineEmits(['false'])

const playlistStore = usePlaylistStore()
const playlistName = ref('')
const inputing = ref(false)

function createPlaylist() {
  playlistStore.createPlaylist({
    id: generateShortId(),
    name: playlistName?.value,
    cover: '/src/assets/images/logo.png',
    tracks: [],
  })

  if (playlistStore.msg === '添加歌单成功') {
    emit('false')
  } else {
    alert(playlistStore.msg)
  }
}
</script>

<style lang="less" scoped>
@page-boder-radius: 10px;
.my-dialog {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .row-flex(@align: center, @justify: center);
}

.my-dialog-contant {
  .col-flex(@gap: 20px);
  background-color: aliceblue;
  padding: 20px;
  border-radius: @page-boder-radius;
}

.my-dialog-contant header {
  font-size: 20px;
  font-weight: bold;

  .row-flex(@align: center);

  button {
    margin-left: auto;
  }
}

.my-dialog-contant .inp-field {
  .row-flex(@align: center);
  font-size: 18px;
  position: relative;

  input {
    height: 40px;
    width: 300px;
    outline: unset;
    border: unset;
    padding: 0 5px;
    background: transparent;
    transition: all 0.2s linear;
  }

  span {
    position: absolute;
    left: 122px;
    bottom: 0;
    width: 0;
    height: 2px;
    background: @lightMode-dominant-textColor;
    transition: all 0.2s linear;
  }

  .inputing {
    width: 300px;
  }

  p {
    margin-right: 10px;
  }
}

.create-btn {
  background-color: @lightMode-dominant-textColor;
  color: rgb(255, 255, 255);
  padding: 10px 20px;
  border-radius: @page-boder-radius;
}
</style>
