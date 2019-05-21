"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureAlert = configureAlert;
exports.FETCH_STREAM_MEDIA_ERROR = exports.PEAKSJS_REACHED_END_OF_FILE = exports.WAVEFORM_INITIALIZE_ERROR = exports.FETCH_STRUCTURED_DATA_ERROR = exports.NETWORK_ERROR = exports.SAVED_MASTERFILE_SUCCESS = exports.MASTERFILE_NOT_FOUND = exports.UNAUTHORIZED_ACCESS = void 0;
var UNAUTHORIZED_ACCESS = "You're not authorized to access this resource.";
exports.UNAUTHORIZED_ACCESS = UNAUTHORIZED_ACCESS;
var MASTERFILE_NOT_FOUND = 'Requested data not available.';
exports.MASTERFILE_NOT_FOUND = MASTERFILE_NOT_FOUND;
var SAVED_MASTERFILE_SUCCESS = 'Saved successfully.';
exports.SAVED_MASTERFILE_SUCCESS = SAVED_MASTERFILE_SUCCESS;
var NETWORK_ERROR = 'Network error. Please try again.';
exports.NETWORK_ERROR = NETWORK_ERROR;
var FETCH_STRUCTURED_DATA_ERROR = 'There was an error retrieving the structure information.';
exports.FETCH_STRUCTURED_DATA_ERROR = FETCH_STRUCTURED_DATA_ERROR;
var WAVEFORM_INITIALIZE_ERROR = 'There was an error initializing the waveform.';
exports.WAVEFORM_INITIALIZE_ERROR = WAVEFORM_INITIALIZE_ERROR;
var PEAKSJS_REACHED_END_OF_FILE = 'There is no space available to insert a new timespan.';
exports.PEAKSJS_REACHED_END_OF_FILE = PEAKSJS_REACHED_END_OF_FILE;
var FETCH_STREAM_MEDIA_ERROR = 'There was an error retrieving the media stream.';
/**
 * Helper function which prepares a configuration object to feed the AlertContainer component
 * @param {number} status Code for response
 * @param {function} clearAlert A function defined in the hosting component to clear the alert object in component's state
 */

exports.FETCH_STREAM_MEDIA_ERROR = FETCH_STREAM_MEDIA_ERROR;

function configureAlert() {
  var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var clearAlert = arguments.length > 1 ? arguments[1] : undefined;
  var alertObj = {
    alertStyle: 'danger',
    clearAlert: clearAlert
  };

  if (status === 401) {
    alertObj.message = UNAUTHORIZED_ACCESS;
  } else if (status === 404) {
    alertObj.message = MASTERFILE_NOT_FOUND;
  } else if (status >= 200 && status < 300) {
    alertObj.alertStyle = 'success';
    alertObj.message = SAVED_MASTERFILE_SUCCESS;
  } else if (status === -2) {
    alertObj.message = FETCH_STRUCTURED_DATA_ERROR;
  } else if (status === -3) {
    alertObj.message = WAVEFORM_INITIALIZE_ERROR;
  } else if (status === -4) {
    alertObj.alertStyle = 'warning';
    alertObj.message = PEAKSJS_REACHED_END_OF_FILE;
  } else if (status === -5) {
    alertObj.message = FETCH_STREAM_MEDIA_ERROR;
  } else {
    alertObj.message = NETWORK_ERROR;
  }

  return alertObj;
}