"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMimetype = exports.getMediaExtension = exports.createEmptyWaveform = exports.MimeTyeps = void 0;

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
exports.MimeTyeps = MimeTyeps;

var getMediaExtension = function getMediaExtension(url) {
  if (typeof url === 'string') {
    var urlSplit = url.split('.');

    if (urlSplit) {
      return urlSplit.pop().toLowerCase();
    }
  }

  return '';
};

exports.getMediaExtension = getMediaExtension;

var getMimetype = function getMimetype() {
  var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var ext = getMediaExtension(src);
  return MimeTyeps[ext] || '';
};
/**
 * Create a dummy waveform dataset for the duration of the media file
 * This is used when a waveform is not specified in the manifest OR the
 * duration of the media file is longer than 10 minutes.
 * Waveform data calculation formula reference:
 * https://github.com/avalonmediasystem/avalon/blob/main/app/services/waveform_service.rb#L48-L72
 * @param {Number} duration of the media file in the manifest
 * @returns {Object} JSON object containing dummy waveform data
 */


exports.getMimetype = getMimetype;

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

exports.createEmptyWaveform = createEmptyWaveform;