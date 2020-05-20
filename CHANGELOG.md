# Changelog


## [2.0.0](https://github.com/supercharge/filesystem/compare/v1.0.0...v2.0.0) - 2020-05-xx

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
