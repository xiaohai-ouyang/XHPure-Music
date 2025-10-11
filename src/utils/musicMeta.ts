import { parseBlob, type ILyricsTag, type IPicture } from 'music-metadata'

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

function getCover(picture?: IPicture[]): string | null {
  if (!Array.isArray(picture) || picture.length === 0) return null

  const imageData = picture[0].data
  if (!(imageData instanceof Uint8Array) || imageData.length === 0) return null

  // ✅ 确保 arrayBuffer 为 ArrayBuffer（非 SharedArrayBuffer）
  const arrayBuffer = new Uint8Array(imageData).buffer
  const blob = new Blob([arrayBuffer], { type: picture[0].format || 'image/jpeg' })
  return URL.createObjectURL(blob)
}

export async function parseMusicFile(file: Blob): Promise<{
  title?: string
  album?: string
  artist?: string
  year?: number
  cover: string | null
  lyrics: string
}> {
  const metadata = await parseBlob(file)
  const { title, album, artist, year, picture } = metadata.common
  const lyrics = metadata.common.lyrics

  return {
    title,
    album,
    artist,
    year,
    cover: getCover(picture),
    lyrics: extractLrcLyrics(lyrics),
  }
}
