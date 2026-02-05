import { parseBlob, type ILyricsTag, type IPicture } from 'music-metadata'
import * as SparkMD5 from 'spark-md5'

const READ_SIZE = 4 * 1024 * 1024

interface MusicInfo {
  title?: string
  album?: string
  artist?: string
  year?: number
  coverData?: ArrayBuffer | null
  coverFormat?: string
  lyrics: string
  duration?: number
  md5?: string
  [key: string]: unknown
}

interface WorkerMessage {
  file: File
  id: string
}

interface WorkerResponse {
  id: string
  data: MusicInfo | null
  error?: string
}

function extractLrcLyrics(lyrics?: ILyricsTag[]): string {
  if (!Array.isArray(lyrics) || lyrics.length === 0) return ''
  const first = lyrics[0]

  if (Array.isArray(first.syncText)) {
    return (
      first.syncText
        .map(({ timestamp, text }) => {
          const time = typeof timestamp === 'number' ? timestamp : 0
          const totalSeconds = time / 1000
          const minutes = Math.floor(totalSeconds / 60)
          const seconds = Math.floor(totalSeconds % 60)
          const centiseconds = Math.floor((time % 1000) / 10)
          const timeStr = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
            2,
            '0',
          )}.${String(centiseconds).padStart(2, '0')}]`
          return `${timeStr}${text ?? ''}`
        })
        .join('\n') + '\n'
    )
  }

  return first.text || ''
}

function getCoverData(picture?: IPicture[]): {
  data: ArrayBuffer | null
  format: string | undefined
} {
  if (!Array.isArray(picture) || picture.length === 0) return { data: null, format: undefined }

  const imageData = picture[0].data
  if (!(imageData instanceof Uint8Array) || imageData.length === 0)
    return { data: null, format: undefined }

  return {
    data: new Uint8Array(imageData).buffer,
    format: picture[0].format || 'image/jpeg',
  }
}

async function calcMD5(file: File): Promise<string> {
  const sizeToRead = Math.min(file.size, READ_SIZE)
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        spark.append(new Uint8Array(result))
        resolve(spark.end())
      }
    }

    fileReader.onerror = () => reject(new Error('文件读取错误'))

    fileReader.readAsArrayBuffer(file.slice(0, sizeToRead))
  })
}

async function processFile(file: File, id: string): Promise<WorkerResponse> {
  try {
    const [md5, metadata] = await Promise.all([calcMD5(file), parseBlob(file)])

    const { title, album, year, picture, artists, lyrics: rawLyrics } = metadata.common
    const duration = metadata.format.duration
    const artist = artists?.join('/')

    const { data: coverData, format: coverFormat } = getCoverData(picture)

    const musicInfo: MusicInfo = {
      title,
      album,
      artist,
      year,
      coverData,
      coverFormat,
      lyrics: extractLrcLyrics(rawLyrics),
      duration,
      md5,
    }

    return { id, data: musicInfo }
  } catch (error) {
    return { id, data: null, error: String(error) }
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { file, id } = e.data
  const result = await processFile(file, id)
  self.postMessage(result)
}
