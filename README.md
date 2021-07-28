# React Structural Metadata Editor

A React component which displays structural metadata about an ingested audio/video file, and displays a visualized waveform to help navigating sections of the audio waveform. A user can add, edit and delete headers and timespans within the structural metadata, and save the record into a consuming application.

**Note**: We are not currently publishing this package to NPM, but rather consuming it directly via a Github repository URL address. See [Deployment](#user-content-deployment) notes below for more info and example code.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You'll need to have `node` installed on your local machine. Also, preferably `yarn` (as a wrapper for npm commands) installed as well. You can check either with:

```
node --version
yarn --version
```

### Installing

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
yarn start
```

Open up a browser and navigate to: http://localhost:3001/. Hot reloading via `webpack` is enabled, so you'll see live updates in the browser during development.

### Development

All development should be done in the `/src` directory.

The `/demo` directory contains the demo application entry point `index.html` file, and mocks Avalon consuming the SME component.

If you'd like to try out a new development feature before merging your code into `master`, create a new branch, ie: `my-new-feature`, and push your branch to `https://github.com/avalonmediasystem/react-structural-metadata-editor`. See the [Deployment](#user-content-deployment) section below on how to import from either `master` or your own feature branch.

#### Component configuration

A consuming application is expected to provide the following configuration `props` passed to the SME component.

| prop              | type    | description                                                                                                                                                                                                                                                                                                                                                                                                                                          |     |     |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| `baseURL`         | string  | Base url where structured data, waveform data, and streaming files will be served from                                                                                                                                                                                                                                                                                                                                                               |     |     |
| `masterFileID`    | string  | Unique id of the work.                                                                                                                                                                                                                                                                                                                                                                                                                               |     |     |
| `initStructure`   | string  | When ingesting a new file in Avalon, the structure is not defined. In the legacy editor, they construct an XML with section title within the HTML code and pass that in. Similar to that, for SME we create a JSON object and pass it as `initStructure` as a prop. Othewise SME gets an empty structure, which it cannot work with. Because the app is built on the assumption the structure that's received from the back-end server is not empty. |     |     |
| `audioStreamURL`  | string  | Url of HLS audio stream file.                                                                                                                                                                                                                                                                                                                                                                                                                        |     |     |
| `withCredentials` | boolean | Value to pass through to [xhr.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) on the HLS stream request                                                                                                                                                                                                                                                                                            |     |     |

#### Example usage

```
const props = {
  baseURL: 'https://spruce.dlib.indiana.edu',
  masterFileID: 'sj1392061',
  initStructure: '',
  audioStreamURL:
    'https://spruce.dlib.indiana.edu/master_files/sj1392061/auto.m3u8'
};

<StructuralMetadataEditor {...props} />
```

### Commands

The following commands are available to the application via `npm scripts` located in the `package.json` file.

```
yarn clean
```

Cleans the output directory `dist`, ensuring a fresh copy of files when preparing your files for packaging.

```
yarn start
```

Starts the webpack development server in which you can view your work. http://localhost:3001/

```
yarn test
```

Runs the application's tests once, and provides a coverage report.

```
yarn test:watch
```

If you prefer to keep an open `watch` on your tests during development, run this command in a separate tab in your terminal/shell.

```
yarn transpile
```

This command prepares the SME React component for packaging and distribution. It moves packaged, transpiled files into the `/dist` directory. Run this command when you're happy with your development changes, before committing a branch which you wish to push to Github or import locally.

## Running the tests

To run the tests, with a full coverage report:

```
yarn test
```

To run tests in `watch` mode:

```
yarn test:watch
```

`Jest` is our testing framework, and we're in the process of incorporating `react-testing-library` https://github.com/testing-library/react-testing-library.

### Coding style tests

There is a `prettierrc` file with project coding style settings.

## Deployment

To create a new build package which can be imported by a consuming application, run:

```
yarn transpile
```

This will create a component package in the `/dist` folder which is ready to be imported by another application.

Currently we're installing the component through a GitHub repo instead of the NPM repository, so to import the default package into your application, run:

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
