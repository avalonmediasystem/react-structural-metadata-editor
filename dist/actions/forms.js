"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveStreamMediaError = exports.handleStructureError = exports.retrieveWaveformSuccess = exports.retrieveStructureSuccess = exports.handleEditingTimespans = void 0;

var types = _interopRequireWildcard(require("./types"));

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

var retrieveStreamMediaError = function retrieveStreamMediaError() {
  return {
    type: types.RETREIVE_STREAM_MEDIA_ERROR
  };
};

exports.retrieveStreamMediaError = retrieveStreamMediaError;