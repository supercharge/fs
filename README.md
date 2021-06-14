<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>Fs</h3>
  </p>
  <p>
    Extended and async `fs` package for Node.js
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#resources"><strong>Docs</strong></a> ·
    <a href="#quick-usage-overview"><strong>Usage</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/fs"><img src="https://img.shields.io/npm/v/@supercharge/fs.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/fs"><img src="https://img.shields.io/npm/dm/@supercharge/fs.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
The `@supercharge/fs` package provides an improved and extended [`fs`](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html) implementation

- provides convenience methods like `isFile(path)` or `isDirectory(path)`
- useful methods, like `copy`, `ensureFile`, `ensureDir`
- based on [fs-extra](https://github.com/jprichardson/node-fs-extra) providing all native `fs` methods from Node.js
- full async/await support
- aligned camelCase method naming, like `realPath` instead of `realpath`


## Installation

```
npm i @supercharge/fs
```


## Resources
- [Documentation](https://superchargejs.com/docs/filesystem)


## Quick Usage Overview
Using `@supercharge/fs` is pretty straightforward. Install and import the package in your project and use the methods to interact with the filesystem.

For example, you may copy or move a file from `src` to `dest` or retrieve a file’s size:

```js
const Fs = require('@supercharge/fs')

await Fs.copy(src, dest)
await Fs.move(src, dest)

const size = await Fs.size(file)
// 3758 bytes
```

Have a look at the [docs](https://superchargejs.com/docs/filesystem) for this package to find more details on all supported methods.


## Contributing
Do you miss a string function? We very much appreciate your contribution! Please send in a pull request 😊

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀


## License
MIT © [Supercharge](https://superchargejs.com)

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@superchargejs](https://github.com/superchargejs/) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
