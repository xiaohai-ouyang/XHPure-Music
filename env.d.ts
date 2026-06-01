/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

import type { XhElectronApi } from './electron/types'

declare global {
  interface Window {
    xhElectron?: XhElectronApi
  }
}

export {}
