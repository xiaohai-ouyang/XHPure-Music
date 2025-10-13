declare module 'spark-md5' {
  export class ArrayBuffer {
    append(buffer: ArrayBuffer | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array | DataView): void;
    end(raw?: boolean): string;
    destroy(): void;
    reset(): void;
  }

  export class Hasher {
    append(str: string): void;
    end(raw?: boolean): string;
    destroy(): void;
    reset(): void;
  }

  export function hash(str: string, raw?: boolean): string;
  export function hashBinary(content: string, raw?: boolean): string;
}