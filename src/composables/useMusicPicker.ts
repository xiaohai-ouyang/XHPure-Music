import { ref } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { detectLanguages, isBilingualLyrics } from '@/utils/lyricUtils'
import { usePlaylistStore } from '@/stores/playlistStores'
import { useMessageStore } from '@/stores/messageStore'
import type { MusicInfo } from '@/types/musicTypes'
import { generateShortId } from '@/utils/idGenerator'

const messageStore = useMessageStore()

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

  let worker: Worker | null = null

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

      worker = new Worker(new URL('@/workers/musicProcessor.ts', import.meta.url), {
        type: 'module',
      })

      const processedResults: MusicInfo[] = []
      let pendingCount = 0

      const processFile = (fileHandle: FileSystemFileHandle): Promise<void> => {
        return new Promise((resolve) => {
          const messageId = crypto.randomUUID()

          fileHandle.getFile().then((file) => {
            const handler = (e: MessageEvent) => {
              if (e.data.id === messageId) {
                worker?.removeEventListener('message', handler)
                pendingCount--

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
            pendingCount++
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
          playlistStore.updateTrackIdsByMusicList(processedResults)
          processedResults.length = 0
          await new Promise((resolve) => setTimeout(resolve, 0))
        }
      }

      if (processedResults.length > 0) {
        musicStore.addMusicList(processedResults)
        playlistStore.updateTrackIdsByMusicList(processedResults)
      }

      worker.terminate()
      worker = null

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
