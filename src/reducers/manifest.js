import * as types from '../actions/types';

const initialState = {
  manifest: null,
  manifestError: null,
  manifestFetched: false,
  manifestStructure: null,
  manifestMedia: {
    mediaSrc: '',
    mediaDuration: 0,
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
        ...state, manifestMedia: {
          ...state.manifestMedia,
          mediaSrc: action.mediaSrc,
          mediaDuration: action.duration
        }
      };

    case types.SET_MANIFEST_STRUCTURE:
      return { ...state, manifestStructure: action.structure };

    default:
      return state;
  }
};

export default manifest;
