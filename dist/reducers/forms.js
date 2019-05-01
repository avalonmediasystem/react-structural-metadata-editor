"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var types = _interopRequireWildcard(require("../actions/types"));

var initialState = {
  editingDisabled: false,
  structureRetrieved: false,
  waveformRetrieved: false
};

var forms = function forms() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case types.IS_EDITING_TIMESPAN:
      if (action.code === 0) {
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

    default:
      return state;
  }
};

var _default = forms;
exports["default"] = _default;