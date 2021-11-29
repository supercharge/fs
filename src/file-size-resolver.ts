'use strict'

import Fs from 'fs-extra'
import { tap } from '@supercharge/goodies'

type FileSize = 'bytes' | 'kilobytes' | 'megabytes'

export class FileSizeResolver {
  private size: FileSize

  private readonly filePath: string

  constructor (filePath: string) {
    this.size = 'bytes'
    this.filePath = filePath
  }

  inBytes (): this {
    return tap(this, () => {
      this.size = 'bytes'
    })
  }

  inKb (): this {
    return tap(this, () => {
      this.size = 'kilobytes'
    })
  }

  inMb (): this {
    return tap(this, () => {
      this.size = 'megabytes'
    })
  }

  async then (onResolved: (v: number) => void): Promise<void> {
    console.log('calling "then" in file size resolver')

    const stats = await Fs.stat(this.filePath)

    onResolved(this.convert(stats.size))
  }

  private convert (bytes: number): number {
    switch (this.size) {
      case 'kilobytes':
        return this.sizeInKb(bytes)

      case 'megabytes':
        return this.sizeInMb(bytes)

      default:
        return bytes
    }
  }

  private sizeInKb (bytes: number): number {
    return bytes * 1024
  }

  private sizeInMb (bytes: number): number {
    return this.sizeInKb(bytes) * 1024
  }
}
