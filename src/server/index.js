/**
 * Server implemented with Express.js, a backend web application
 * framework for Node.js. This serves the content required to render
 * the demo application used for development and production using Heroku.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const webpackConfig = require('../../webpack.config');

const PORT = process.env.PORT || 3001;

const app = express();

// Add hot reloading into the Node.js server
const compiler = webpack(webpackConfig);
app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);
app.use(require('webpack-hot-middleware')(compiler));

// When you navigate to the root page, use the built React components
const buildPath = path.join(__dirname, '../../demo/dist');
const htmlFile = path.join(__dirname, '../../demo/src/index.html');

app.use(express.static(buildPath));

// Middleware to extract incoming data for POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(htmlFile);
});

app.get('/structure.json', (req, res) => {
  res.header('Content-Type', 'application/json');
  let structure;
  try {
    structure = fs.readFileSync(
      path.join(__dirname, 'assets', 'structure.json'),
      'utf-8'
    );
  } catch (err) {
    console.error('Server -> Error fetching structure -> ', err);
  }
  res.send(structure);
});

app.get('/waveform.json', (req, res) => {
  res.header('Content-Type', 'application/json');
  let waveform;
  try {
    waveform = fs.readFileSync(
      path.join(__dirname, 'assets', 'waveform.json'),
      'utf-8'
    );
  } catch (err) {
    console.error('Server -> Error fetching waveform -> ', err);
  }
  res.send(waveform);
});

app.get('/media.mp4', (req, res) => {
  res.header('Content-Type', 'video/mp4');
  res.sendFile(path.join(__dirname, 'assets', 'media.mp4'));
});

app.post('/structure.json', (req, res) => {
  const newStructure = req.body.json;
  const cleanedStruct = cleanStructure(newStructure);
  try {
    fs.writeFileSync(
      path.join(__dirname, 'assets', 'structure.json'),
      JSON.stringify(cleanedStruct)
    );
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Success');
  } catch (err) {
    console.error('Server -> Error saving structure -> ', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

/** Server utility functions */
// Clean-up structure before saving to file
const cleanStructure = (struct) => {
  let formatItems = (items) => {
    for (let item of items) {
      delete item.valid;
      delete item.id;
      if (item.items) {
        formatItems(item.items);
      }
    }
  };

  formatItems([struct]);
  return struct;
};
