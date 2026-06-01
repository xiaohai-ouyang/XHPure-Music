import { ref } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { detectLanguages, isBilingualLyrics } from '@/utils/lyricUtils'
import { usePlaylistStore } from '@/stores/playlistStores'
import { useMessageStore } from '@/stores/messageStore'
import type { MusicInfo } from '@/types/musicTypes'

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }

  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>
  }
}

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

function filterMusicFiles(files: FileSystemFileHandle[]): FileSystemFileHandle[] {
  return files.filter((file) => /\.(flac|mp3|wav)$/i.test(file.name))
}

export function useMusicPicker() {
  const loading = ref(false)
  const musicStore = useMusicMetaStore()
  const playlistStore = usePlaylistStore()
  const messageStore = useMessageStore()

  let worker: Worker | null = null

  async function pickMusicInElectron() {
    if (!window.xhElectron) return

    const result = await window.xhElectron.selectMusicDirectory()

    if (result.canceled) {
      messageStore.setMessage('info', '用户取消了操作')
      return
    }

    if (result.tracks.length === 0) {
      messageStore.setMessage('info', '未找到音乐文件')
      return
    }

    const musicList = result.tracks.map((track) => {
      const musicInfo = { ...track } as MusicInfo
      processLyricsInfo(musicInfo)
      return musicInfo
    })

    musicStore.addMusicList(musicList)
    await playlistStore.updateTrackIdsByMusicList(musicList)

    if (result.errors.length > 0) {
      messageStore.setMessage(
        'info',
        `音乐添加完成，${result.errors.length} 个文件无法解析`,
      )
    } else {
      messageStore.setMessage('success', '音乐添加完成')
    }
  }

  async function pickMusicInBrowser() {
    if (!window.showDirectoryPicker) {
      messageStore.setMessage(
        'error',
        '当前浏览器不支持此功能，请使用最新版本的 Chrome、Edge 等浏览器',
      )
      return
    }

    const dirHandle = await window.showDirectoryPicker()

    const files: FileSystemFileHandle[] = []
    for await (const handle of dirHandle.values()) {
      if (handle.kind === 'file') {
        files.push(handle as FileSystemFileHandle)
      }
    }

    const musicFiles = filterMusicFiles(files)

    if (musicFiles.length === 0) {
      messageStore.setMessage('info', '未找到音乐文件')
      return
    }

    worker = new Worker(new URL('../workers/musicProcessor.ts', import.meta.url), {
      type: 'module',
    })

    const processedResults: MusicInfo[] = []

    const processFile = (fileHandle: FileSystemFileHandle): Promise<void> => {
      return new Promise((resolve) => {
        const messageId = crypto.randomUUID()

        fileHandle.getFile().then((file) => {
          const handler = (e: MessageEvent) => {
            if (e.data.id === messageId) {
              worker?.removeEventListener('message', handler)

              if (e.data.data) {
                const { coverData, coverFormat, ...rest } = e.data.data
                if (coverData) {
                  const blob = new Blob([coverData], { type: coverFormat || 'image/jpeg' })
                  ;(rest as MusicInfo).cover = URL.createObjectURL(blob)
                }
                ;(rest as MusicInfo).url = URL.createObjectURL(file)
                processLyricsInfo(rest as MusicInfo)
                processedResults.push(rest as MusicInfo)
              } else if (e.data.error) {
                messageStore.setMessage('error', `无法解析文件 ${fileHandle.name}`)
              }

              resolve()
            }
          }

          worker?.addEventListener('message', handler)
          worker?.postMessage({ file, id: messageId })
        })
      })
    }

    const BATCH_SIZE = 3
    const UPDATE_CHUNK_SIZE = 10

    for (let i = 0; i < musicFiles.length; i += BATCH_SIZE) {
      const batch = musicFiles.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(processFile))

      if (processedResults.length >= UPDATE_CHUNK_SIZE) {
        musicStore.addMusicList(processedResults)
        await playlistStore.updateTrackIdsByMusicList(processedResults)
        processedResults.length = 0
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    if (processedResults.length > 0) {
      musicStore.addMusicList(processedResults)
      await playlistStore.updateTrackIdsByMusicList(processedResults)
    }

    messageStore.setMessage('success', '音乐添加完成')
  }

  async function pickMusic() {
    loading.value = true

    try {
      if (window.xhElectron) {
        await pickMusicInElectron()
      } else {
        await pickMusicInBrowser()
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        messageStore.setMessage('info', '用户取消了操作')
      } else {
        messageStore.setMessage('error', '无法访问文件夹，请确认已授予必要权限')
        console.error('无法访问文件夹，请确认已授予必要权限', err)
      }
    } finally {
      worker?.terminate()
      worker = null
      loading.value = false
    }
  }

  return {
    loading,
    pickMusic,
  }
}
