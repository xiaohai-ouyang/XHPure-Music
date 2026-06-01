export interface ElectronMusicInfo {
  title?: string
  album?: string
  artist?: string
  year?: number
  cover: string | null
  lyrics: string
  duration?: number
  md5?: string
  url: string
  [key: string]: unknown
}

export interface MusicImportError {
  fileName: string
  reason: string
}

export interface SelectMusicDirectoryResult {
  canceled: boolean
  tracks: ElectronMusicInfo[]
  errors: MusicImportError[]
}

export interface Track {
  id: string
  title: string
  duration: number
  md5: string
}

export interface Playlist {
  id: string
  name: string
  cover: string
  tracks: Track[]
}

export interface XhElectronApi {
  selectMusicDirectory: () => Promise<SelectMusicDirectoryResult>
  loadPlaylists: () => Promise<Playlist[]>
  savePlaylists: (playlists: Playlist[]) => Promise<void>
}
