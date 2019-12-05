import * as types from './types';
import Hls from 'hls.js';

/**
 * Enable/disable other editing actions when editing a list item
 * @param {Integer} code - choose from; 1(true) | 0(false)
 */
export const handleEditingTimespans = code => ({
  type: types.IS_EDITING_TIMESPAN,
  code
});

export const retrieveStructureSuccess = () => ({
  type: types.RETRIEVE_STRUCTURE_SUCCESS
});

/**
 * Initially the structure status isSaved (true) and changed to false
 * when an edit action is performed on the structure
 * @param {Integer} code - choose from; 1(true -> saved) | 0(false -> not saved)
 */
export const updateStructureStatus = code => ({
  type: types.UPDATE_STRUCTURE_STATUS,
  payload: code
});

export const retrieveWaveformSuccess = () => ({
  type: types.RETRIEVE_WAVEFORM_SUCCESS
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
  status
});

/**
 * streamMediaError flag in redux store is set to true when Hls.js runs out
 * of retries and still cannot load the stream media
 * @param {Integer} code - choose from; 1(true -> failed) | 0(false -> success)
 */
export const streamMediaError = code => ({
  type: types.STREAM_MEDIA_ERROR,
  payload: code
});

export const streamMediaSuccess = () => ({
  type: types.STREAM_MEDIA_SUCCESS
});

export function retrieveStreamMedia(audioFile, mediaPlayer) {
  return (dispatch, getState) => {
    if (Hls.isSupported()) {
      const hls = new Hls();

      // Bind media player
      hls.attachMedia(mediaPlayer.current);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(Hls.Events.MEDIA_ATTACHED, function() {
        hls.loadSource(audioFile);
        // BUFFER_CREATED event is fired when fetching the media stream is successful
        hls.on(Hls.Events.BUFFER_CREATED, function() {
          dispatch(streamMediaSuccess());
        });
      });

      // ERROR event is fired when fetching media stream is not successful
      hls.on(Hls.Events.ERROR, function(event, data) {
        let errorCode = null;
        if (data.fatal) {
          if (data.response !== undefined) {
            const status = data.response.code;
            status === 0 ? (errorCode = -6) : (errorCode = status);
          } else {
            errorCode = -6;
          }
          dispatch(streamMediaError(errorCode));
        }
      });
    }
  };
}
