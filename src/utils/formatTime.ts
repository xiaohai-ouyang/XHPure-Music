/**
 * 格式化秒数为时间字符串
 * @param seconds 时间（秒）
 * @returns 格式化后的时间字符串 mm:ss 或 hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00'
  }

  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * 格式化时间为负数形式（用于显示剩余时间）
 * @param currentTime 当前播放时间（秒）
 * @param duration 总时长（秒）
 * @returns 格式化后的负时间字符串 -mm:ss 或 -hh:mm:ss
 */
export function formatNegativeTime(currentTime: number, duration: number): string {
  if (isNaN(currentTime) || currentTime < 0 || isNaN(duration) || duration <= 0) return '-00:00'

  const remainingTime = Math.floor(duration - currentTime)
  const hours = Math.floor(remainingTime / 3600)
  const minutes = Math.floor((remainingTime % 3600) / 60)
  const secs = remainingTime % 60

  if (hours > 0) {
    return `-${hours.toString()}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `-${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * 格式化秒数为详细时间对象
 * @param seconds 时间（秒）
 * @returns 包含小时、分钟、秒钟和总分钟数的对象
 */
export function formatTimeDetailed(seconds: number): {
  hours: number
  mins: number
  secs: number
  totalMins: number
} {
  if (isNaN(seconds) || seconds < 0) {
    return {
      hours: 0,
      mins: 0,
      secs: 0,
      totalMins: 0
    }
  }

  const totalSeconds = Math.floor(seconds)
  const totalMins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60

  return {
    hours,
    mins,
    secs,
    totalMins
  }
}
