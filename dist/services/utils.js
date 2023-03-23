"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setWaveformOptions = exports.getMimetype = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _waveformData = _interopRequireDefault(require("waveform-data"));

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


var setWaveformOptions = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(mediaInfo, peaksOptions) {
    var duration, src, isStream, alertStatus, wdJSON;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            duration = mediaInfo.duration, src = mediaInfo.src, isStream = mediaInfo.isStream;
            alertStatus = null; // for non-streaming shorter media files

            if (!(duration < 300 && !isStream)) {
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

  return function setWaveformOptions(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.setWaveformOptions = setWaveformOptions;