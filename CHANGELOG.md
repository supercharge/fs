# Changelog

## [3.4.0](https://github.com/supercharge/fs/compare/v3.3.0...v3.4.0) - 2021-08-21

### Added
- `isEmptyDir(path)` method: determine whether the given `path` points to an empty directory
  - in comparison to the `Fs.emptyDir(path)` method, this `Fs.isEmptyDir(path)` method doesn’t load all files into memory. It opens the folder as a stream and checks if at least one file exists

### Updated
- bump dependencies


## [3.3.0](https://github.com/supercharge/fs/compare/v3.2.0...v3.3.0) - 2021-07-26

### Added
- `appendLine(file, content, options)` method: append the given `content` in a new line to the `file`

### Updated
- use `PathLike` type for the file parameter in the `append(file, content, options)` and `appendLine(file, content, options)` methods


## [3.2.0](https://github.com/supercharge/fs/compare/v3.1.0...v3.2.0) - 2021-07-20

### Added
- type definitions for the `options` object in `allFiles(path, options`

### Updated
- bump dependencies
- refined doc blocks for the `files` and `allFiles` methods


## [3.1.0](https://github.com/supercharge/fs/compare/v3.0.1...v3.1.0) - 2021-07-04

### Added
- `content(file)` method: reads the content of the given `file` and returns it as a string

### Updated
- bump dependencies
- `readFile(file)` is deprecated
  - use `Fs.content(file)` or `Fs.readFile(file, 'utf8)` instead. You’ll receive a deprecation message when using this method without specifying the `enconding` as the second argument


## [3.0.1](https://github.com/supercharge/fs/compare/v3.0.0...v3.0.1) - 2021-06-20

### Updated
- moved `@types/fs-extra` from devDependencies to dependencies fixing missing tpying issues in Typescript


## [3.0.0](https://github.com/supercharge/fs/compare/v2.3.0...v3.0.0) - 2021-06-14

### Added
- `lstat(path)` method: retrieve file system details about the given `path` (used for symbolic links)
- `fstat(path)` method: retrieve file system details about the given `path` (used for file descriptors)
- `isSocket(path)` method: determine whether the given `path` is a socket
- `isSymLink(path)` method: determine whether the given `path` is a symbolic link

### Updated
- export all methods from `fs-extra`: previously a subset of methods was exposed. Stream-related methods were not available. That changes with this release where all methods from `fs-extra` are exposed. On top of that, we add some helpful defaults to some methods, e.g. `readFile` returns the content as string in this package)
- bump dependencies
  - updated to `fs-extra` 10.x
- moving the code base from being a class to export an object
  - allows destructured imports for individual methods
  ```js
  // before
  import Fs from '@supercharge/fs'
  Fs.copy(src, dest)

  // now
  import { copy } from '@supercharge/fs'
  copy(src, dest)
  ```

### Breaking Changes
- requires Node.js v12 or later (v10 before)
- renamed this package from `@supercharge/filesystem` to `@supercharge/fs`
  - `@supercharge/filesystem` is now deprecated in favor of `@supercharge/fs`
  - starting from 3.0.0: use `@supercharge/fs`
  - until version 2.3.0: use `@supercharge/filesystem`


## [2.3.0](https://github.com/supercharge/fs/compare/v2.2.1...v2.3.0) - 2021-02-14

### Added
- add `touch(file)` method: update the file’s last accessed and modified timestamps to the current time. Creates the `file` if it doesn’t exist.


## [2.2.1](https://github.com/supercharge/fs/compare/v2.2.0...v2.2.1) - 2021-02-14

### Fixed
- configuration to publish the package in the GitHub Package Registry


## [2.2.0](https://github.com/supercharge/fs/compare/v2.1.0...v2.2.0) - 2021-02-14

### Added
- add `homeDir(path?)` method: resolves the path to the user’s home directory
- add `realPath` method: returns the real file path by resolving symbolic links

### Updated
- bump dependencies
- change `main` entrypoint in `package.json` to `dist` folder
- move test runner from `@hapi/lab` to `jest`
- move assertions from `@hapi/code` to `jest`

### Removed
- remove `index.js` file which acted as a middleman to export from `dist` folder


## [2.1.0](https://github.com/supercharge/fs/compare/v2.0.0...v2.1.0) - 2020-06-12

### Added
- export TypeScript types that are used by this package

### Updated
- bump dependencies


## [2.0.0](https://github.com/supercharge/fs/compare/v1.0.0...v2.0.0) - 2020-05-21

### Added
- `rename(src, dest)` method to rename a `src` pathname to `dest`
- `append(file, content, options)` method to append the given `content` to a `file`
- `isNotLocked(file, options)` method to determine whether a given `file` is not locked

### Updated
- move code to TypeScript to automatically generate typings

### Breaking Changes
We noticed issues using the [`lockfile`](https://github.com/npm/lockfile) package to lock and unlock files. The file lock would even be aquired for non-existent files.

We switched the dependency for locking and unlocking files to [`proper-lockfile`](https://github.com/moxystudio/node-proper-lockfile). This package is now used to aquire, check, and release file locks.

**Breaking Changes**
- require Node.js v10 or later
- removed internally used `prepareLockFile` method because it’s not needed anymore


## 1.0.0 - 2020-02-12

### Added
- `1.0.0` release 🚀 🎉
