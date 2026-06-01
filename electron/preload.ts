import { contextBridge, ipcRenderer } from 'electron'
import type { XhElectronApi } from './types'

const api: XhElectronApi = {
  selectMusicDirectory: () => ipcRenderer.invoke('music:select-directory'),
  loadPlaylists: () => ipcRenderer.invoke('playlist:load'),
  savePlaylists: (playlists) => ipcRenderer.invoke('playlist:save', playlists),
}

contextBridge.exposeInMainWorld('xhElectron', api)
