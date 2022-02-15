"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMimetype = exports.getMediaExtension = exports.MimeTyeps = void 0;
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

exports.getMimetype = getMimetype;