interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

declare interface FileSystemDirectoryHandle {
  /**
   * 支持 for await...of 遍历目录条目
   * @example for await (const [name, handle] of dirHandle) { ... }
   */
  [Symbol.asyncIterator]: () => AsyncIterableIterator<[string, FileSystemHandle]>
}
