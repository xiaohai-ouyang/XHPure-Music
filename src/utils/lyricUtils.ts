/**
 * 歌词处理工具函数
 */

/**
 * 检测文本包含的语言
 * @param text 待检测的文本
 * @returns 包含的语言数组
 */
export function detectLanguages(text: string): string[] {
  const langSet = new Set<string>()
  if (/[\u4e00-\u9fff]/.test(text)) langSet.add('zh')
  if (/[A-Za-z]/.test(text)) langSet.add('en')
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) langSet.add('ja')
  if (/[\uac00-\ud7af]/.test(text)) langSet.add('ko')
  return Array.from(langSet)
}

/**
 * 判断是否为双语歌词
 * @param lyrics 歌词文本（不包含时间戳）
 * @returns 是否为双语歌词
 */
export function isBilingualLyrics(lyrics: string): boolean {
  if (!lyrics) return false

  // 按行分割
  const lines = lyrics.split('\n')
  let pureChineseLineCount = 0

  lines.forEach((line) => {
    // 跳过带冒号的行（通常是标题、作者等信息）
    if (/:|：/.test(line)) return

    const langs = detectLanguages(line)
    // 纯中文行（只包含中文）
    if (langs.includes('zh') && langs.length === 1) {
      pureChineseLineCount++
    }
  })

  // 规则：如果纯中文行比包含非中文的行多超过 5 行，则视为非双语
  // 否则只要两类行都存在，就视为双语
  return pureChineseLineCount <= 5
}
