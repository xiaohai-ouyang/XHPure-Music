import * as SparkMD5 from 'spark-md5'

/**
 * 计算音乐文件 MD5（针对 3~100MB 的音频优化）
 * @param file File | Blob
 */
export async function calcMusicMD5(file: File | Blob): Promise<string> {
  // 智能选择分片大小
  const chunkSize = file.size < 50 * 1024 * 1024 ? file.size : 8 * 1024 * 1024
  const chunks = Math.ceil(file.size / chunkSize)
  let currentChunk = 0
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        spark.append(new Uint8Array(result))
        currentChunk++

        if (currentChunk < chunks) {
          loadNext()
        } else {
          resolve(spark.end())
        }
      }
    }

    fileReader.onerror = () => reject(new Error('文件读取错误'))

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(file.size, start + chunkSize)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}
