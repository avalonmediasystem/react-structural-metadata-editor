"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveWaveformSuccess = exports.retrieveStructureSuccess = exports.handleEditingTimespans = void 0;

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