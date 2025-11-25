import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('messageStore', () => {
  const lastMessage = ref<{
    type: 'info' | 'success' | 'warning' | 'error'
    content: string
  } | null>(null)

  /**
   * 设置最后一条消息
   * @param type 消息类型
   * @param content 消息内容
   */
  function setMessage(type: 'info' | 'success' | 'warning' | 'error', content: string) {
    lastMessage.value = { type, content }
  }

  /**
   * 显示成功消息
   * @param content 消息内容
   */
  function showSuccess(content: string) {
    setMessage('success', content)
  }

  /**
   * 显示错误消息
   * @param content 消息内容
   */
  function showError(content: string) {
    setMessage('error', content)
  }

  /**
   * 显示警告消息
   * @param content 消息内容
   */
  function showWarning(content: string) {
    setMessage('warning', content)
  }

  /**
   * 显示信息消息
   * @param content 消息内容
   */
  function showInfo(content: string) {
    setMessage('info', content)
  }

  /**
   * 清除消息
   */
  function clearMessage() {
    lastMessage.value = null
  }

  return {
    lastMessage,
    setMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearMessage,
  }
})