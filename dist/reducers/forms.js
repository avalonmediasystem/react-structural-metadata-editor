"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var types = _interopRequireWildcard(require("../actions/types"));

var initialState = {
  editingDisabled: false,
  waveformRetrieved: false,
  streamInfo: {
    streamMediaError: false,
    streamMediaLoading: true,
    streamMediaStatus: null
  },
  structureInfo: {
    structureRetrieved: false,
    structureStatus: null,
    structureSaved: true
  }
};

var forms = function forms() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

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
        structureInfo: Object.assign({}, state.structureInfo, {
          structureRetrieved: true
        })
      });

    case types.RETRIEVE_WAVEFORM_SUCCESS:
      return Object.assign({}, state, {
        waveformRetrieved: true
      });

    case types.HANDLE_STRUCTURE_ERROR:
      if (action.flag === 0) {
        return Object.assign({}, state, {
          structureInfo: Object.assign({}, state.structureInfo, {
            structureStatus: null
          })
        });
      } else {
        return Object.assign({}, state, {
          structureInfo: Object.assign({}, state.structureInfo, {
            structureStatus: action.status
          })
        });
      }

    case types.STREAM_MEDIA_ERROR:
      return Object.assign({}, state, {
        streamInfo: Object.assign({}, state.streamInfo, {
          streamMediaLoading: false,
          streamMediaError: true,
          streamMediaStatus: action.payload
        })
      });

    case types.STREAM_MEDIA_SUCCESS:
      return Object.assign({}, state, {
        streamInfo: Object.assign({}, state.streamInfo, {
          streamMediaLoading: false,
          streamMediaStatus: null,
          streamMediaError: false
        })
      });

    case types.UPDATE_STRUCTURE_STATUS:
      if (action.payload === 1) {
        return Object.assign({}, state, {
          structureInfo: Object.assign({}, state.structureInfo, {
            structureSaved: true
          })
        });
      } else {
        return Object.assign({}, state, {
          structureInfo: Object.assign({}, state.structureInfo, {
            structureSaved: false
          })
        });
      }

    default:
      return state;
  }
};

var _default = forms;
exports["default"] = _default;