'use strict'

const Fs = require('fs')
const Path = require('path')
const Crypto = require('crypto')
const Filesystem = require('../dist')
const { tap } = require('@supercharge/goodies')

const tempDir = Path.resolve(__dirname, 'tmp')

function randomName () {
  return Crypto.randomBytes(256).slice(0, 16).toString('hex')
}

function createFilePath (file = `${randomName()}.txt`) {
  return Path.resolve(tempDir, file)
}

async function ensureTempFile (filename = `${randomName()}.txt`) {
  return tap(createFilePath(filename), async file => {
    await Filesystem.ensureFile(file)
  })
}

describe('Filesystem', () => {
  beforeAll(async () => {
    await Filesystem.ensureDir(tempDir)
  })

  afterAll(async () => {
    await Filesystem.removeDir(tempDir)
  })

  it('stat', async () => {
    const file = await ensureTempFile()
    const stat = await Filesystem.stat(file)
    const statSync = await Fs.statSync(file)

    expect(stat).toEqual(statSync)
  })

  it('lastModified', async () => {
    const file = await ensureTempFile()
    const lastModified = await Filesystem.lastModified(file)

    const lastModifiedInSeconds = Math.floor(lastModified.getTime() / 1000)
    const nowInSeconds = Math.floor(new Date().getTime() / 1000)

    expect(lastModifiedInSeconds).toBeGreaterThanOrEqual(nowInSeconds)
    expect(lastModifiedInSeconds).toBeLessThanOrEqual(nowInSeconds + 1)
  })

  it('lastAccessed', async () => {
    const file = await ensureTempFile()
    const lastAccessed = await Filesystem.lastAccessed(file)

    const lastAccessedInSeconds = Math.floor(lastAccessed.getTime() / 1000)
    const nowInSeconds = Math.floor(new Date().getTime() / 1000)

    expect(lastAccessedInSeconds).toBeGreaterThanOrEqual(nowInSeconds)
    expect(lastAccessedInSeconds).toBeLessThanOrEqual(nowInSeconds + 1)
  })

  it('updateTimestamps', async () => {
    const file = await ensureTempFile()
    expect(await Filesystem.lastAccessed(file)).toBeDefined()
    expect(await Filesystem.lastModified(file)).toBeDefined()

    const now = new Date()
    await Filesystem.updateTimestamps(file, now, now)
    expect(await Filesystem.lastAccessed(file)).toEqual(now)
    expect(await Filesystem.lastModified(file)).toEqual(now)

    // updating the timestamps expects instances of "Date"
    await expect(Filesystem.updateTimestamps(file, Date.now(), now)).rejects.toThrow()
    await expect(Filesystem.updateTimestamps(file, now, Date.now())).rejects.toThrow()
  })

  it('lastModifiedNonExistentFile', async () => {
    const file = await ensureTempFile()
    await expect(Filesystem.lastModified(`${file}.unavailable`)).rejects.toThrow()
  })

  it('canAccess', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.canAccess(file)
    ).toBe(true)

    expect(
      await Filesystem.canAccess(file, Filesystem.constants.W_OK)
    ).toBe(true)
  })

  it('pathExists', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.pathExists(file)
    ).toBe(true)
  })

  it('exists', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.exists(file)
    ).toBe(true)
  })

  it('notExists', async () => {
    const file = await ensureTempFile()
    expect(await Filesystem.notExists(file)).toBe(false)

    await Filesystem.removeFile(file)
    expect(await Filesystem.notExists(file)).toBe(true)
  })

  it('ensureFile', async () => {
    const file = createFilePath()
    await Filesystem.ensureFile(file)
    expect(Fs.existsSync(file)).toBe(true)
  })

  it('readFile', async () => {
    const file = await ensureTempFile()
    Fs.writeFileSync(file, 'Hello Supercharge', 'utf8')

    expect(await Filesystem.readFile(file, 'utf8')).toEqual('Hello Supercharge')

    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    expect(await Filesystem.readFile(file)).toEqual('Hello Supercharge')
    expect(log).toBeCalled()
  })

  it('content', async () => {
    const file = await ensureTempFile()
    Fs.writeFileSync(file, 'Hello Supercharge', 'utf8')

    expect(
      await Filesystem.content(file)
    ).toEqual('Hello Supercharge')
  })

  it('files', async () => {
    const dirPath = Path.resolve(tempDir, 'tempDir')
    Fs.mkdirSync(dirPath)

    const filePath = Path.resolve(dirPath, 'test.txt')
    Fs.writeFileSync(filePath, 'Hello Supercharge')

    expect(
      await Filesystem.files(dirPath)
    ).toEqual(['test.txt'])
  })

  it('allFiles', async () => {
    const dirPath = Path.resolve(tempDir, 'allFilesTempDir')
    const subDirPath = Path.resolve(dirPath, 'subDir')
    Fs.mkdirSync(dirPath)
    Fs.mkdirSync(subDirPath)

    const filePath = Path.resolve(dirPath, 'test.txt')
    Fs.writeFileSync(filePath, 'Hello Supercharge', 'utf8')

    const subFilePath = Path.resolve(subDirPath, 'sub.txt')
    Fs.writeFileSync(subFilePath, 'Hello Supercharge', 'utf8')

    expect(
      await Filesystem.allFiles(dirPath)
    ).toEqual([
      Path.resolve(dirPath, 'test.txt'),
      Path.resolve(subDirPath, 'sub.txt')
    ])

    expect(
      await Filesystem.allFiles(dirPath, { ignore: 'helper' })
    ).toEqual([
      Path.resolve(dirPath, 'test.txt'),
      Path.resolve(subDirPath, 'sub.txt')
    ])

    expect(
      await Filesystem.allFiles(dirPath, {
        ignore (file, stats) {
          return stats.isDirectory() || file.includes('helper')
        }
      })
    ).toEqual([
      Path.resolve(dirPath, 'test.txt')
    ])
  })

  it('writeFile', async () => {
    const file = await ensureTempFile()
    await Filesystem.writeFile(file, 'Hello Supercharge')

    expect(
      await Filesystem.content(file)
    ).toEqual('Hello Supercharge')
  })

  it('remove', async () => {
    const file = await ensureTempFile()
    await Filesystem.remove(file)

    expect(await Filesystem.notExists(file)).toBe(true)
  })

  it('removeFile', async () => {
    const file = await ensureTempFile()
    await Filesystem.removeFile(file)

    expect(await Filesystem.notExists(file)).toBe(true)
    expect(await Filesystem.removeFile(file)).toBeUndefined()
  })

  it('copy', async () => {
    const source = await ensureTempFile()
    const destination = Path.resolve(tempDir, 'copy.txt')
    await Filesystem.copy(source, destination)

    const sourceExists = await Filesystem.exists(source)
    const destExists = await Filesystem.exists(destination)

    expect(sourceExists).toBe(true)
    expect(destExists).toBe(true)
  })

  it('move', async () => {
    const source = await ensureTempFile()
    const destination = Path.resolve(tempDir, 'moved.txt')
    await Filesystem.move(source, destination)

    expect(
      await Filesystem.exists(source)
    ).toBe(false)

    expect(
      await Filesystem.exists(destination)
    ).toBe(true)
  })

  it('ensureDir', async () => {
    const dir = Path.resolve(tempDir, 'ensureDir')
    await Filesystem.ensureDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).toBe(true)
  })

  it('removeDir', async () => {
    const dir = Path.resolve(tempDir, 'removeDir')
    await Filesystem.ensureDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).toBe(true)

    await Filesystem.removeDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).toBe(false)
  })

  it('emptyDir', async () => {
    const dir = Path.resolve(tempDir, 'emptyDir')
    await Filesystem.ensureDir(dir)

    const file = Path.resolve(dir, 'test.txt')
    await Filesystem.ensureFile(file)

    await Filesystem.emptyDir(dir)

    expect(
      await Filesystem.files(dir)
    ).toEqual([])
  })

  it('isEmptyDir', async () => {
    const dir = Path.resolve(tempDir, 'empty-directory')
    await Filesystem.ensureDir(dir)
    expect(await Filesystem.isEmptyDir(dir)).toBe(true)

    const file = Path.resolve(dir, 'test.txt')
    await Filesystem.ensureFile(file)
    expect(await Filesystem.isEmptyDir(dir)).toBe(false)
    expect(await Filesystem.files(dir)).toEqual(['test.txt'])

    const nonExistingDir = Path.resolve(createFilePath(), 'not-existent-directory')
    expect(await Filesystem.isEmptyDir(nonExistingDir)).toBe(false)
  })

  it('chmodAsString', async () => {
    const file1 = await ensureTempFile()
    await Filesystem.chmod(file1, '400') // read-only

    expect(await Filesystem.canAccess(file1, Filesystem.constants.W_OK)).toBe(false)

    const file2 = await ensureTempFile()
    await Filesystem.chmod(file2, '600') // read-write

    expect(await Filesystem.canAccess(file2, Filesystem.constants.W_OK)).toBe(true)
  })

  it('chmodAsInteger', async () => {
    const file1 = await ensureTempFile()
    await Filesystem.chmod(file1, 400) // read-only

    expect(await Filesystem.canAccess(file1, Filesystem.constants.W_OK)).toBe(false)

    const file2 = await ensureTempFile()
    await Filesystem.chmod(file2, 600) // read-write

    expect(await Filesystem.canAccess(file2, Filesystem.constants.W_OK)).toBe(true)
  })

  it('ensureLink', async () => {
    const file = await ensureTempFile()
    const link = Path.resolve(tempDir, 'links', 'link.txt')
    await Filesystem.ensureLink(file, link)

    expect(
      await Filesystem.exists(link)
    ).toBe(true)
  })

  it('ensureSymlink', async () => {
    const file = await ensureTempFile()
    const link = Path.resolve(tempDir, 'links', 'symlink.txt')
    await Filesystem.ensureSymlink(file, link)

    expect(
      await Filesystem.exists(link)
    ).toBe(true)
  })

  it('lock', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isLocked(file)
    ).toBe(false)

    await Filesystem.lock(file)
    await Filesystem.lock(file)

    expect(
      await Filesystem.isLocked(file)
    ).toBe(true)

    await Filesystem.unlock(file)

    expect(
      await Filesystem.isLocked(file)
    ).toBe(false)
  })

  it('unlock', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.unlock(file)
    ).toBeUndefined()

    await Filesystem.lock(file)

    expect(
      await Filesystem.isLocked(file)
    ).toBe(true)

    await Filesystem.unlock(file)

    expect(
      await Filesystem.isLocked(file)
    ).toBe(false)
  })

  it('tempFile', async () => {
    const file = await Filesystem.tempFile()
    expect(file).toBeDefined()

    const endsWithDotTest = await Filesystem.tempFile('abc.test')
    expect(endsWithDotTest).toBeDefined()
    expect(String(endsWithDotTest).endsWith('.test')).toBe(true)

    const testFile = await Filesystem.tempFile('test')
    expect(await Filesystem.exists(testFile)).toBe(true)
    expect(testFile).toBeDefined()
    expect(String(testFile).endsWith('.test')).toBe(false)

    const nullTestFile = await Filesystem.tempFile(null)
    expect(await Filesystem.exists(nullTestFile)).toBe(true)
  })

  it('tempDir', async () => {
    const dir = await Filesystem.tempDir()
    expect(await Filesystem.exists(dir)).toBe(true)
  })

  it('extension', async () => {
    const filename = `${randomName()}.test`
    const file = await ensureTempFile(filename)

    expect(
      await Filesystem.extension(Path.resolve(__dirname, file))
    ).toEqual('.test')
  })

  it('basename', async () => {
    const filename = `${randomName()}.test`
    const file = await ensureTempFile(filename)

    expect(
      Filesystem.basename(Path.resolve(__dirname, file))
    ).toEqual(filename)
  })

  it('filename', async () => {
    const filename = randomName()
    const file = await ensureTempFile(filename)

    expect(
      Filesystem.filename(Path.resolve(__dirname, file))
    ).toEqual(filename)
  })

  it('dirname', async () => {
    const file = await ensureTempFile()

    expect(
      Filesystem.dirname(Path.resolve(__dirname, file))
    ).toEqual(Path.parse(file).dir)
  })

  it('isFile', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isFile(file)
    ).toBe(true)

    expect(
      await Filesystem.isFile(Path.parse(file).dir)
    ).toBe(false)
  })

  it('isDirectory', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isDirectory(Path.parse(file).dir)
    ).toBe(true)

    expect(
      await Filesystem.isDirectory(file)
    ).toBe(false)
  })

  it('size', async () => {
    const file = await ensureTempFile()
    expect(
      await Filesystem.size(file)
    ).toEqual(0)

    await Filesystem.writeFile(file, 'hello')
    expect(
      await Filesystem.size(file)
    ).toEqual(5)
  })

  it('append', async () => {
    const file = await ensureTempFile()

    expect(await Filesystem.content(file)).toEqual('')
    await Filesystem.append(file, 'Headline')
    await Filesystem.append(file, 'content')
    expect(await Filesystem.content(file)).toEqual('Headlinecontent')

    // creates file if not existent
    const newFile = createFilePath()

    expect(await Filesystem.notExists(newFile)).toBe(true)
    await Filesystem.append(newFile, 'new file')
    expect(await Filesystem.exists(newFile)).toBe(true)
  })

  it('appendLine', async () => {
    const file = await ensureTempFile()

    expect(await Filesystem.content(file)).toEqual('')
    await Filesystem.append(file, 'Headline')
    await Filesystem.appendLine(file, 'text')
    expect(await Filesystem.content(file)).toEqual('Headline\ntext')

    // creates file if not existent
    const newFile = createFilePath()

    expect(await Filesystem.notExists(newFile)).toBe(true)
    await Filesystem.appendLine(newFile, 'new file')
    expect(await Filesystem.exists(newFile)).toBe(true)
  })

  it('rename', async () => {
    const oldPath = await ensureTempFile()
    const newPath = await createFilePath('new.txt')

    await Filesystem.rename(oldPath, newPath)
    expect(await Filesystem.exists(oldPath)).toBe(false)
    expect(await Filesystem.exists(newPath)).toBe(true)

    // overwrites dest
    const src = await ensureTempFile()
    const dest = await ensureTempFile()

    await Filesystem.rename(src, dest)
    expect(await Filesystem.exists(src)).toBe(false)
    expect(await Filesystem.exists(dest)).toBe(true)
  })

  it('homeDir', async () => {
    const homeDir = await Filesystem.homeDir()
    expect(homeDir).not.toBeNull()
    expect(homeDir.startsWith('/')).toBe(true)

    const homeDirAt = await Filesystem.homeDir('test.txt')
    expect(homeDirAt).not.toBeNull()
    expect(homeDirAt.endsWith('/test.txt')).toBe(true)

    const homeDirNested = await Filesystem.homeDir('.my-app/settings.yml')
    expect(homeDirNested).not.toBeNull()
    expect(homeDirNested.endsWith('.my-app/settings.yml')).toBe(true)
  })

  it('touch', async () => {
    const file = createFilePath()

    await Filesystem.touch(file)
    expect(await Filesystem.exists(file)).toBe(true)

    const [lastAccessed, lastModified] = [
      await Filesystem.lastAccessed(file),
      await Filesystem.lastModified(file)
    ]

    await new Promise(resolve => setTimeout(resolve, 10))
    await Filesystem.touch(file)

    const [lastAccessedUpdated, lastModifiedUpdated] = [
      await Filesystem.lastAccessed(file),
      await Filesystem.lastModified(file)
    ]

    expect(lastAccessedUpdated.getTime()).toBeGreaterThan(lastAccessed.getTime())
    expect(lastModifiedUpdated.getTime()).toBeGreaterThan(lastModified.getTime())
  })

  it('isSocket', async () => {
    expect(await Filesystem.isSocket('/var/run/docker.sock')).toBe(true)

    const file = await ensureTempFile()
    expect(await Filesystem.isSocket(file)).toBe(false)

    await expect(async () => {
      return Filesystem.isSocket('./not-existing.file')
    }).rejects.toThrow()
  })

  it('isSymLink', async () => {
    const file = await ensureTempFile()
    const link = Path.resolve(tempDir, 'links/isSymLink.txt')
    await Filesystem.ensureSymlink(file, link)

    expect(await Filesystem.isSymLink(link)).toBe(true)
    expect(await Filesystem.isSymLink(file)).toBe(false)
  })

  it('ensure stream methods', async () => {
    expect(Filesystem.ReadStream).not.toBe(undefined)
    expect(Filesystem.WriteStream).not.toBe(undefined)

    expect(typeof Filesystem.createReadStream).toBe('function')
    expect(typeof Filesystem.createWriteStream).toBe('function')
  })
})
