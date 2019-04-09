'use strict';

exports.__esModule = true;
exports.configureAlert = configureAlert;
var UNAUTHORIZED_ACCESS = exports.UNAUTHORIZED_ACCESS = 'Unauthorized to access the masterfile';
var MASTERFILE_NOT_FOUND = exports.MASTERFILE_NOT_FOUND = 'Requested masterfile not found';
var SAVED_MASTERFILE_SUCCESS = exports.SAVED_MASTERFILE_SUCCESS = 'Successfully saved to masterfile';
var NETWORK_ERROR = exports.NETWORK_ERROR = 'Network error, please try again';
var FETCH_STRUCTURED_DATA_ERROR = exports.FETCH_STRUCTURED_DATA_ERROR = 'There was an error fetching the Structured Metadata from server';
var PEAKJS_INITIALIZE_ERROR = exports.PEAKJS_INITIALIZE_ERROR = 'There was an error initializing the PeakJS waveform';
var PEAKSJS_REACHED_END_OF_FILE = exports.PEAKSJS_REACHED_END_OF_FILE = 'Time ahead has timespans reaching the end of media file, there is no available time to insert a new timespan';

/**
 * Helper function which prepares a configuration object to feed the AlertContainer component
 * @param {number} status Code for response
 * @param {function} clearAlert A function defined in the hosting component to clear the alert object in component's state
 */
function configureAlert(status, clearAlert) {
  var alertObj = { alertStyle: 'danger', clearAlert: clearAlert };

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
    alertObj.message = PEAKJS_INITIALIZE_ERROR;
  } else if (status === -4) {
    alertObj.alertStyle = 'warning';
    alertObj.message = PEAKSJS_REACHED_END_OF_FILE;
  } else {
    alertObj.message = NETWORK_ERROR;
  }
  return alertObj;
}