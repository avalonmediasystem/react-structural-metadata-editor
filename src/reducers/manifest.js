import * as types from '../actions/types';

const initialState = {
  manifest: null,
  manifestError: null,
  manifestFetched: false,
  mediaInfo: {
    src: '',
    duration: 0,
    isStream: false,
    isVideo: false,
  }
};

const manifest = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_MANIFEST:
      return { ...state, manifest: action.manifest };

    case types.FETCH_MANIFEST_SUCCESS:
      return { ...state, manifestFetched: true };

    case types.FETCH_MANIFEST_ERROR:
      return { ...state, manifestError: action.flag === 0 ? null : action.status, };

    case types.SET_MANIFEST_MEDIAINFO:
      return {
        ...state, mediaInfo: {
          ...state.mediaInfo,
          src: action.src,
          duration: action.duration,
          isStream: action.isStream,
          isVideo: action.isVideo,
        }
      };

    default:
      return state;
  }
};

export default manifest;
