import * as types from './types';
import Hls from 'hls.js';
import { v4 as uuidv4 } from 'uuid';;

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
  const id = uuidv4();
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
export const setStreamMediaError = (code) => ({
  type: types.STREAM_MEDIA_ERROR,
  payload: code,
});

export const streamMediaSuccess = () => ({
  type: types.STREAM_MEDIA_SUCCESS,
});

export const setStreamMediaLoading = (flag) => ({
  type: types.STREAM_MEDIA_LOADING,
  flag,
});

export function retrieveStreamMedia(audioFile, mediaPlayer, opts = {}) {
  return (dispatch, getState) => {
    if (Hls.isSupported()) {
      const config = {
        xhrSetup: function (xhr) {
          xhr.withCredentials = opts.withCredentials;
        },
        /*
          Sometimes captions/subtitles in Avalon fails to render and this makes
          HLS streaming to break resulting in a indefinite blocking loading spinner.
          Therefore, disable captions/subtitles rendering in HLS.js setup.
        */
        subtitleTrackController: null,
        enableWebVTT: false,
        enableIMSC1: false,
        enableCEA708Captions: false,
        renderTextTracksNatively: false
      };
      const hls = new Hls(config);

      const { state } = getState();
      // Bind media player
      hls.attachMedia(mediaPlayer);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(audioFile);
        // BUFFER_CREATED event is fired when fetching the media stream is successful
        hls.on(Hls.Events.BUFFER_CREATED, function () {
          hls.once(Hls.Events.BUFFER_APPENDED, function () {
            /**
             * Only set stream status as successful once BUFFER_APPENDED event is fired in HLS,
             * if state is not undefined. With the modal use in Avalon for SME, the component can
             * be unmounted by closing the modal before the async API requests and HLS buffer 
             * gets appended. And this makes the Redux state incosistent  when the SME modal is
             * opened next time making the re-initializing of Peaks.js to fail.
             * 
             * This starts the Peaks initialization, in which the presence of the player
             * is required.
             */
            if (state != undefined) { dispatch(streamMediaSuccess()); }
          });
        });
      });

      // ERROR event is fired when fetching media stream is not successful
      hls.on(Hls.Events.ERROR, function (event, data) {
        // When there are errors in the HLS build this block catches it and flashes
        // the warning message for a split second. The ErrorType for these errors is
        // OTHER_ERROR. Issue in HLS.js: https://github.com/video-dev/hls.js/issues/2435
        if (data.fatal) {
          dispatch(setStreamMediaLoading(1));
          if (data.type !== Hls.ErrorTypes.OTHER_ERROR) {
            switch (data.type) {
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log(
                  'TCL: forms action -> retrieveStreamMedia -> HLS:MEDIA_ERROR trying to recover:',
                  data
                );
                hls.recoverMediaError();
                dispatch(setStreamMediaLoading(1));
                break;
              default:
                // cannot recover
                hls.off(Hls.Events.ERROR);
                dispatch(setStreamMediaLoading(0));
                break;
            }
          } else {
            hls.off(Hls.Events.ERROR);
            dispatch(setStreamMediaLoading(0));
          }
        }
      });
    }
  };
}
