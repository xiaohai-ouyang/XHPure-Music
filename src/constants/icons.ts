/**
 * 图标映射表
 * 使用 Phosphor 图标
 *
 * 使用方式：
 * import { iconMap } from '@/constants/icons'
 * <icon-ph-moon :size="24" /> -> 暗色模式
 *
 * 在组件中使用：<icon-ph-[name] :size="size" />
 */

export const iconMap = {
  // 主题图标
  darkMode: 'ph-moon',
  systemMode: 'ph-monitor',
  lightMode: 'ph-sun',

  // 导航图标
  music: 'ph-music-notes',
  playlist: 'ph-stack',

  // 播放器控制
  play: 'ph-play',
  pause: 'ph-pause',
  previous: 'ph-skip-back',
  next: 'ph-skip-forward',
  playlistQueue: 'ph-queue',

  // 播放模式
  loopMode: 'ph-repeat',
  randomMode: 'ph-shuffle',
  orderMode: 'ph-list-numbers',

  // 音量控制
  volumeHigh: 'ph-speaker-high',
  volumeLow: 'ph-speaker-low',
  volumeMute: 'ph-speaker-x',

  // 其他
  favorite: 'ph-heart',
  add: 'ph-plus',
  more: 'ph-dots-three',
  back: 'ph-arrow-left',
  fullScreen: 'ph-corners-out',
  exitFullScreen: 'ph-corners-in',
  close: 'ph-x',
  translation: 'ph-translate',
  menu: 'ph-list',
  delete: 'ph-trash',
} as const

export type IconName = keyof typeof iconMap
