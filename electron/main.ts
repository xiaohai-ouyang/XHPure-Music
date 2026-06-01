import { app, BrowserWindow, dialog, ipcMain, net, protocol } from 'electron'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, extname, join } from 'node:path'
import { parseFile, type ILyricsTag, type IPicture } from 'music-metadata'
import type { ElectronMusicInfo, MusicImportError, Playlist, SelectMusicDirectoryResult } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const READ_SIZE = 4 * 1024 * 1024
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.flac', '.wav'])
const PLAYLIST_DB_VERSION = 1
const PLAYLIST_DB_NAME = 'playlists.db.json'
const mediaTokens = new Map<string, string>()

interface PlaylistDatabase {
  version: number
  playlists: Playlist[]
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'xhpure-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
])

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'XHPure Music',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

function getPlaylistDataDir(): string {
  return join(app.getPath('home'), '.xhpure-music')
}

function getPlaylistDbPath(): string {
  return join(getPlaylistDataDir(), PLAYLIST_DB_NAME)
}

async function ensurePlaylistDataDir(): Promise<void> {
  await mkdir(getPlaylistDataDir(), { recursive: true })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTrack(value: unknown): value is Playlist['tracks'][number] {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.duration === 'number' &&
    typeof value.md5 === 'string'
  )
}

function isPlaylist(value: unknown): value is Playlist {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.cover === 'string' &&
    Array.isArray(value.tracks) &&
    value.tracks.every(isTrack)
  )
}

function parsePlaylistDatabase(content: string): Playlist[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to parse playlist database: ${String(error)}`)
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.version !== 'number' ||
    !Array.isArray(parsed.playlists) ||
    !parsed.playlists.every(isPlaylist)
  ) {
    throw new Error('Invalid playlist database format')
  }

  return parsed.playlists
}

async function readPlaylists(): Promise<Playlist[]> {
  await ensurePlaylistDataDir()

  try {
    const content = await readFile(getPlaylistDbPath(), 'utf-8')
    return parsePlaylistDatabase(content)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }

    throw error
  }
}

async function writePlaylists(playlists: Playlist[]): Promise<void> {
  if (!Array.isArray(playlists) || !playlists.every(isPlaylist)) {
    throw new Error('Invalid playlists payload')
  }

  await ensurePlaylistDataDir()

  const dbPath = getPlaylistDbPath()
  const tmpPath = `${dbPath}.tmp`
  const payload: PlaylistDatabase = {
    version: PLAYLIST_DB_VERSION,
    playlists,
  }

  await writeFile(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
  await rename(tmpPath, dbPath)
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

function getCoverDataUrl(picture?: IPicture[]): string | null {
  if (!Array.isArray(picture) || picture.length === 0) return null

  const imageData = picture[0].data
  if (!(imageData instanceof Uint8Array) || imageData.length === 0) return null

  const format = picture[0].format || 'image/jpeg'
  const base64 = Buffer.from(imageData).toString('base64')
  return `data:${format};base64,${base64}`
}

async function calcMD5(filePath: string): Promise<string> {
  const fileStat = await stat(filePath)
  const sizeToRead = Math.min(fileStat.size, READ_SIZE)
  const hash = createHash('md5')

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { start: 0, end: Math.max(sizeToRead - 1, 0) })
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', resolve)
  })

  return hash.digest('hex')
}

async function collectMusicFiles(dirPath: string, errors: MusicImportError[]): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name)

    if (entry.isDirectory()) {
      try {
        files.push(...(await collectMusicFiles(entryPath, errors)))
      } catch (error) {
        errors.push({ fileName: entryPath, reason: String(error) })
      }
      continue
    }

    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(entryPath)
    }
  }

  return files
}

async function parseMusic(filePath: string): Promise<ElectronMusicInfo> {
  const [md5, metadata] = await Promise.all([calcMD5(filePath), parseFile(filePath)])
  const { title, album, year, picture, artists, lyrics: rawLyrics } = metadata.common
  const token = randomUUID()

  mediaTokens.set(token, filePath)

  return {
    title,
    album,
    artist: artists?.join('/'),
    year,
    cover: getCoverDataUrl(picture),
    lyrics: extractLrcLyrics(rawLyrics),
    duration: metadata.format.duration,
    md5,
    url: `xhpure-media://track/${token}`,
  }
}

async function selectMusicDirectory(): Promise<SelectMusicDirectoryResult> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, tracks: [], errors: [] }
  }

  const errors: MusicImportError[] = []
  const musicFiles = await collectMusicFiles(result.filePaths[0], errors)
  const tracks: ElectronMusicInfo[] = []

  for (const filePath of musicFiles) {
    try {
      tracks.push(await parseMusic(filePath))
    } catch (error) {
      errors.push({ fileName: filePath, reason: String(error) })
    }
  }

  return { canceled: false, tracks, errors }
}

app.whenReady().then(() => {
  protocol.handle('xhpure-media', (request) => {
    const url = new URL(request.url)
    const token = url.hostname === 'track' ? url.pathname.slice(1) : ''
    const filePath = mediaTokens.get(token)

    if (!filePath) {
      return new Response('Media not found', { status: 404 })
    }

    return net.fetch(pathToFileURL(filePath).toString())
  })

  ipcMain.handle('music:select-directory', selectMusicDirectory)
  ipcMain.handle('playlist:load', readPlaylists)
  ipcMain.handle('playlist:save', (_event, playlists: Playlist[]) => writePlaylists(playlists))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
