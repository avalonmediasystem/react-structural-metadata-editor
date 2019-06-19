import * as types from './types';
import Hls from 'hls.js';

export const handleEditingTimespans = code => ({
  type: types.IS_EDITING_TIMESPAN,
  code
});

export const retrieveStructureSuccess = () => ({
  type: types.RETRIEVE_STRUCTURE_SUCCESS
});

export const retrieveWaveformSuccess = () => ({
  type: types.RETRIEVE_WAVEFORM_SUCCESS
});

export const handleStructureError = (flag, status) => ({
  type: types.HANDLE_STRUCTURE_ERROR,
  flag,
  status
});

export const streamMediaLoading = code => ({
  type: types.STREAM_MEDIA_LOADING,
  payload: code
});

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

      dispatch(streamMediaLoading(-5));

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
