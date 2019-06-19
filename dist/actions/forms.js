"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveStreamMedia = retrieveStreamMedia;
exports.streamMediaSuccess = exports.streamMediaError = exports.streamMediaLoading = exports.handleStructureError = exports.retrieveWaveformSuccess = exports.retrieveStructureSuccess = exports.handleEditingTimespans = void 0;

var types = _interopRequireWildcard(require("./types"));

var _hls = _interopRequireDefault(require("hls.js"));

var handleEditingTimespans = function handleEditingTimespans(code) {
  return {
    type: types.IS_EDITING_TIMESPAN,
    code: code
  };
};

exports.handleEditingTimespans = handleEditingTimespans;

var retrieveStructureSuccess = function retrieveStructureSuccess() {
  return {
    type: types.RETRIEVE_STRUCTURE_SUCCESS
  };
};

exports.retrieveStructureSuccess = retrieveStructureSuccess;

var retrieveWaveformSuccess = function retrieveWaveformSuccess() {
  return {
    type: types.RETRIEVE_WAVEFORM_SUCCESS
  };
};

exports.retrieveWaveformSuccess = retrieveWaveformSuccess;

var handleStructureError = function handleStructureError(flag, status) {
  return {
    type: types.HANDLE_STRUCTURE_ERROR,
    flag: flag,
    status: status
  };
};

exports.handleStructureError = handleStructureError;

var streamMediaLoading = function streamMediaLoading(code) {
  return {
    type: types.STREAM_MEDIA_LOADING,
    payload: code
  };
};

exports.streamMediaLoading = streamMediaLoading;

var streamMediaError = function streamMediaError(code) {
  return {
    type: types.STREAM_MEDIA_ERROR,
    payload: code
  };
};

exports.streamMediaError = streamMediaError;

var streamMediaSuccess = function streamMediaSuccess() {
  return {
    type: types.STREAM_MEDIA_SUCCESS
  };
};

exports.streamMediaSuccess = streamMediaSuccess;

function retrieveStreamMedia(audioFile, mediaPlayer) {
  return function (dispatch, getState) {
    if (_hls["default"].isSupported()) {
      var hls = new _hls["default"]();
      dispatch(streamMediaLoading(-5)); // Bind media player

      hls.attachMedia(mediaPlayer.current); // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready

      hls.on(_hls["default"].Events.MEDIA_ATTACHED, function () {
        hls.loadSource(audioFile); // BUFFER_CREATED event is fired when fetching the media stream is successful

        hls.on(_hls["default"].Events.BUFFER_CREATED, function () {
          dispatch(streamMediaSuccess());
        });
      }); // ERROR event is fired when fetching media stream is not successful

      hls.on(_hls["default"].Events.ERROR, function (event, data) {
        var errorCode = null;

        if (data.fatal) {
          if (data.response !== undefined) {
            var status = data.response.code;
            status === 0 ? errorCode = -6 : errorCode = status;
          } else {
            errorCode = -6;
          }

          dispatch(streamMediaError(errorCode));
        }
      });
    }
  };
}