'use strict'

const Fs = require('fs')
const Path = require('path')
const Lab = require('@hapi/lab')
const Crypto = require('crypto')
const Filesystem = require('..')
const { expect } = require('@hapi/code')
const { tap } = require('@supercharge/goodies')

const { describe, it, before, after } = (exports.lab = Lab.script())

const tempDir = Path.resolve(__dirname, 'tmp')

function randomName () {
  return Crypto.randomBytes(256).slice(0, 16).toString('hex')
}

async function tempFile (file = `${randomName()}.txt`) {
  return Path.resolve(tempDir, file)
}

async function ensureTempFile (filename = `${randomName()}.txt`) {
  return tap(tempFile(filename), async file => {
    await Filesystem.ensureFile(file)
  })
}

describe('Filesystem', () => {
  before(async () => {
    Fs.mkdirSync(tempDir)
  })

  after(async () => {
    await Filesystem.removeDir(tempDir)
  })

  it('stat', async () => {
    const file = await ensureTempFile()
    const stat = await Filesystem.stat(file)
    const statSync = await Fs.statSync(file)

    expect(stat).to.equal(statSync)
  })

  it('lastModified', async () => {
    const file = await ensureTempFile()
    const lastModified = await Filesystem.lastModified(file)

    const lastModifiedInSeconds = Math.floor(lastModified.getTime() / 1000)
    const nowInSeconds = Math.floor(new Date().getTime() / 1000)

    expect(lastModifiedInSeconds).to.equal(nowInSeconds)
  })

  it('lastAccessed', async () => {
    const file = await ensureTempFile()
    const lastAccessed = await Filesystem.lastAccessed(file)

    const lastAccessedInSeconds = Math.floor(lastAccessed.getTime() / 1000)
    const nowInSeconds = Math.floor(new Date().getTime() / 1000)

    expect(lastAccessedInSeconds).to.equal(nowInSeconds)
  })

  it('updateTimestamps', async () => {
    const file = await ensureTempFile()
    expect(await Filesystem.lastAccessed(file)).to.exist()
    expect(await Filesystem.lastModified(file)).to.exist()

    const now = new Date()
    await Filesystem.updateTimestamps(file, now, now)
    expect(await Filesystem.lastAccessed(file)).to.equal(now)
    expect(await Filesystem.lastModified(file)).to.equal(now)

    // updating the timestamps expects instances of "Date"
    await expect(Filesystem.updateTimestamps(file, Date.now(), now)).to.reject()
    await expect(Filesystem.updateTimestamps(file, now, Date.now())).to.reject()
  })

  it('lastModifiedNonExistentFile', async () => {
    const file = await ensureTempFile()
    await expect(Filesystem.lastModified(`${file}.unavailable`)).to.reject()
  })

  it('canAccess', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.canAccess(file, Fs.constants.W_OK)
    ).to.be.true()
  })

  it('pathExists', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.pathExists(file)
    ).to.be.true()
  })

  it('exists', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.exists(file)
    ).to.be.true()
  })

  it('notExists', async () => {
    const file = await ensureTempFile()
    expect(await Filesystem.notExists(file)).to.be.false()

    await Filesystem.removeFile(file)
    expect(await Filesystem.notExists(file)).to.be.true()
  })

  it('ensureFile', async () => {
    const file = await tempFile()
    await Filesystem.ensureFile(file)
    expect(Fs.existsSync(file)).to.be.true()
  })

  it('readFile', async () => {
    const file = await ensureTempFile()
    Fs.writeFileSync(file, 'Hello Supercharge', 'utf8')

    expect(
      await Filesystem.readFile(file)
    ).to.equal('Hello Supercharge')
  })

  it('files', async () => {
    const dirPath = Path.resolve(tempDir, 'tempDir')
    Fs.mkdirSync(dirPath)

    const filePath = Path.resolve(dirPath, 'test.txt')
    Fs.writeFileSync(filePath, 'Hello Supercharge')

    expect(
      await Filesystem.files(dirPath)
    ).to.equal(['test.txt'])
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
    ).to.equal([
      Path.resolve(dirPath, 'test.txt'),
      Path.resolve(subDirPath, 'sub.txt')
    ])

    expect(
      await Filesystem.allFiles(dirPath, { ignore: 'helper' })
    ).to.equal([
      Path.resolve(dirPath, 'test.txt'),
      Path.resolve(subDirPath, 'sub.txt')
    ])
  })

  it('writeFile', async () => {
    const file = await ensureTempFile()
    await Filesystem.writeFile(file, 'Hello Supercharge')

    expect(
      await Filesystem.readFile(file)
    ).to.equal('Hello Supercharge')
  })

  it('remove', async () => {
    const file = await ensureTempFile()
    await Filesystem.remove(file)

    expect(
      await Filesystem.exists(file)
    ).to.be.false()
  })

  it('removeFile', async () => {
    const file = await ensureTempFile()
    await Filesystem.removeFile(file)

    expect(
      await Filesystem.exists(file)
    ).to.be.false()
  })

  it('copy', async () => {
    const source = await ensureTempFile()
    const destination = Path.resolve(tempDir, 'copy.txt')
    await Filesystem.copy(source, destination)

    const sourceExists = await Filesystem.exists(source)
    const destExists = await Filesystem.exists(destination)

    expect(sourceExists).to.be.true()
    expect(destExists).to.be.true()
  })

  it('move', async () => {
    const source = await ensureTempFile()
    const destination = Path.resolve(tempDir, 'moved.txt')
    await Filesystem.move(source, destination)

    expect(
      await Filesystem.exists(source)
    ).to.be.false()

    expect(
      await Filesystem.exists(destination)
    ).to.be.true()
  })

  it('ensureDir', async () => {
    const dir = Path.resolve(tempDir, 'ensureDir')
    await Filesystem.ensureDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).to.be.true()
  })

  it('removeDir', async () => {
    const dir = Path.resolve(tempDir, 'removeDir')
    await Filesystem.ensureDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).to.be.true()

    await Filesystem.removeDir(dir)

    expect(
      await Filesystem.exists(dir)
    ).to.be.false()
  })

  it('emptyDir', async () => {
    const dir = Path.resolve(tempDir, 'emptyDir')
    await Filesystem.ensureDir(dir)

    const file = Path.resolve(dir, 'test.txt')
    await Filesystem.ensureFile(file)

    await Filesystem.emptyDir(dir)

    expect(
      await Filesystem.files(dir)
    ).to.equal([])
  })

  it('chmodAsString', async () => {
    const file1 = await ensureTempFile()
    await Filesystem.chmod(file1, '400') // read-only

    expect(await Filesystem.canAccess(file1, Fs.constants.W_OK)).to.be.false()

    const file2 = await ensureTempFile()
    await Filesystem.chmod(file2, '600') // read-write

    expect(await Filesystem.canAccess(file2, Fs.constants.W_OK)).to.be.true()
  })

  it('chmodAsInteger', async () => {
    const file1 = await ensureTempFile()
    await Filesystem.chmod(file1, 400) // read-only

    expect(await Filesystem.canAccess(file1, Fs.constants.W_OK)).to.be.false()

    const file2 = await ensureTempFile()
    await Filesystem.chmod(file2, 600) // read-write

    expect(await Filesystem.canAccess(file2, Fs.constants.W_OK)).to.be.true()
  })

  it('ensureLink', async () => {
    const file = await ensureTempFile()
    const link = Path.resolve(tempDir, 'links', 'link.txt')
    await Filesystem.ensureLink(file, link)

    expect(
      await Filesystem.exists(link)
    ).to.be.true()
  })

  it('ensureSymlink', async () => {
    const file = await ensureTempFile()
    const link = Path.resolve(tempDir, 'links', 'symlink.txt')
    await Filesystem.ensureSymlink(file, link)

    expect(
      await Filesystem.exists(link)
    ).to.be.true()
  })

  it('lock', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isLocked(file)
    ).to.be.false()

    await Filesystem.lock(file)

    expect(
      await Filesystem.isLocked(file)
    ).to.be.true()
  })

  it('unlock', async () => {
    const file = await ensureTempFile()

    await Filesystem.lock(file)
    expect(
      await Filesystem.isLocked(file)
    ).to.be.true()

    await Filesystem.unlock(file)
    expect(
      await Filesystem.isLocked(file)
    ).to.be.false()
  })

  it('tempFile', async () => {
    const file = await Filesystem.tempFile()
    expect(file).to.exist()

    const endsWithDotTest = await Filesystem.tempFile({ extension: '.test' })
    expect(endsWithDotTest).to.exist().and.to.endWith('.test')

    const endsWithTest = await Filesystem.tempFile({ extension: 'test' })
    expect(endsWithTest).to.exist().and.to.endWith('.test')

    const nameIsTesting = await Filesystem.tempFile({ name: 'testing' })
    await expect(nameIsTesting).to.exist().and.to.endWith('testing')

    await expect(Filesystem.tempFile({ extension: '.test', name: 'testing' })).to.reject()
  })

  it('tempDir', async () => {
    const dir = await Filesystem.tempDir()
    expect(await Filesystem.exists(dir)).to.be.true()
  })

  it('extension', async () => {
    const filename = `${randomName()}.test`
    const file = await ensureTempFile(filename)

    expect(
      await Filesystem.extension(Path.resolve(__dirname, file))
    ).to.equal('.test')
  })

  it('basename', async () => {
    const filename = `${randomName()}.test`
    const file = await ensureTempFile(filename)

    expect(
      await Filesystem.basename(Path.resolve(__dirname, file))
    ).to.equal(filename)
  })

  it('filename', async () => {
    const filename = randomName()
    const file = await ensureTempFile(filename)

    expect(
      await Filesystem.filename(Path.resolve(__dirname, file))
    ).to.equal(filename)
  })

  it('dirname', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.dirname(Path.resolve(__dirname, file))
    ).to.equal(Path.parse(file).dir)
  })

  it('isFile', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isFile(file)
    ).to.be.true()

    expect(
      await Filesystem.isFile(Path.parse(file).dir)
    ).to.be.false()
  })

  it('isDirectory', async () => {
    const file = await ensureTempFile()

    expect(
      await Filesystem.isDirectory(Path.parse(file).dir)
    ).to.be.true()

    expect(
      await Filesystem.isDirectory(file)
    ).to.be.false()
  })

  it('size', async () => {
    const file = await ensureTempFile()
    expect(
      await Filesystem.size(file)
    ).to.equal(0)

    await Filesystem.writeFile(file, 'hello')
    expect(
      await Filesystem.size(file)
    ).to.equal(5)
  })
})
