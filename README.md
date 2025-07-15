# React Structural Metadata Editor

[![Netlify Status](https://api.netlify.com/api/v1/badges/b9540760-f4e5-4a70-8377-ab3af307e2d8/deploy-status)](https://app.netlify.com/sites/react-structural-metadata-editor/deploys)

A React component which displays structural metadata about an ingested audio/video file, and displays a visualized waveform to help navigating sections of the audio waveform. A user can add, edit and delete headers and timespans within the structural metadata, and save the record into a consuming application.

See how this React component works on the [demo page](https://react-structural-metadata-editor.netlify.app/) hosted using [Netlify](https://www.netlify.com/).

**Note**: We are not currently publishing this package to NPM, but rather consuming it directly via a Github repository URL address. See [Usage](#usage) notes below for more info and example code.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

#### Prerequisites

You'll need to have `node` installed on your local machine. Also, preferably `yarn` (as a wrapper for npm commands) installed as well. You can check either with:

```
node --version
yarn --version
```

#### Installing

1. Clone this repository to your local machine

```
git clone https://github.com/avalonmediasystem/react-structural-metadata-editor.git
```

2. Install dependencies

```
yarn install
```

3. Start the development server

```
yarn dev
```

Open up a browser and navigate to: http://localhost:3001/. Hot reloading via `webpack` is enabled, so you'll see live updates in the browser during development.

## Development

All development should be done in the `/src` directory.

The `/demo` directory contains the demo application entry point `index.html` file, and mocks a host application consuming the SME component.

If you'd like to try out a new development feature before merging your code into `main`, create a new branch, ie: `my-new-feature`, and push your branch to `https://github.com/avalonmediasystem/react-structural-metadata-editor`. See the [Usage](#usage) section below on how to import from either `main` or your own feature branch.

#### Commands

The following commands are available to the application via `npm scripts` located in the `package.json` file.

```
yarn clean
```

Cleans the output directory `dist`, ensuring a fresh copy of files when preparing your files for packaging.

```
yarn dev
```

Starts the webpack development server at http://localhost:3001 in which you can view your work.

```
yarn test:watch
```

If you prefer to keep an open `watch` on your tests during development, run this command in a separate tab in your terminal/shell.

```
yarn transpile
```

This command prepares the SME React component for packaging and distribution. It moves packaged, transpiled files into the `/dist` director, which is ready to be imported by another application.

\*\* _Run this command when you're happy with your development changes, before committing a branch which you wish to push to GitHub or import locally_.

#### Running the tests

To run the tests once, with a full coverage report:

```
yarn test
```

To run tests in `watch` mode:

```
yarn test:watch
```

`Jest` is our testing framework, and we're in the process of incorporating `react-testing-library` https://github.com/testing-library/react-testing-library.

#### Coding style tests

There is a `prettierrc` file with project coding style settings.

## Build and Deploy

#### Build

To create a new build package which can be imported by a consuming application, run:

```
yarn transpile
```

This will create a component package in the `/dist` folder which is ready to be imported by another application.

This commands needs to be run and its output pushed to the remote branch, before making a pull request to merge the changes in your working branch to `main`.

#### Deploy to Netlify

When new code changes are merged to the `main` branch, it automatically triggers a new deploy in Netlify. And the changes will be visible shortly on the demo website.

## Usage

#### Deployment in Production

#### Prerequisites for Git tags prior to `avalon-8.x` or `v3.x`
- Node.js (>= 16.x)
- `react` and `react-dom` (>= 16.x)
- NPM or Yarn

#### Prerequisites for Git tags on or after to `avalon-8.x` or `v4.x`
- Node.js (>= 20.x)
- `react` and `react-dom` (>= 18.x)
- `bootstrap` (>= 5.x)
- NPM or Yarn

To add this component to a host application, currently we're installing the component through a GitHub repo instead of the NPM repository, so to import the default package into your application, run:

```
yarn add https://github.com/avalonmediasystem/react-structural-metadata-editor
```

If you'd like to import a feature branch you're working on, maybe called `my-new-feature`, do the following:

```
yarn remove react-structural-metadata-editor
```

(to make sure old files aren't hanging around)

Then,

```
yarn add https://github.com/avalonmediasystem/react-structural-metadata-editor#my-new-feature
```

See the yarn docs (https://yarnpkg.com/lang/en/docs/cli/add/) for more info on alternative ways of importing packages.

#### Component Configuration

A consuming application is expected to provide the following configuration `props` passed to the SME component.

| Prop Name          | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |          |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `structureURL`     | string   | URL of the `structure.json` file on the server. This endpoint should accept POST requests with the updates made to the structure in the editor                                                                                                                                                                                                                                                                                  | Required |
| `manifestURL`      | string   | URL of the IIIF manifest containing the media and waveform for editing. *The component assumes the waveform file is listed under `seeAlso` property for each Canvas in the Manifest*                                                                                                                                                                                                                                                                                                                                                                                                     | Required |
| `canvasIndex`   | number   | Index of the canvas relevant to the media resource in the Manifest. This has a default value of 0 in the component.                                                                                                                                                                                                                                                                                                                                                                                                       | Optional |
| `withCredentials`  | boolean  | Value to pass through to [xhr.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) on the HLS stream request                                                                                                                                                                                                                                                                                           | Optional |
| `structureIsSaved` | function | Function to keep track of the status of the structure changes in the editor                                                                                                                                                                                                                                                                                                                                                                         | Optional |
| `disableSave` | boolean | Boolean flag to remove `Save Structure` functionality in the UI. Value of this flag defaults to `false`. When saving is disabled in the editor, 'Save Structure' button will not be displayed.                                                                                                                                                                                                                                                                                                                                                                         | Optional |

#### Example usage

```
const props = {
  structureURL: 'http://example.com/structure.json',
  manifestURL: 'http://example.com/manifest.json',
  canvasIndex: 0,
  structureIsSaved: (value) => {},
};

<StructuralMetadataEditor {...props} />
```

## Built With

- [React](https://reactjs.org/) - JavaScript component library
- [Peak.js](https://github.com/bbc/peaks.js) - Waveform display library from BBC
- [Jest](https://jestjs.io/) - Testing framework

## Contributing

Please read [CONTRIBUTING.md](contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/avalonmediasystem/react-structural-metadata-editor/tags).

## Authors

- **Adam J. Arling** - _Front End Developer_ - [Northwestern University](https://northwestern.edu)
- **Dananji Withana** - _Front End Developer_ - [Indiana University](https://indiana.edu)

See also the list of [contributors](https://github.com/avalonmediasystem/react-structural-metadata-editor/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [Avalon Media System](https://www.avalonmediasystem.org/)
