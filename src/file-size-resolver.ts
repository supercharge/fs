'use strict'

import Fs from 'fs-extra'
import { tap } from '@supercharge/goodies'

type FileSizeMetric = 'bytes' | 'kilobytes' | 'megabytes'

export class FileSizeResolver {
  private metric: FileSizeMetric

  private readonly filePath: string

  constructor (filePath: string) {
    this.metric = 'bytes'
    this.filePath = filePath
  }

  private setMetric (metric: FileSizeMetric): this {
    return tap(this, () => {
      this.metric = metric
    })
  }

  async inBytes (): Promise<number> {
    await this.setMetric('bytes')

    return await this.calculate()
  }

  async inKb (): Promise<number> {
    await this.setMetric('kilobytes')

    return await this.calculate()
  }

  async inMb (): Promise<number> {
    await this.setMetric('megabytes')

    return await this.calculate()
  }

  async then (onFulfilled: (v: number) => any): Promise<void> {
    console.log('calling "then" in file size resolver. Size: ' + this.metric)

    onFulfilled(
      await this.calculate()
    )
  }

  private async calculate (): Promise<number> {
    const stats = await Fs.stat(this.filePath)

    return this.convert(stats.size)
  }

  private convert (bytes: number): number {
    switch (this.metric) {
      case 'kilobytes':
        return this.sizeInKb(bytes)

      case 'megabytes':
        return this.sizeInMb(bytes)

      default:
        return bytes
    }
  }

  private sizeInKb (bytes: number): number {
    return bytes / 1024
  }

  private sizeInMb (bytes: number): number {
    return this.sizeInKb(bytes) / 1024
  }
}
