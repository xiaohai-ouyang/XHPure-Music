interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemDirectoryHandle>
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>
}

interface Track {
  title: string
  artist: string
}

interface Playlist {
  id: string
  name: string
  cover: string
  desc?: string
  tracks: Track[]
}
