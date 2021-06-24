"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var types = _interopRequireWildcard(require("../actions/types"));

var initialState = {
  editingDisabled: false,
  waveformRetrieved: false,
  streamInfo: {
    streamMediaError: false,
    streamMediaLoading: true,
    streamMediaStatus: null
  },
  alerts: [],
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
      return Object.assign({}, state, {
        editingDisabled: action.code === 1 ? true : false
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
      return Object.assign({}, state, {
        structureInfo: Object.assign({}, state.structureInfo, {
          structureStatus: action.flag === 0 ? null : action.status
        })
      });

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
      return Object.assign({}, state, {
        structureInfo: Object.assign({}, state.structureInfo, {
          structureSaved: action.payload === 1 ? true : false
        })
      });

    case types.SET_ALERT:
      return Object.assign({}, state, {
        alerts: [].concat((0, _toConsumableArray2["default"])(state.alerts), [action.alert])
      });

    case types.REMOVE_ALERT:
      return Object.assign({}, state, {
        alerts: state.alerts.filter(function (a) {
          return a.id != action.id;
        }),
        editingDisabled: false
      });

    case types.INIT_CRUD_ACTION:
      return Object.assign({}, state, {
        alerts: state.alerts.filter(function (a) {
          return a.persistent;
        })
      });

    default:
      return state;
  }
};

var _default = forms;
exports["default"] = _default;