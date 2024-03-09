'use strict'

import Fs from 'fs-extra'

export type FileSizeMetric =
  'bytes' |
  'kilobytes' |
  'megabytes' |
  'gigabytes' |
  'terabytes' |
  'petabytes'

export class FileSizeBuilder implements PromiseLike<number> {
  /**
   * Stores the file size metric.
   */
  private metric: FileSizeMetric

  /**
   * Stores the file path.
   */
  private readonly filePath: string

  /**
   * Create a new instance for the given `filePath`.
   */
  constructor (filePath: string) {
    this.metric = 'bytes'
    this.filePath = filePath
  }

  async inBytes (): Promise<number> {
    return await this.setMetric('bytes').calculate()
  }

  async inKb (): Promise<number> {
    return await this.setMetric('kilobytes').calculate()
  }

  async inMb (): Promise<number> {
    return await this.setMetric('megabytes').calculate()
  }

  async inGb (): Promise<number> {
    return await this.setMetric('gigabytes').calculate()
  }

  async inTb (): Promise<number> {
    return await this.setMetric('terabytes').calculate()
  }

  async inPb (): Promise<number> {
    return await this.setMetric('petabytes').calculate()
  }

  private setMetric (metric: FileSizeMetric): this {
    this.metric = metric

    return this
  }

  /**
   * Returns the file size with the provided metric ("bytes" by default).
   */
  then<TResult1 = number, TResult2 = never> (onfulfilled: ((value: number) => TResult1 | PromiseLike<TResult1>), onrejected: ((reason: any) => TResult2 | PromiseLike<TResult2>)): PromiseLike<TResult1 | TResult2> {
    return this.calculate()
      .then(size => onfulfilled(size))
      .catch(error => onrejected(error))
  }

  private async calculate (): Promise<number> {
    const stats = await Fs.stat(this.filePath)

    return this.convert(stats.size)
  }

  private convert (bytes: number): number {
    switch (this.metric) {
      case 'bytes':
        return bytes

      case 'kilobytes':
        return this.toKilobytes(bytes)

      case 'megabytes':
        return this.toMegabytes(bytes)

      case 'gigabytes':
        return this.toGigabytes(bytes)

      case 'terabytes':
        return this.toTerabytes(bytes)

      case 'petabytes':
        return this.toPetabytes(bytes)

      default:
        throw new Error(`Invalid file size metric. Received "${String(this.metric)}"`)
    }
  }

  private toKilobytes (bytes: number): number {
    return bytes / 1024
  }

  private toMegabytes (bytes: number): number {
    return this.toKilobytes(bytes) / 1024
  }

  private toGigabytes (bytes: number): number {
    return this.toMegabytes(bytes) / 1024
  }

  private toTerabytes (bytes: number): number {
    return this.toGigabytes(bytes) / 1024
  }

  private toPetabytes (bytes: number): number {
    return this.toTerabytes(bytes) / 1024
  }
}
