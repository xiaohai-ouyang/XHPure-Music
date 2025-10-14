import { ref } from 'vue'
import { coverStorage } from '@/utils/coverStorage'

/**
 * 封面图片存储组合式函数
 */
export const useCoverStorage = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 保存封面图片
   * @param id 封面图片的唯一标识符
   * @param coverBlob 封面图片的Blob数据
   */
  const saveCover = async (id: string, coverBlob: Blob) => {
    isLoading.value = true
    error.value = null
    
    try {
      await coverStorage.saveCover(id, coverBlob)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save cover'
      console.error('Error saving cover:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取封面图片
   * @param id 封面图片的唯一标识符
   * @returns 封面图片的Blob数据或null
   */
  const getCover = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const cover = await coverStorage.getCover(id)
      return cover
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get cover'
      console.error('Error getting cover:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除封面图片
   * @param id 封面图片的唯一标识符
   */
  const deleteCover = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await coverStorage.deleteCover(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete cover'
      console.error('Error deleting cover:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 检查封面图片是否存在
   * @param id 封面图片的唯一标识符
   * @returns 如果存在返回true，否则返回false
   */
  const hasCover = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await coverStorage.hasCover(id)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to check cover'
      console.error('Error checking cover:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 将图片URL转换为Blob
   * @param url 图片URL
   * @returns 图片的Blob数据
   */
  const urlToBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url)
    return await response.blob()
  }

  return {
    isLoading,
    error,
    saveCover,
    getCover,
    deleteCover,
    hasCover,
    urlToBlob
  }
}