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
async function processDirectory(dirHandle: FileSystemDirectoryHandle): Promise<MusicInfo[]> {
  const musicInfos: MusicInfo[] = []

  for await (const handle of dirHandle.values()) {
    if (handle.kind === 'file') {
      const musicInfo = await processMusicFile(handle as FileSystemFileHandle)
      if (musicInfo) {
        musicInfos.push(musicInfo)
      }
    }
  }

  return musicInfos
}

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
      const musicInfos = await processDirectory(dirHandle)

      // 批量添加音乐和更新歌单
      musicInfos.forEach((musicInfo) => {
        musicStore.addMusic(musicInfo)
        playlistStore.updateTrackIdByMusic(musicInfo)
      })

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
