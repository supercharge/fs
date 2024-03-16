'use strict'

import Os from 'os'
import Path from 'path'
import ReadRecursive from 'recursive-readdir'
import { randomString, isDate } from './helper'
import { tap, upon } from '@supercharge/goodies'
import Fs, { PathLike, Stats, SymlinkType, WriteFileOptions } from 'fs-extra'
import Lockfile, { LockOptions, UnlockOptions, CheckOptions } from 'proper-lockfile'

export default Object.assign({}, Fs, {
  /**
   * Returns the file size in bytes of the file located at `path`.
   *
   * @param {String} path
   *
   * @returns {Integer}
   */
  async size (path: string): Promise<number> {
    return upon(await Fs.stat(path), (stat: Stats) => {
      return stat.size
    })
  },

  /**
   * Retrieve the time when `file` was last modified.
   *
   * @param {String} file
   *
   * @returns {Date}
   */
  async lastModified (file: string): Promise<Date> {
    return upon(await Fs.stat(file), (stat: Stats) => {
      return stat.mtime
    })
  },

  /**
   * Retrieve the time when `file` was last accessed.
   *
   * @param {String} file
   *
   * @returns {Date}
   */
  async lastAccessed (file: string): Promise<Date> {
    return upon(await Fs.stat(file), (stat: Stats) => {
      return stat.atime
    })
  },

  /**
   * Change the file system timestamps of the
   * referenced `path`. Updates the last
   * accessed and last modified properties.
   *
   * @param {String} path
   * @param {Number} lastAccessed
   * @param {Number} lastModified
   *
   * @throws
   */
  async updateTimestamps (path: string, lastAccessed: Date, lastModified: Date): Promise<void> {
    if (!isDate(lastAccessed)) {
      throw new Error(`Updating the last accessed timestamp for ${path} requires an instance of "Date". Received ${typeof lastAccessed}`)
    }

    if (!isDate(lastModified)) {
      throw new Error(`Updating the last modified timestamp for ${path} requires an instance of "Date". Received ${typeof lastAccessed}`)
    }

    await Fs.utimes(path, lastAccessed, lastModified)
  },

  /**
   * Test the user's permissions for the given `path` which can
   * be a file or directory. The `mode` argument is an optional
   * integer to specify the accessibility level.
   *
   * @param {String} path  - file or directory path
   * @param {Integer} mode - defaults to `fs.constants.F_OK`
   *
   * @returns {Boolean}
   *
   * @throws
   */
  async canAccess (path: string, mode: number = Fs.constants.F_OK): Promise<boolean> {
    try {
      await Fs.access(path, mode)

      return true
    } catch {
      return false
    }
  },

  /**
   * Shortcut for `pathExists` determining whether a given file or
   * directory exists at the given `path` on the file system.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async exists (path: string): Promise<boolean> {
    return await Fs.pathExists(path)
  },

  /**
   * Determine wether the given `path` does not exists.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async notExists (path: string): Promise<boolean> {
    return !await this.exists(path)
  },

  /**
   * Updates the access and modification times of the given `file` current
   * time. This method creates the `file` if it doesn’t exist.
   *
   * @param {String} file
   */
  async touch (file: string): Promise<void> {
    await Fs.ensureFile(file)

    const now = new Date()
    await this.updateTimestamps(file, now, now)
  },

  /**
   * Read the entire content of `file`. If no `encoding` is
   * specified, the raw buffer is returned. If `encoding` is
   * an object, it allows the `encoding` and `flag` options.
   *
   * @param {String} file
   * @param {String|Object} encoding
   *
   * @returns {String}
   */
  async readFile (file: string, encoding?: string): Promise<string> {
    if (encoding === undefined) {
      console.log('"Fs.readFile(file)" to retrieve the file’s content as string is deprecated. Use "Fs.content(file)" instead.')
    }

    return await Fs.readFile(file, encoding == null ? 'utf8' : encoding)
  },

  /**
   * Returns the content of the given `file` as a string.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  async content (file: string): Promise<string> {
    return await Fs.readFile(file, 'utf8')
  },

  /**
   * Returns an array of file names containing the files that are available
   * in the given directory `path`. This method excludes the paths `.` and
   * `..` and does not read files recursively in available subdirectories.
   *
   * @param {String} path
   *
   * @returns {Array}
   */
  async files (path: string): Promise<string[]> {
    return await Fs.readdir(path)
  },

  /**
   * Returns an array of file names of all files, even recursive files in the given
   * directory `path`.  This method excludes the paths `.`, `..`, and dotfiles.
   *
   * @param {String} path
   * @param {ReadFileOptions} options
   *
   * @returns {Array}
   */
  async allFiles (path: string, options?: ReadFileOptions): Promise<string[]> {
    const { ignore } = options == null ? { ignore: [] } : options

    return await ReadRecursive(path, ([] as any[]).concat(ignore || []))
  },

  /**
   * Write the given `content` to the file` and create
   * any parent directories if not existent.
   *
   * @param  {String} path
   * @param  {String} content
   * @param  {WriteFileOptions} options
   */
  async writeFile (file: string, content: string, options: WriteFileOptions): Promise<void> {
    return await Fs.outputFile(file, content, options)
  },

  /**
   * Removes a `file` from the file system.
   *
   * @param {String} file
   */
  async removeFile (file: string): Promise<void> {
    return await Fs.remove(file)
  },

  /**
   * Ensures that the directory exists. If the directory
   * structure does not exist, it is created.
   * Like `mkdir -p`.
   *
   * @param {String} dir - directory path
   *
   * @returns {String} dir - directory path
   */
  async ensureDir (dir: string): Promise<string> {
    return await tap(dir, async () => {
      await Fs.ensureDir(dir)
    })
  },

  /**
   * Removes a `dir` from the file system.The directory
   * can have content. Content in the directory will
   * be removed as well, like `rm -rf`.
   *
   * @param {String} dir - directory path
   */
  async removeDir (dir: string): Promise<void> {
    return await Fs.remove(dir)
  },

  /**
   * Changes the permissions of a `file`.
   * The `mode` is a numeric bitmask and
   * can be an integer or string.
   *
   * @param {String} file
   * @param {String|Integer} mode
   */
  async chmod (file: string, mode: string): Promise<void> {
    return await Fs.chmod(file, parseInt(mode, 8))
  },

  /**
   * Ensures that the symlink from source to
   * destination exists. If the directory
   * structure does not exist, it is created.
   *
   * @param {String} src
   * @param {String} dest
   * @param {String} type
   */
  async ensureSymlink (src: string, dest: string, type: SymlinkType = 'file'): Promise<void> {
    return await Fs.ensureSymlink(src, dest, type)
  },

  /**
   * Acquire a file lock on the specified `file` path with the given `options`.
   * If the `file` is already locked, this method won't throw an error and
   * instead just move on.
   *
   * @param {String} file
   * @param {Object} options
   *
   * @returns {Function} release function
   */
  async lock (file: string, options?: LockOptions): Promise<void> {
    if (await this.isNotLocked(file, options)) {
      await Lockfile.lock(file, options)
    }
  },

  /**
   * Release an existent lock for the `file` and given `options`. If the `file`
   * isn't locked, this method won't throw an error and just move on.
   *
   * @param {String} file
   */
  async unlock (file: string, options?: UnlockOptions): Promise<void> {
    if (await this.isLocked(file, options)) {
      await Lockfile.unlock(file, options)
    }
  },

  /**
   * Check if the `file` is locked and not stale.
   *
   * @param {String} file
   * @param {Object} options
   *
   * @returns {Boolean}
   */
  async isLocked (file: string, options?: CheckOptions): Promise<boolean> {
    return await Lockfile.check(file, options)
  },

  /**
   * Check if the `file` is not locked and not stale.
   *
   * @param {String} file
   * @param {Object} options
   *
   * @returns {Boolean}
   */
  async isNotLocked (file: string, options?: CheckOptions): Promise<boolean> {
    return !await this.isLocked(file, options)
  },

  /**
   * Create a random temporary file path you can write to.
   * The operating system will clean up the temporary
   * files automatically, probably after some days.
   *
   * @param {Object} options
   *
   * @returns {String}
   */
  async tempFile (name?: string): Promise<string> {
    const filename = name == null ? randomString() : name
    const file = Path.resolve(await this.tempDir(), filename)

    return await tap(file, async () => {
      await Fs.ensureFile(file)
    })
  },

  /**
   * Create a temporary directory path which will be cleaned up by the operating system.
   *
   * @returns {String}
   */
  async tempDir (): Promise<string> {
    return await this.ensureDir(
      await this.tempPath()
    )
  },

  /**
   * Returns the path to the user’s home directory. You may pass a `path` to which
   * the function should resolve in the user’s home directory. This method does
   * **not** ensure that the resolved path exists. Please do that yourself.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  homeDir (path?: string): string {
    return path
      ? Path.resolve(Os.homedir(), path)
      : Os.homedir()
  },

  /**
   * Generates a random, temporary path on the filesystem.
   *
   * @returns {String}
   */
  async tempPath (): Promise<string> {
    return Path.resolve(
      await this.realPath(Os.tmpdir()), randomString()
    )
  },

  /**
   * Returns the fully resolve, absolute file path to the given `path`.
   * Resolves any relative paths, like `..` or `.`, and symbolic links.
   *
   * @param {String} path
   * @param {Object} cache
   *
   * @returns {String}
   */
  async realPath (path: string, cache?: { [path: string]: string }): Promise<string> {
    return await Fs.realpath(path, cache)
  },

  /**
   * Returns the extension of `file`. For example, returns `.html`
   * for the HTML file located at `/path/to/index.html`.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  extension (file: string): string {
    return Path.extname(file)
  },

  /**
   * Returns the trailing name component from a file path. For example,
   * returns `file.png` from the path `/home/user/file.png`.
   *
   * @param {String} path
   * @param {String} extension
   *
   * @returns {String}
   */
  basename (path: string, extension?: string): string {
    return Path.basename(path, extension)
  },

  /**
   * Returns the file name without extension.
   *
   * @param {String} file
   *
   * @returns {String}
   */
  filename (file: string): string {
    return Path.parse(file).name
  },

  /**
   * Returns the directory name of the given `path`.
   * For example, a file path of `foo/bar/baz/file.txt`
   * returns `foo/bar/baz`.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  dirname (path: string): string {
    return Path.dirname(path)
  },

  /**
   * Determine whether the given `path` is a file.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async isFile (path: string): Promise<boolean> {
    return upon(await Fs.stat(path), (stats: Stats) => {
      return stats.isFile()
    })
  },

  /**
   * Determine whether the given `path` is a directory.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async isDirectory (path: string): Promise<boolean> {
    return upon(await Fs.stat(path), (stats: Stats) => {
      return stats.isDirectory()
    })
  },

  /**
   * Determine whether a the given `path` is a socket.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async isSocket (path: string): Promise<boolean> {
    return upon(await Fs.stat(path), (stats: Stats) => {
      return stats.isSocket()
    })
  },

  /**
   * Determine whether a the given `path` is a symbolic link.
   *
   * @param {PathLike} path
   *
   * @returns {Boolean}
   */
  async isSymLink (path: string): Promise<boolean> {
    return upon(await Fs.lstat(path), (stats: Stats) => {
      return stats.isSymbolicLink()
    })
  },

  /**
   * Append the given `content` to a `file`. This method
   * creates the `file` if it does not exist yet.
   *
   * @param {PathLike} file
   * @param {String|Buffer} content
   * @param {String|Object} options
   */
  async append (file: PathLike | number, content: string | Buffer, options?: AppendOptions): Promise<void> {
    await Fs.appendFile(file, content, options)
  },

  /**
   * Append the given `content` in a new line to the given `file`.
   * This method creates the `file` if it does not exist yet.
   *
   * @param {PathLike} file
   * @param {String|Buffer} content
   * @param {String|Object} options
   */
  async appendLine (file: PathLike | number, content: string | Buffer, options?: AppendOptions): Promise<void> {
    await this.append(file, Os.EOL, options)
    await this.append(file, content, options)
  },

  /**
   * Determine whether the given `path` points to an empty directory. In comparison to the
   * `Fs.emptyDir(path)` method, this `Fs.isEmptyDir(path)` method doesn’t load all files
   * into memory. It opens the folder as a stream and checks if at least one file exists.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  async isEmptyDir (path: string): Promise<boolean> {
    try {
      const dirent = await Fs.opendir(path)
      const value = await dirent.read()
      await dirent.close()

      return value === null
    } catch (error) {
      return false
    }
  }
})

export interface AppendOptions {
  encoding?: string
  mode?: number | string
  flag?: string
}

export type IgnoreFileCallback = (file: string, stats: Fs.Stats) => boolean
export interface ReadFileOptions {
  ignore: string | string[] | IgnoreFileCallback | IgnoreFileCallback[]
}
