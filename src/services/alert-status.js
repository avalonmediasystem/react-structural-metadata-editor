export const UNAUTHORIZED_ACCESS =
  "You're not authorized to access this resource.";
export const SAVE_STRUCTURE_SUCCESS = 'Saved successfully.';
export const SAVE_STRUCTURE_FAIL = 'Failed to save structure successfully.';
export const NETWORK_ERROR = 'Network error. Please try again.';
export const FETCH_STRUCTURED_DATA_ERROR =
  'No structure information was found. Please check your Manifest.';
export const WAVEFORM_INITIALIZE_ERROR =
  'There was an error initializing the waveform. Please check your Manifest.';
export const PEAKSJS_REACHED_END_OF_FILE =
  'There is no space available to insert a new timespan.';
export const STREAM_MEDIA_ERROR =
  'There was an error retrieving the media stream.';
export const MISSING_WAVEFORM_ERROR =
  'No available waveform data.';
export const INVALID_SEGMENTS_WARNING =
  'Please check start/end times of the marked invalid timespan(s).';
export const FETCH_MANIFEST_ERROR = 'Error fetching IIIF manifest.';

/**
 * Helper function which prepares a configuration object to feed the AlertContainer component
 * @param {number} status Code for response
 */
export function configureAlert(status = 0) {
  let alertObj = { alertStyle: 'danger' };

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
  } else {
    alertObj.message = NETWORK_ERROR;
  }
  return alertObj;
}
