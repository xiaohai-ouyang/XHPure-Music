import { ref } from 'vue'
import { parseMusicFile } from '@/utils/getMusicMeta'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { detectLanguages, isBilingualLyrics } from '@/utils/lyricUtils'
import { calcMusicMD5 } from '@/utils/getFilesMD5'
import { usePlaylistStore } from '@/stores/playlistStores'
import { useMessageStore } from '@/stores/messageStore'
const messageStore = useMessageStore()

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }

  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>
  }
}

interface MusicInfo {
  id?: string
  url?: string
  isBilingual?: boolean
  languages?: string[]
  md5?: string

  [key: string]: unknown
}

// 处理音乐文件的歌词信息
function processLyricsInfo(musicInfo: MusicInfo): void {
  if (musicInfo.lyrics && typeof musicInfo.lyrics === 'string') {
    const lyricsWithoutTimestamps = musicInfo.lyrics
      .split('\n')
      .map((line) => line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim())
      .join('\n')

    musicInfo.isBilingual = isBilingualLyrics(lyricsWithoutTimestamps)
    const lines = lyricsWithoutTimestamps.split('\n')
    musicInfo.languages = Array.from(new Set(lines.flatMap((line) => detectLanguages(line))))
  }
}

// 处理单个音乐文件的函数
async function processMusicFile(entry: FileSystemFileHandle): Promise<MusicInfo | null> {
  const name = entry.name
  if (!/\.(flac|mp3|wav)$/i.test(name)) return null

  try {
    const file = await entry.getFile()
    const md5 = await calcMusicMD5(file)
    const musicInfo = (await parseMusicFile(file)) as MusicInfo
    musicInfo.url = URL.createObjectURL(file)
    musicInfo.md5 = md5
    processLyricsInfo(musicInfo)
    return musicInfo
  } catch (fileError) {
    messageStore.setMessage('error', `无法解析文件 ${name}`)
    console.error(`解析文件 ${name} 时出错，请检查文件格式`, fileError)
    return null
  }
}

// 处理目录中的所有文件
// 移除 processDirectory 函数，逻辑移至 pickMusic 中

export function useMusicPicker() {
  const loading = ref(false)
  const musicStore = useMusicMetaStore()
  const playlistStore = usePlaylistStore()

  async function pickMusic() {
    if (!window.showDirectoryPicker) {
      messageStore.setMessage(
        'error',
        '当前浏览器不支持此功能，请使用最新版本的Chrome、Edge等浏览器',
      )
      return
    }

    loading.value = true
    try {
      const dirHandle = await window.showDirectoryPicker()

      // 1. 收集所有文件
      const files: FileSystemFileHandle[] = []
      for await (const handle of dirHandle.values()) {
        if (handle.kind === 'file') {
          files.push(handle as FileSystemFileHandle)
        }
      }

      if (files.length === 0) {
        messageStore.setMessage('info', '未找到音乐文件')
        return
      }

      // 2. 分批处理
      const BATCH_SIZE = 5 // 并发数
      const UPDATE_CHUNK_SIZE = 20 // 每处理多少个更新一次 Store

      let processedResults: MusicInfo[] = []

      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE)
        const results = await Promise.all(batch.map(processMusicFile))

        const validResults = results.filter((r): r is MusicInfo => r !== null)
        processedResults.push(...validResults)

        // 批量更新 Store
        if (processedResults.length >= UPDATE_CHUNK_SIZE) {
          musicStore.addMusicList(processedResults)
          playlistStore.updateTrackIdsByMusicList(processedResults)
          processedResults = [] // 清空已处理缓冲区

          // 让出主线程，避免 UI 卡死
          await new Promise((resolve) => setTimeout(resolve, 0))
        }
      }

      // 处理剩余的
      if (processedResults.length > 0) {
        musicStore.addMusicList(processedResults)
        playlistStore.updateTrackIdsByMusicList(processedResults)
      }

      messageStore.setMessage('success', '音乐添加完成')
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        messageStore.setMessage('info', '用户取消了操作')
      } else {
        messageStore.setMessage('error', '无法访问文件夹，请确保已授予必要的权限')
        console.error('无法访问文件夹，请确保已授予必要的权限', err)
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
