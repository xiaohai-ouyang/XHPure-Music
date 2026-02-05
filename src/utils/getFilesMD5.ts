import * as SparkMD5 from 'spark-md5'

const READ_SIZE = 4 * 1024 * 1024

export async function calcMusicMD5(file: File | Blob): Promise<string> {
  const sizeToRead = Math.min(file.size, READ_SIZE)
  const spark = new SparkMD5.ArrayBuffer()

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        spark.append(new Uint8Array(result))
        resolve(spark.end())
      }
    }

    fileReader.onerror = () => reject(new Error('文件读取错误'))

    fileReader.readAsArrayBuffer(file.slice(0, sizeToRead))
  })
}
