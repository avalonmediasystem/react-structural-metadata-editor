"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WAVEFORM_INITIALIZE_ERROR = exports.UNAUTHORIZED_ACCESS = exports.STREAM_MEDIA_ERROR = exports.SAVE_STRUCTURE_SUCCESS = exports.SAVE_STRUCTURE_FAIL = exports.PEAKSJS_REACHED_END_OF_FILE = exports.NO_MEDIA_MESSAGE = exports.NETWORK_ERROR = exports.MISSING_WAVEFORM_ERROR = exports.INVALID_SEGMENTS_WARNING = exports.FETCH_STRUCTURED_DATA_ERROR = exports.FETCH_MANIFEST_ERROR = void 0;
exports.configureAlert = configureAlert;
var UNAUTHORIZED_ACCESS = exports.UNAUTHORIZED_ACCESS = "You're not authorized to access this resource.";
var SAVE_STRUCTURE_SUCCESS = exports.SAVE_STRUCTURE_SUCCESS = 'Saved successfully.';
var SAVE_STRUCTURE_FAIL = exports.SAVE_STRUCTURE_FAIL = 'Failed to save structure successfully.';
var NETWORK_ERROR = exports.NETWORK_ERROR = 'Network error. Please try again.';
var FETCH_STRUCTURED_DATA_ERROR = exports.FETCH_STRUCTURED_DATA_ERROR = 'No structure information was found. Please check your Manifest.';
var WAVEFORM_INITIALIZE_ERROR = exports.WAVEFORM_INITIALIZE_ERROR = 'There was an error initializing the waveform. Please check your Manifest.';
var PEAKSJS_REACHED_END_OF_FILE = exports.PEAKSJS_REACHED_END_OF_FILE = 'There is no space available to insert a new timespan.';
var STREAM_MEDIA_ERROR = exports.STREAM_MEDIA_ERROR = 'There was an error retrieving the media stream.';
var MISSING_WAVEFORM_ERROR = exports.MISSING_WAVEFORM_ERROR = 'No available waveform data.';
var INVALID_SEGMENTS_WARNING = exports.INVALID_SEGMENTS_WARNING = 'Please check start/end times of the marked invalid timespan(s).';
var FETCH_MANIFEST_ERROR = exports.FETCH_MANIFEST_ERROR = 'Error fetching IIIF manifest.';
var NO_MEDIA_MESSAGE = exports.NO_MEDIA_MESSAGE = 'No available media. Editing structure is disabled.';

/**
 * Helper function which prepares a configuration object to feed the AlertContainer component
 * @param {number} status Code for response
 */
function configureAlert() {
  var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var alertObj = {
    alertStyle: 'danger'
  };
  if (status === 401) {
    alertObj.message = UNAUTHORIZED_ACCESS;
  } else if (status >= 200 && status < 300) {
    alertObj.alertStyle = 'success';
    alertObj.message = SAVE_STRUCTURE_SUCCESS;
    alertObj.delay = 2000;
    alertObj.type = 'SAVE_FEEDBACK';
  } else if (status === -2) {
    alertObj.message = FETCH_STRUCTURED_DATA_ERROR;
  } else if (status === -3) {
    alertObj.message = WAVEFORM_INITIALIZE_ERROR;
  } else if (status === -4) {
    alertObj.alertStyle = 'warning';
    alertObj.message = PEAKSJS_REACHED_END_OF_FILE;
  } else if (status === -6) {
    alertObj.message = STREAM_MEDIA_ERROR;
  } else if (status === -7) {
    alertObj.message = MISSING_WAVEFORM_ERROR;
    alertObj.persistent = true;
  } else if (status === -8) {
    alertObj.message = INVALID_SEGMENTS_WARNING;
    alertObj.alertStyle = 'warning';
  } else if (status == -9) {
    alertObj.message = FETCH_MANIFEST_ERROR;
  } else if (status == -10) {
    alertObj.message = SAVE_STRUCTURE_FAIL;
  } else if (status == -11) {
    alertObj.message = NO_MEDIA_MESSAGE;
  } else {
    alertObj.message = NETWORK_ERROR;
  }
  return alertObj;
}