/**
 * 生成全局唯一标识符(UUID)的函数
 * 返回一个符合RFC4122标准的UUID v4字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成简短ID的函数
 * 生成一个较短的唯一标识符，适用于不需要完整UUID的场景
 */
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成时间戳ID的函数
 * 基于当前时间戳生成唯一标识符，可选添加随机后缀
 */
export function generateTimestampId(withRandomSuffix: boolean = true): string {
  const timestamp = Date.now().toString(36)
  if (!withRandomSuffix) {
    return timestamp
  }
  
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomSuffix}`
}