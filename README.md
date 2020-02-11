<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>Filesystem</h3>
  </p>
  <p>
    Async filesystem methods for Node.js
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#Docs"><strong>Docs</strong></a> ·
    <a href="#usage"><strong>Usage</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/filesystem"><img src="https://img.shields.io/npm/v/@supercharge/filesystem.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/filesystem"><img src="https://img.shields.io/npm/dm/@supercharge/filesystem.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
The `@supercharge/filesystem` package provides async filesystem methods. It’s a wrapper around Node.js’ `fs` package exposing only async methods. It provides a handful of additional methods, like `copy`, `move`, `ensureFile`, `size`, and `tempFile` (there are actually a lot more).

**Please notice:** this package is not providing all of the native `fs` methods from Node.js. It provides dozens of most used methods, fully async.


## Installation

```
npm i @supercharge/filesystem
```


## Docs
Find all the [details for `@supercharge/filesystem` in the extensive Supercharge docs](https://superchargejs.com/docs/filesystem).


## Usage
Using `@supercharge/filesystem` is pretty straightforward. Install and import the package in your project and use the methods to interact with the filesystem.

For example, you may copy or move a file from `src` to `dest` or retrieve a file’s size:

```js
const Fs = require('@supercharge/filesystem')

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
