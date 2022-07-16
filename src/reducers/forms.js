import * as types from '../actions/types';

const initialState = {
  editingDisabled: false,
  waveformRetrieved: false,
  streamInfo: {
    streamMediaError: false,
    streamMediaLoading: true,
    streamMediaStatus: null,
  },
  alerts: [],
  structureInfo: {
    structureError: null,
    structureSaved: true,
  },
};

const forms = (state = initialState, action) => {
  switch (action.type) {
    case types.IS_EDITING_TIMESPAN:
      return Object.assign({}, state, {
        editingDisabled: action.code === 1 ? true : false,
      });

    case types.RETRIEVE_WAVEFORM_SUCCESS:
      return Object.assign({}, state, {
        waveformRetrieved: true,
      });

    case types.HANDLE_STRUCTURE_ERROR:
      return Object.assign({}, state, {
        structureInfo: Object.assign({}, state.structureInfo, {
          structureError: action.flag === 0 ? null : action.status,
        }),
      });

    case types.STREAM_MEDIA_ERROR:
      return Object.assign({}, state, {
        streamInfo: Object.assign({}, state.streamInfo, {
          streamMediaLoading: false,
          streamMediaError: true,
          streamMediaStatus: action.payload,
        }),
      });

    case types.STREAM_MEDIA_SUCCESS:
      return Object.assign({}, state, {
        streamInfo: Object.assign({}, state.streamInfo, {
          streamMediaLoading: false,
          streamMediaStatus: null,
          streamMediaError: false,
        }),
      });

    case types.UPDATE_STRUCTURE_STATUS:
      return Object.assign({}, state, {
        structureInfo: Object.assign({}, state.structureInfo, {
          structureSaved: action.payload === 1 ? true : false,
        }),
      });

    case types.SET_ALERT:
      return Object.assign({}, state, {
        alerts: [...state.alerts, action.alert],
      });

    case types.REMOVE_ALERT:
      return Object.assign({}, state, {
        alerts: state.alerts.filter((a) => a.id != action.id),
        editingDisabled: false,
      });

    case types.CLEAR_EXISTING_ALERTS:
      return Object.assign({}, state, {
        alerts: state.alerts.filter((a) => a.persistent),
      });

    default:
      return state;
  }
};

export default forms;
