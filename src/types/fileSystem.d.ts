interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemDirectoryHandle>
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>
}

interface Track {
  duration: number
  md5: string
  title: string
}

interface Playlist {
  id: string
  name: string
  cover: string
  tracks: Track[]
}
