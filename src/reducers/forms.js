import * as types from '../actions/types';

const initialState = {
  editingDisabled: false,
  structureRetrieved: false,
  structureStatus: null,
  waveformRetrieved: false,
  streamMediaRetrieved: true
};

const forms = (state = initialState, action) => {
  switch (action.type) {
    case types.IS_EDITING_TIMESPAN:
      if (action.code === 1) {
        return Object.assign({}, state, {
          editingDisabled: true
        });
      }

      return Object.assign({}, state, {
        editingDisabled: false
      });

    case types.RETRIEVE_STRUCTURE_SUCCESS:
      return Object.assign({}, state, {
        structureRetrieved: true
      });

    case types.RETRIEVE_WAVEFORM_SUCCESS:
      return Object.assign({}, state, {
        waveformRetrieved: true
      });

    case types.HANDLE_STRUCTURE_ERROR:
      if (action.flag === 0) {
        return Object.assign({}, state, {
          structureStatus: null
        });
      } else {
        return Object.assign({}, state, {
          structureRetrieved: false,
          structureStatus: action.status
        });
      }

    case types.RETREIVE_STREAM_MEDIA_ERROR:
      return Object.assign({}, state, {
        streamMediaRetrieved: false
      });

    default:
      return state;
  }
};

export default forms;
