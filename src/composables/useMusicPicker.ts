import { ref } from 'vue'
import { parseMusicFile } from '@/utils/musicMeta'
import { useMusicMetaStore } from '@/stores/musicMetaStores'

// 扩展 Window 接口以添加 showDirectoryPicker
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

  function detectLanguages(text: string): string[] {
    const langSet = new Set<string>()
    if (/[\u4e00-\u9fff]/.test(text)) langSet.add('zh')
    if (/[A-Za-z]/.test(text)) langSet.add('en')
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) langSet.add('ja')
    if (/[\uac00-\ud7af]/.test(text)) langSet.add('ko')
    return Array.from(langSet)
  }

  async function handleMusicFile(entry: FileSystemFileHandle) {
    const name = entry.name
    if (!/\.(flac|mp3|wav)$/i.test(name)) return

    try {
      const file = await entry.getFile()
      const musicInfo = (await parseMusicFile(file)) as MusicInfo
      musicInfo.url = URL.createObjectURL(file)

      // 检测歌词语言
      if (musicInfo.lyrics && typeof musicInfo.lyrics === 'string') {
        // 移除时间戳以进行语言检测
        const lyricsWithoutTimestamps = musicInfo.lyrics
          .split('\n')
          .map((line) => line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim())
          .join('\n')

        // 检测歌词语言
        const lines = lyricsWithoutTimestamps.split('\n')
        let pureChineseLineCount = 0

        lines.forEach((line) => {
          // 跳过带冒号的行（通常是标题、作者等信息）
          if (/:|：/.test(line)) return

          const langs = detectLanguages(line)
          // 纯中文行（只包含中文）
          if (langs.includes('zh') && langs.length === 1) {
            pureChineseLineCount++
          }
        })

        // 规则：如果纯中文行比包含非中文的行多超过 5 行，则视为非双语
        // 否则只要两类行都存在，就视为双语
        if (pureChineseLineCount > 5) {
          musicInfo.isBilingual = false
        } else {
          musicInfo.isBilingual = true
        }

        musicInfo.languages = Array.from(new Set(lines.flatMap((line) => detectLanguages(line))))
        console.log(musicInfo.title, pureChineseLineCount)
      }

      musicStore.addMusic(musicInfo)
    } catch (fileError) {
      showError(`解析文件 ${name} 时出错，请检查文件格式`, fileError)
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

      alert('音乐添加完成')
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
