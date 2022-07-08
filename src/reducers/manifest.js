import * as types from '../actions/types';

const initialState = {
  manifest: null,
  manifestError: null,
  manifestFetched: false,
  structure: null,
  mediaInfo: {
    src: '',
    duration: 0,
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
          duration: action.duration
        }
      };

    case types.SET_MANIFEST_STRUCTURE:
      return { ...state, structure: action.structure };

    default:
      return state;
  }
};

export default manifest;
