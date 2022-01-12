"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var types = _interopRequireWildcard(require("../actions/types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

    case types.CLEAR_EXISTING_ALERTS:
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