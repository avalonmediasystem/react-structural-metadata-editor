# React Structural Metadata Editor

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

This is a React component which renders a structural metadata, waveform editor. It's currently used to export the root level structural metadata waveform component directly into Avalon 6/7.

No development happens in this repository. The primary development of the component is currently at:
https://github.com/avalonmediasystem/structured-metadata-editor-react

The files are packaged in that repository, then (for now) need to be manually copied over to this repository, which contains the `nwb` packaging tools necessary to package the React component for distribution.

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo
[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package
[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo

## Usage

### Prepare source directory

Run `this script coming soon...`, to clean and prepare the `/src` directory.

### Import files into project

Manually copy files from (https://github.com/avalonmediasystem/structured-metadata-editor-react) folder: `/package-files` to this repository's `/src` directory.

### Build the exportable packages

Run `yarn build-and-copy`

### Push up to Github

Stage all new files and make a git commit. Then push up to whichever branch you'd like to use, that your consuming application will reference when doing a `yarn install`.

For example, to push up a specific branch:
`git push origin my-export-branch`

Then in your consuming application:
`yarn remove react-structural-metadata-editor` (To make sure we're not using a cached version of the component)

`yarn add https://github.com/avalonmediasystem/react-structural-metadata-editor#my-export-branch`

Or, to use the master branch as your export branch:
`yarn add https://github.com/avalonmediasystem/react-structural-metadata-editor.git`
