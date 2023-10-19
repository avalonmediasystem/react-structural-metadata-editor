import * as types from './types';
import Hls from 'hls.js';
import uuidv1 from 'uuid/v1';

/**
 * Enable/disable other editing actions when editing a list item
 * @param {Integer} code - choose from; 1(true) | 0(false)
 */
export const handleEditingTimespans =
  (
    code,
    valid = true // assumes structure data is valid by default
  ) =>
  (dispatch) => {
    dispatch({ type: types.IS_EDITING_TIMESPAN, code });
    // Remove dismissible alerts when a CRUD action has been initiated
    // given editing is starting (code = 1) and structure is validated.
    if (code == 1 && valid) {
      dispatch(clearExistingAlerts());
    }
  };

export const setAlert = (alert) => (dispatch) => {
  const id = uuidv1();
  alert.id = id;
  dispatch({
    type: types.SET_ALERT,
    alert,
  });
  if (alert.delay > 0 && !alert.persistent) {
    setTimeout(() => dispatch(removeAlert(id)), alert.delay);
  }
};

export const removeAlert = (id) => ({
  type: types.REMOVE_ALERT,
  id,
});

export const clearExistingAlerts = () => ({
  type: types.CLEAR_EXISTING_ALERTS,
});

export const retrieveStructureSuccess = () => ({
  type: types.RETRIEVE_STRUCTURE_SUCCESS,
});

/**
 * Initially the structure status isSaved (true) and changed to false
 * when an edit action is performed on the structure
 * @param {Integer} code - choose from; 1(true -> saved) | 0(false -> not saved)
 */
export const updateStructureStatus = (code) => ({
  type: types.UPDATE_STRUCTURE_STATUS,
  payload: code,
});

export const retrieveWaveformSuccess = () => ({
  type: types.RETRIEVE_WAVEFORM_SUCCESS,
});

/**
 * Set the error status code for fetching structure.json in Redux
 * store. This status code is then used to create the alert.
 * @param {Integer} flag - choose from; 1(ture -> HTTP error occurred) |
 * 0(false ->No error). No error -> structureStatus is set to null
 * @param {Integer} status - HTTP error status code
 */
export const handleStructureError = (flag, status) => ({
  type: types.HANDLE_STRUCTURE_ERROR,
  flag,
  status,
});

/**
 * streamMediaError flag in redux store is set to true when Hls.js runs out
 * of retries and still cannot load the stream media
 * @param {Integer} code - choose from; 1(true -> failed) | 0(false -> success)
 */
export const streamMediaError = (code) => ({
  type: types.STREAM_MEDIA_ERROR,
  payload: code,
});

export const streamMediaSuccess = () => ({
  type: types.STREAM_MEDIA_SUCCESS,
});

export const setStreamMediaLoading = (flag) => ({
  type: types.STREAM_MEDIA_LOADING,
  flag,
})

export function retrieveStreamMedia(audioFile, mediaPlayer, opts = {}) {
  return (dispatch, getState) => {
    if (Hls.isSupported()) {
      const config = {
        xhrSetup: function (xhr) {
          xhr.withCredentials = opts.withCredentials;
        },
      };
      const hls = new Hls(config);

      // Bind media player
      hls.attachMedia(mediaPlayer);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(audioFile);
        // BUFFER_CREATED event is fired when fetching the media stream is successful
        hls.on(Hls.Events.BUFFER_CREATED, function () {
          dispatch(streamMediaSuccess());
        });
      });

      // ERROR event is fired when fetching media stream is not successful
      hls.on(Hls.Events.ERROR, function (event, data) {
        dispatch(setStreamMediaLoading(1));
        // When there are errors in the HLS build this block catches it and flashes
        // the warning message for a split second. The ErrorType for these errors is
        // OTHER_ERROR. Issue in HLS.js: https://github.com/video-dev/hls.js/issues/2435
        if(data.type === Hls.ErrorTypes.NETWORK_ERROR && 
            (data.frag?.type === "subtitle" && data.response?.code === 404)) {
          // When captions fragment fetching fails set streamMediaLoading=true
          // and exit event handler
          dispatch(streamMediaSuccess(0));
          hls.off(Hls.Events.ERROR);
          return;
        } else if (data.fatal && data.type !== Hls.ErrorTypes.OTHER_ERROR) {
          console.log(
            'TCL: forms action -> retrieveStreamMedia -> error',
            data
          );
          dispatch(streamMediaError(-6));
        } else if(data.levelRetry) {
          // Check if HLS.js is still trying to fetch stream
          dispatch(setStreamMediaLoading(1));
        } else {
          dispatch(setStreamMediaLoading(0));
        }
      });
    }
  };
}
