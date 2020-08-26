export const UNAUTHORIZED_ACCESS =
  "You're not authorized to access this resource.";
export const MASTERFILE_NOT_FOUND = 'Requested data is not available.';
export const SAVED_MASTERFILE_SUCCESS = 'Saved successfully.';
export const NETWORK_ERROR = 'Network error. Please try again.';
export const FETCH_STRUCTURED_DATA_ERROR =
  'There was an error retrieving the structure information.';
export const WAVEFORM_INITIALIZE_ERROR =
  'There was an error initializing the waveform.';
export const PEAKSJS_REACHED_END_OF_FILE =
  'There is no space available to insert a new timespan.';
export const STREAM_MEDIA_ERROR =
  'There was an error retrieving the media stream.';
export const MISSING_WAVEFORM_ERROR =
  'Requested waveform data is not available.';

/**
 * Helper function which prepares a configuration object to feed the AlertContainer component
 * @param {number} status Code for response
 * @param {function} clearAlert A function defined in the hosting component to clear the alert object in component's state
 */
export function configureAlert(status = 0, clearAlert) {
  let alertObj = { alertStyle: 'danger', clearAlert };

  if (status === 401) {
    alertObj.message = UNAUTHORIZED_ACCESS;
  } else if (status === 404) {
    alertObj.message = MASTERFILE_NOT_FOUND;
  } else if (status >= 200 && status < 300) {
    alertObj.alertStyle = 'success';
    alertObj.message = SAVED_MASTERFILE_SUCCESS;
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
  } else {
    alertObj.message = NETWORK_ERROR;
  }
  return alertObj;
}
