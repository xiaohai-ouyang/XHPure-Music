<script setup lang="ts">
import router from '@/router'
import LrcParser from '@/components/Playback/LrcParser.vue'
import { computed, ref, watch } from 'vue'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useDominantColor } from '@/composables/useDominantColor'
import { useChineseToggle } from '@/composables/useChineseToggle'

const playlistStore = usePlaylistStore()
const pageStatusStore = usePageStatusStore()

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

const lyricsText = computed(() => (currentPlaying.value.lyrics as string) || '')
const { removeChinese, hasChinese, toggleChinese, translationTooltip } = useChineseToggle(
  lyricsText.value,
)

const { dominantColor, dominantTextColor, updateBackgroundFromCover } = useDominantColor()

watch(
  () => currentPlaying.value.cover,
  (newCover) => {
    if (newCover) {
      updateBackgroundFromCover(newCover as string)
    }
  },
  { immediate: true },
)

const { togglePlayPause, startDrag, seekByClick, progressBar } = useAudioPlayer()
const moreListShow = ref(false)
const toggleMoreList = () => (moreListShow.value = !moreListShow.value)
const back = () => {
  pageStatusStore.isPlayBackExpand = false
  router.back()
}
</script>

<template>
  <div class="playback-page" :style="{ background: dominantColor, color: dominantTextColor }">
    <div
      class="background-blur"
      :style="{ backgroundImage: `url(${currentPlaying.cover || ''})` }"
      v-if="currentPlaying.cover"
    ></div>

    <div class="content">
      <header>
        <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i>Back</button>
        <div class="color-wheel">
          <div class="color-item selecter" :style="{ background: dominantTextColor }"></div>
          <div class="color-item" :style="{ background: dominantColor }"></div>
          <div class="color-item" :style="{ background: dominantColor }"></div>
          <div class="color-item" :style="{ background: dominantColor }"></div>
          <div class="color-item" :style="{ background: dominantColor }"></div>
        </div>
      </header>
      <main>
        <div class="left">
          <div class="music-cover">
            <img
              :src="(currentPlaying.cover as string) || ''"
              :alt="(currentPlaying.title as string) || ''"
            />
          </div>

          <div class="music-info">
            <div class="mleft">
              <div class="title">{{ currentPlaying.title }}</div>
              <div class="artist">{{ currentPlaying.artist }}</div>
            </div>

            <div class="mright">
              <button
                class="iconfont translation-btn"
                v-if="hasChinese"
                @click="toggleChinese"
                :title="translationTooltip"
              >
                &#xe644;
              </button>

              <button class="iconfont more-btn" @click="toggleMoreList" title="更多">
                &#xe71a;
              </button>

              <transition name="fade-slide">
                <div class="more-menu" v-show="moreListShow">
                  <button class="more-menu-item"><i class="iconfont">&#xe761;</i>我喜欢</button>
                  <button class="more-menu-item"><i class="iconfont">&#xe730;</i>添加到歌单</button>
                  <button class="more-menu-item"><i class="iconfont">&#xe66e;</i>再放一次</button>
                </div>
              </transition>
            </div>
          </div>

          <div class="controlers">
            <div
              class="progress-line"
              ref="progressBar"
              @mousedown="startDrag"
              @click="seekByClick"
            >
              <div
                class="progress-filled"
                :style="{
                  width:
                    (playlistStore.currentPlayingTime / playlistStore.currentPlayingDuration) *
                      100 +
                    '%',
                }"
              ></div>
            </div>

            <div class="ctl-btns">
              <button class="controls-btn prev-btn" @click="playlistStore.playPrevious">
                <i class="iconfont">&#xe722;</i>
              </button>
              <button class="controls-btn play-pause" @click="togglePlayPause">
                <i class="iconfont" v-if="!playlistStore.isPlaying">&#xe63d;</i>
                <i class="iconfont" v-else>&#xe67b;</i>
              </button>
              <button class="controls-btn next-btn" @click="playlistStore.playNext">
                <i class="iconfont">&#xe72a;</i>
              </button>
            </div>
          </div>
        </div>

        <div class="right">
          <LrcParser
            :dominantTextColor="dominantTextColor"
            :lyrics="lyricsText"
            :current-time="playlistStore.currentPlayingTime"
            :remove-chinese="removeChinese"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
.playback-page {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  .row-flex(@align:center);
  transition: background 1.2s ease;
  background-size: 300% 300%;
  animation: gradientMove 10s ease infinite;
  color: inherit;

  .title,
  .artist,
  .more-menu-item,
  .ctl-btns button,
  .back-btn,
  .iconfont {
    color: inherit;
  }
}

.progress-line .progress-filled {
  background: currentColor;
}

.background-blur {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(100px) brightness(0.6);
  transform: scale(1.2);
  z-index: 0;
  opacity: 0.8;
  transition: opacity 1s ease;
}

.content {
  .col-flex();
  z-index: 2;
  padding: 10px;
  width: 100%;
  height: 100%;
}

header {
  .row-flex();
  position: relative;
  height: 43px;
}

header .back-btn {
  .row-flex(@justify:center,@align:center);
  position: absolute;
  left: 0;
  top: 0;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    width: 100px;
  }

  .iconfont {
    font-size: 26px;
    margin-right: 6px;
  }
}

header .color-wheel {
  .row-flex(@align: center, @justify: center, @gap: 15px);
  position: relative;
  margin: auto;

  .color-item {
    @size: 25px;
    width: @size;
    height: @size;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .selecter {
    @size: 35px;
    width: @size;
    height: @size;
    border: 2px solid;
    pointer-events: none;
  }
}

main {
  .row-flex(@align: center,@justify: space-around);
  position: relative;
  width: 100%;
  height: 100%;

  .left,
  .right {
    flex: 1;
    .col-flex(@align: center );
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
    filter: brightness(1);
  }
  25% {
    background-position: 50% 100%;
    filter: brightness(1.1);
  }
  50% {
    background-position: 100% 50%;
    filter: brightness(1.2);
  }
  75% {
    background-position: 50% 0%;
    filter: brightness(1.1);
  }
  100% {
    background-position: 0% 50%;
    filter: brightness(1);
  }
}

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
  width: 400px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  text-align: left;

  .title {
    font-size: 22px;
  }

  .artist {
    font-size: 16px;
    opacity: 0.8;
  }
}

.controlers {
  width: 400px;

  .ctl-btns {
    .row-flex(@justify: center, @align: center,@gap: 20px);

    margin-top: 10px;

    .iconfont {
      font-size: 34px;
    }
  }

  .mute-btn {
    margin-left: auto;
  }
}

.progress-line {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin-bottom: 12px;

  .progress-filled {
    height: 100%;
    background: currentColor;
    border-radius: 3px;
    width: 0%;
    transition: width 0.1s linear;
  }
}

.mright {
  position: relative;
  height: 28px;

  .more-menu {
    .col-flex(@align: flex-start,@justify: center);
    position: absolute;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    bottom: 15px;
    left: 72px;
    width: 128px;
    border-radius: 5px;
    z-index: 999;
    overflow: hidden;
  }

  .iconfont {
    font-size: 28px;
    margin: 0 5px;
  }

  .more-menu-item {
    .row-flex(@align: center);
    width: 100%;
    cursor: pointer;
    padding: 3px 0;
    user-select: none;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.translation-btn {
  transition: color 0.2s ease;
  &:hover {
    color: #ffffff;
  }
}

.more-btn {
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  transition: 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: bottom left;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-10px, 10px) scale(0.95);
}
</style>
