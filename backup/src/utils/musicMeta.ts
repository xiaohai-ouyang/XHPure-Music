import { parseBlob } from 'music-metadata'

export type ID3v23Tag = {
  id: string
  value?: { text?: string; data?: Uint8Array; format?: string }
}
export type ID3v23Tags = Array<ID3v23Tag>

export function extractLyrics(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'USLT' && item.value?.text)?.value?.text || ''
}

export function extractArtists(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'TPE1' && item.value)?.value || ''
}

export function extractAlbum(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'TALB' && item.value)?.value || ''
}

export function extractTitle(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'TIT2' && item.value)?.value || ''
}

export function extractYear(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'TYER' && item.value)?.value || ''
}

export function extractPhoto(tags: ID3v23Tags = []) {
  const pic = tags.find((item) => item.id === 'APIC' && item.value?.data)?.value?.data

  if (pic) {
    const base64 = uint8ArrayToBase64(pic)
    const coverType = extractPhotoType(tags) || 'image/jpeg'
    const dataUrl = `data:${coverType};base64,${base64}`
    return dataUrl
  }

  return undefined
}

function extractPhotoType(tags: ID3v23Tags = []) {
  return tags.find((item) => item.id === 'APIC' && item.value?.format)?.value?.format || ''
}

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }

  return window.btoa(binary)
}

export async function parseMusicFile(file: File) {
  const metadata = await parseBlob(file)

  const tags: ID3v23Tags = (metadata.native?.['ID3v2.3'] as ID3v23Tags) || []
  return {
    title: extractTitle(tags),
    artist: extractArtists(tags),
    album: extractAlbum(tags),
    year: extractYear(tags),
    lyrics: extractLyrics(tags),
    cover: extractPhoto(tags),
  }
}
