import { ref } from 'vue'
import { parseMusicFile } from '@/utils/getMusicMeta'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { isBilingualLyrics, detectLanguages } from '@/utils/lyricUtils'

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }

  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>
  }
}

interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
  isBilingual?: boolean
  languages?: string[]
}

export function useMusicPicker() {
  const loading = ref(false)
  const musicStore = useMusicMetaStore()

  function showError(msg: string, err?: unknown) {
    if (err) console.error(msg, err)
    alert(msg)
  }

  async function handleMusicFile(entry: FileSystemFileHandle) {
    const name = entry.name
    if (!/\.(flac|mp3|wav)$/i.test(name)) return

    try {
      const file = await entry.getFile()
      const musicInfo = (await parseMusicFile(file)) as MusicInfo
      musicInfo.url = URL.createObjectURL(file)

      if (musicInfo.lyrics && typeof musicInfo.lyrics === 'string') {
        const lyricsWithoutTimestamps = musicInfo.lyrics
          .split('\n')
          .map((line) => line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim())
          .join('\n')

        musicInfo.isBilingual = isBilingualLyrics(lyricsWithoutTimestamps)
        const lines = lyricsWithoutTimestamps.split('\n')
        musicInfo.languages = Array.from(new Set(lines.flatMap((line) => detectLanguages(line))))
      }

      musicStore.addMusic(musicInfo)
    } catch (fileError) {
      console.log(`解析文件 ${name} 时出错，请检查文件格式`, fileError)
    }
  }

  async function pickMusic() {
    if (!window.showDirectoryPicker) {
      showError('当前浏览器不支持此功能，请使用最新版本的Chrome、Edge等浏览器')
      return
    }

    loading.value = true
    try {
      const dirHandle = await window.showDirectoryPicker()

      for await (const handle of dirHandle.values()) {
        if (handle.kind === 'file') {
          await handleMusicFile(handle as FileSystemFileHandle)
        }
      }

      console.log('音乐添加完成')
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        console.log('用户取消了操作')
      } else {
        showError('无法访问文件夹，请确保已授予必要的权限', err)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    pickMusic,
  }
}
