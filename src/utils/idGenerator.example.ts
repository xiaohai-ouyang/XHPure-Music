/**
 * ID生成器使用示例
 *
 * 这个文件展示了如何在项目中使用ID生成功能
 */

import { generateUUID, generateShortId, generateTimestampId } from './idGenerator'

// 1. 生成标准UUID
const uuid = generateUUID()
console.log('生成的UUID:', uuid)

// 2. 生成短ID (默认8位)
const shortId = generateShortId()
console.log('生成的短ID:', shortId)

// 3. 生成指定长度的短ID
const customShortId = generateShortId(12)
console.log('生成的12位短ID:', customShortId)

// 4. 生成时间戳ID
const timestampId = generateTimestampId()
console.log('生成的时间戳ID:', timestampId)

// 5. 生成不带随机后缀的时间戳ID
const simpleTimestampId = generateTimestampId(false)
console.log('生成的简单时间戳ID:', simpleTimestampId)

// 使用示例：为音乐文件生成ID
interface MusicInfo {
  id: string
  title: string
  artist: string
  url: string
}

function createMusicInfo(title: string, artist: string, url: string): MusicInfo {
  return {
    id: generateUUID(), // 为每首音乐生成唯一ID
    title,
    artist,
    url,
  }
}

const song1 = createMusicInfo('夜曲', '周杰伦', '/music/yequ.mp3')
const song2 = createMusicInfo('青花瓷', '周杰伦', '/music/qinghuaci.mp3')

console.log('歌曲1:', song1)
console.log('歌曲2:', song2)

// 使用示例：为播放列表生成ID
interface Playlist {
  id: string
  name: string
  songs: string[] // 存储歌曲ID的数组
}

function createPlaylist(name: string, songIds: string[] = []): Playlist {
  return {
    id: generateShortId(10), // 播放列表使用较短的ID
    name,
    songs: songIds,
  }
}

const playlist = createPlaylist('我的最爱', [song1.id, song2.id])
console.log('播放列表:', playlist)

export { generateUUID, generateShortId, generateTimestampId }
