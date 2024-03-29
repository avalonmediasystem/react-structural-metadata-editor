"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMimetype = exports.buildWaveformOpt = void 0;
exports.parseAnnotations = parseAnnotations;
exports.readAnnotations = readAnnotations;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _waveformData = _interopRequireDefault(require("waveform-data"));

var _manifesto = require("manifesto.js");

var MimeTyeps = {
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL'
};

var getMediaExtension = function getMediaExtension(url) {
  if (typeof url === 'string') {
    var urlSplit = url.split('.');

    if (urlSplit) {
      return urlSplit.pop().toLowerCase();
    }
  }

  return '';
};

var getMimetype = function getMimetype() {
  var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var ext = getMediaExtension(src);
  return MimeTyeps[ext] || '';
};
/**
 * Generate waveform data for media files using waveform-data
 * library
 * @param {String} src URL of the media file
 * @returns {Object} JSON object containing waveform data
 */


exports.getMimetype = getMimetype;

var generateWaveformData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(src) {
    var waveformJSON;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            waveformJSON = fetch(src).then(function (response) {
              return response.arrayBuffer();
            }).then(function (buffer) {
              var audioContext = new AudioContext();
              var options = {
                audio_context: audioContext,
                array_buffer: buffer,
                scale: 512
              };
              return new Promise(function (resolve, reject) {
                _waveformData["default"].createFromAudio(options, function (err, waveform) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(waveform);
                  }
                });
              });
            }).then(function (waveform) {
              return waveform.toJSON();
            });
            return _context.abrupt("return", waveformJSON);

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function generateWaveformData(_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Create a dummy waveform dataset for the duration of the media file
 * This is used when a waveform is not specified in the manifest OR the
 * duration of the media file is longer than 10 minutes.
 * Waveform data calculation formula reference:
 * https://github.com/avalonmediasystem/avalon/blob/main/app/services/waveform_service.rb#L48-L72
 * @param {Number} duration of the media file in the manifest
 * @returns {Object} JSON object containing dummy waveform data
 */


var createEmptyWaveform = function createEmptyWaveform(duration) {
  var maxPeak = 1.0,
      minPeak = -1.0;
  var sampleRate = 44100;
  var samplesPerPixel = 512; // lowest default zoom level

  var waveformLength = 2 * Math.ceil(sampleRate * duration / samplesPerPixel / 2);
  var waveformData = [];

  for (var i = 0; i < waveformLength; i++) {
    var dataPoints = [Math.random() * (minPeak - maxPeak + minPeak), Math.random() * (maxPeak - minPeak + maxPeak)];
    waveformData.push(Math.min.apply(Math, dataPoints));
    waveformData.push(Math.max.apply(Math, dataPoints));
  }

  var waveform_json = {
    sample_rate: sampleRate,
    bits: 8,
    length: waveformLength,
    samples_per_pixel: samplesPerPixel,
    data: waveformData
  };

  var waveformJSON = _waveformData["default"].create(waveform_json).toJSON();

  return waveformJSON;
};
/**
 * Set relevant waveform data options for Peaks instance creation
 * @param {Object} mediaInfo src, duration, and media type information
 * @param {Object} peaksOptions existign options for Peaks instantiation
 * @returns {Object}
 */


var buildWaveformOpt = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(mediaInfo, peaksOptions) {
    var duration, src, isStream, alertStatus, wdJSON;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            duration = mediaInfo.duration, src = mediaInfo.src, isStream = mediaInfo.isStream;
            alertStatus = null; // for non-streaming shorter media files

            if (!(duration < 300 && isStream === false && (src === null || src === void 0 ? void 0 : src.length) > 0)) {
              _context2.next = 9;
              break;
            }

            _context2.next = 5;
            return generateWaveformData(src);

          case 5:
            wdJSON = _context2.sent;
            peaksOptions.waveformData = {
              json: wdJSON
            };
            _context2.next = 11;
            break;

          case 9:
            peaksOptions.waveformData = {
              json: createEmptyWaveform(duration)
            };
            alertStatus = -7;

          case 11:
            return _context2.abrupt("return", {
              opts: peaksOptions,
              alertStatus: alertStatus
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function buildWaveformOpt(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();
/* 
  IIIF Manifest parsing code adapted from Ramp: 
  https://github.com/samvera-labs/ramp/blob/main/src/services/iiif-parser.js
*/


exports.buildWaveformOpt = buildWaveformOpt;

function readAnnotations(_ref3) {
  var manifest = _ref3.manifest,
      canvasIndex = _ref3.canvasIndex,
      key = _ref3.key,
      motivation = _ref3.motivation;

  var _getAnnotations = getAnnotations({
    manifest: manifest,
    canvasIndex: canvasIndex,
    key: key,
    motivation: motivation
  }),
      annotations = _getAnnotations.annotations,
      duration = _getAnnotations.duration;

  return getResourceItems(annotations, duration);
}
/**
 * Extract list of Annotations from `annotations`/`items`
 * under the canvas with the given motivation
 * @param {Object} obj
 * @param {Object} obj.manifest IIIF manifest
 * @param {Number} obj.canvasIndex curent canvas's index
 * @param {String} obj.key property key to pick
 * @param {String} obj.motivation
 * @returns {Array} array of AnnotationPage
 */


function getAnnotations(_ref4) {
  var manifest = _ref4.manifest,
      canvasIndex = _ref4.canvasIndex,
      key = _ref4.key,
      motivation = _ref4.motivation;
  var annotations = []; // When annotations are at canvas level

  try {
    var annotationPage = (0, _manifesto.parseManifest)(manifest).getSequences()[0].getCanvases()[canvasIndex];
    var duration = Number(annotationPage.getDuration()) || 0.0;

    if (annotationPage) {
      annotations = parseAnnotations(annotationPage.__jsonld[key], motivation);
    }

    return {
      annotations: annotations,
      duration: duration
    };
  } catch (error) {
    throw error;
  }
}
/**
 * Parse a list of annotations or a single annotation to extract details of a
 * given a Canvas. Assumes the annotation type as either painting or supplementing
 * @param {Array} annotations list of painting/supplementing annotations to be parsed
 * @param {Number} duration Canvas duration
 * @returns {Object} containing source, canvas targets
 */


function getResourceItems(annotations, duration) {
  var _annotations$0$getBod;

  var resources = [];

  if (!annotations || annotations.length === 0) {
    return {
      error: 'No resources found in Canvas',
      resources: resources,
      duration: duration
    };
  } // Multiple resource files on a single canvas
  else if (annotations.length > 1) {
    annotations.map(function (a, index) {
      var source = getResourceInfo(a.getBody()[0]);
      /**
       * TODO::
       * Is this pattern safe if only one of `source.length` or `track.length` is > 0?
       * For example, if `source.length` > 0 is true and `track.length` > 0 is false,
       * then sources and tracks would end up with different numbers of entries.
       * Is that okay or would that mess things up?
       * Maybe this is an impossible edge case that doesn't need to be worried about?
       */

      source.length > 0 && source[0].src && resources.push(source[0]);
    });
  } // Multiple Choices avalibale
  else if (((_annotations$0$getBod = annotations[0].getBody()) === null || _annotations$0$getBod === void 0 ? void 0 : _annotations$0$getBod.length) > 0) {
    var annoQuals = annotations[0].getBody();
    annoQuals.map(function (a) {
      var source = getResourceInfo(a); // Check if the parsed sources has a resource URL

      source.length > 0 && source[0].src && resources.push(source[0]);
    });
  } // No resources
  else {
    return {
      resources: resources,
      error: 'No resources found in Canvas',
      duration: duration
    };
  }

  return {
    resources: resources,
    duration: duration,
    error: ''
  };
}
/**
 * Parse source and track information related to media
 * resources in a Canvas
 * @param {Object} item AnnotationBody object from Canvas
 * @returns parsed source and track information
 */


function getResourceInfo(item) {
  var source = [];
  var label = undefined;

  if (item.getLabel().length === 1) {
    label = item.getLabel().getValue();
  } else if (item.getLabel().length > 1) {
    // If there are multiple labels, assume the first one
    // is the one intended for default display
    label = getLabelValue(item.getLabel()[0]._value);
  }

  var s = {
    src: item.id,
    key: item.id,
    type: item.getProperty('format'),
    kind: item.getProperty('type'),
    label: label || 'auto',
    value: item.getProperty('value') ? item.getProperty('value') : ''
  };
  source.push(s);
  return source;
}
/**
 * Parse json objects in the manifest into Annotations
 * @param {Array<Object>} annotations array of json objects from manifest
 * @param {String} motivation of the resources need to be parsed
 * @returns {Array<Object>} Array of Annotations
 */


function parseAnnotations(annotations, motivation) {
  var content = [];
  if (!annotations) return content; // should be contained in an AnnotationPage

  var annotationPage = null;

  if (annotations.length) {
    annotationPage = new _manifesto.AnnotationPage(annotations[0], {});
  }

  if (!annotationPage) {
    return content;
  }

  var items = annotationPage.getItems();
  if (items === undefined) return content;

  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    var annotation = new _manifesto.Annotation(a, {});
    var annoMotivation = annotation.getMotivation();

    if (annoMotivation == motivation) {
      content.push(annotation);
    }
  }

  return content;
}