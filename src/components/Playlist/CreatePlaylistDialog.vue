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

        <div v-if="coverPreview" class="cover-preview">
          <img :src="coverPreview" alt="Cover preview" />
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
import { useCoverStorage } from '@/composables/useCoverStorage'

const emit = defineEmits(['false'])

const playlistStore = usePlaylistStore()
const { saveCover } = useCoverStorage()

const playlistName = ref('')
const inputing = ref(false)
const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(null)

async function createPlaylist() {
  // 检查输入
  if (!playlistName.value.trim()) {
    alert('请输入播放列表名称')
    return
  }

  // 生成播放列表ID
  const playlistId = generateShortId()

  // 处理封面
  let coverUrl = '/src/assets/images/logo.png'
  if (coverFile.value) {
    // 保存到IndexedDB
    try {
      await saveCover(playlistId, coverFile.value)
      // 使用特殊标识符表示该播放列表有自定义封面
      coverUrl = `indexeddb://${playlistId}`
    } catch (error) {
      console.error('Failed to save cover:', error)
    }
  }

  playlistStore.createPlaylist({
    id: playlistId,
    name: playlistName.value,
    cover: coverUrl,
    tracks: [],
  })

  if (playlistStore.msg === '添加歌单成功') {
    // 清空表单
    playlistName.value = ''
    coverFile.value = null
    coverPreview.value = null
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
  max-width: 500px;
  width: 90%;
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

  input[type='text'] {
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
    min-width: 120px;
  }
}

.cover-preview {
  img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
  }
}

.create-btn {
  background-color: @lightMode-dominant-textColor;
  color: rgb(255, 255, 255);
  padding: 10px 20px;
  border-radius: @page-boder-radius;
  align-self: flex-end;
  margin-top: 10px;
}
</style>