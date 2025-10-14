interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemDirectoryHandle>
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>
}

interface Track {
  id: string
  title: string
  duration: number
  md5: string
}

interface Playlist {
  id: string
  name: string
  cover: string
  tracks: Track[]
}

export type { FileSystemDirectoryHandle, Track, Playlist }