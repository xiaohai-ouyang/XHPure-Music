/**
 * IndexedDB 封面图片存储服务
 */

class CoverStorage {
  private dbName: string = 'JiaoYanMusic'
  private storeName: string = 'covers'
  private version: number = 1
  private db: IDBDatabase | null = null

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' })
          objectStore.createIndex('id', 'id', { unique: true })
        }
      }
    })
  }

  /**
   * 保存封面图片
   * @param id 封面图片的唯一标识符
   * @param coverBlob 封面图片的Blob数据
   */
  async saveCover(id: string, coverBlob: Blob): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('Database not initialized'))
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.put({ id, cover: coverBlob })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save cover'))
      }
    })
  }

  /**
   * 获取封面图片
   * @param id 封面图片的唯一标识符
   * @returns 封面图片的Blob数据，如果不存在则返回null
   */
  async getCover(id: string): Promise<Blob | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('Database not initialized'))
      }

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.get(id)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.cover : null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get cover'))
      }
    })
  }

  /**
   * 删除封面图片
   * @param id 封面图片的唯一标识符
   */
  async deleteCover(id: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('Database not initialized'))
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete cover'))
      }
    })
  }

  /**
   * 检查封面图片是否存在
   * @param id 封面图片的唯一标识符
   * @returns 如果存在返回true，否则返回false
   */
  async hasCover(id: string): Promise<boolean> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('Database not initialized'))
      }

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.count(id)

      request.onsuccess = () => {
        resolve(request.result > 0)
      }

      request.onerror = () => {
        reject(new Error('Failed to check cover'))
      }
    })
  }
}

// 导出单例实例
export const coverStorage = new CoverStorage()
