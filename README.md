# React Structural Metadata Editor

A React component which displays structural metadata about an ingested audio/video file, and displays a visualized waveform to help navigating sections of the audio waveform. A user can add, edit and delete headers and timespans within the structural metadata, and save the record into a consuming application.

See how this React component works on the [demo page](https://structural-metadata-editor.herokuapp.com/) hosted using [Heroku](https://www.heroku.com/). Please note that, sometimes this page takes time to load.

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

Open up a browser and navigate to: http://localhost:3001/. Hot reloading via `webpack-hot-middleware` is enabled for the Node.js server implemented with Express.js, so you'll see live updates in the browser during development.

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

Starts the Node.js server with the built ReactJS components via webpack, in which you can view your work. Open up the browser and navigate to http://localhost:3001/, where the component is rendered with the content served by the Node.js server.

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

#### Deploy to Heroku for Testing

To enable testing and experimenting with the component, the source code is deployed in a demo site hosted with Heroku. It uses Heroku Git to deploy from the GitHub repo.

After code changes have been made and they are merged into `main` branch, run the following commands from the terminal to deploy the latest code to the demo site;

1. Get the latest from remote to your local repo;

```
git pull origin
```

2. Checkout the `main` branch, where the latest reviewed code is available and it needs to be always deployed from this branch;

```
git checkout main
```

3. Create a `heroku` remote in your local repo for the app you wish to deploy to, here the app name is `structural-metadata-editor`. For this step you need a Heroku account and [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli) installed on your machine.

```
heroku git:remote -a structural-metadata-editor
```

This will prompt to login to your Heroku account, once logged in it will link the `heroku` remote to your app. And then running `git remote -v` should show a `heroku` remote as _heroku https://git.heroku.com/structural-metadata-editor.git_.

4. Push the `main` branch from your local repo to Heroku app's git repo's `main` branch;

```
git push heroku main:main
```

This will take some time while it builds and compiles the source code. And then it deploys the changes to https://structural-metadata-editor.herokuapp.com/.

## Usage

#### Deployment in Production

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
| `manifestURL`      | string   | URL of the `manifest.json` file on the server                                                                                                                                                                                                                                                                                                                                                                                                       | Required |
| `initStructure`    | string/JSON object   | When ingesting a new file in Avalon, the structure is not defined. In the legacy editor, they construct an XML with section title within the HTML code and pass that in. Similar to that, for SME we create a JSON object and pass it as `initStructure` as a prop. Othewise SME gets an empty structure, which it cannot work with. Because the app is built on the assumption the structure that's received from the back-end server is not empty | Required |

| `canvasIndex`   | number   | Index of the canvas relevant to the media resource in the Manifest. This has a default value of 0 in the component.                                                                                                                                                                                                                                                                                                                                                                                                       | Optional |
| `withCredentials`  | boolean  | Value to pass through to [xhr.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) on the HLS stream request                                                                                                                                                                                                                                                                                           | Optional |
| `structureIsSaved` | function | Function to keep track of the status of the structure changes in the editor                                                                                                                                                                                                                                                                                                                                                                         | Optional |

#### Example usage

```
const props = {
  structureURL: 'http://example.com/structure.json',
  manifestURL: 'http://example.com/manifest.json',
  initStructure: '',
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
