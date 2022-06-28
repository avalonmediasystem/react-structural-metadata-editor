"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Server implemented with Express.js, a backend web application
 * framework for Node.js. This serves the content required to render
 * the demo application used for development and production using Heroku.
 */
var express = require('express');

var path = require('path');

var fs = require('fs');

var bodyParser = require('body-parser');

var webpack = require('webpack');

var webpackConfig = require('../../webpack.config');

var PORT = process.env.PORT || 3001;
var app = express(); // Add hot reloading into the Node.js server

var compiler = webpack(webpackConfig);
app.use(require('webpack-dev-middleware')(compiler, {
  // noInfo: true,
  publicPath: webpackConfig.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler)); // When you navigate to the root page, use the built React components

var buildPath = path.join(__dirname, '../../demo/dist');
var htmlFile = path.join(__dirname, '../../demo/src/index.html');
app.use(express["static"](buildPath)); // Middleware to extract incoming data for POST requests

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.get('/', function (req, res) {
  res.sendFile(htmlFile);
});
app.get('/structure.json', function (req, res) {
  res.header('Content-Type', 'application/json');
  var structure;

  try {
    structure = fs.readFileSync(path.join(__dirname, 'assets', 'structure.json'), 'utf-8');
  } catch (err) {
    console.error('Server -> Error fetching structure -> ', err);
  }

  res.send(structure);
});
app.get('/waveform.json', function (req, res) {
  res.header('Content-Type', 'application/json');
  var waveform;

  try {
    waveform = fs.readFileSync(path.join(__dirname, 'assets', 'waveform.json'), 'utf-8');
  } catch (err) {
    console.error('Server -> Error fetching waveform -> ', err);
  }

  res.send(waveform);
});
app.get('/media.mp4', function (req, res) {
  res.header('Content-Type', 'video/mp4');
  res.sendFile(path.join(__dirname, 'assets', 'media.mp4'));
});
app.post('/structure.json', function (req, res) {
  var newStructure = req.body.json;
  var cleanedStruct = cleanStructure(newStructure);

  try {
    fs.writeFileSync(path.join(__dirname, 'assets', 'structure.json'), JSON.stringify(cleanedStruct));
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end('Success');
  } catch (err) {
    console.error('Server -> Error saving structure -> ', err);
    res.writeHead(500, {
      'Content-Type': 'text/html'
    });
    res.end('Error');
  }
});
app.listen(PORT, function () {
  console.log("Server listening on ".concat(PORT));
});
/** Server utility functions */
// Clean-up structure before saving to file

var cleanStructure = function cleanStructure(struct) {
  var formatItems = function formatItems(items) {
    var _iterator = _createForOfIteratorHelper(items),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        delete item.valid;
        delete item.id;

        if (item.items) {
          formatItems(item.items);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  formatItems([struct]);
  return struct;
};