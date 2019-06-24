"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redux = require("redux");

var _forms = _interopRequireDefault(require("./forms"));

var _smData = _interopRequireDefault(require("./sm-data"));

var _peaksInstance = _interopRequireDefault(require("./peaks-instance"));

var types = _interopRequireWildcard(require("../actions/types"));

var appReducer = (0, _redux.combineReducers)({
  forms: _forms["default"],
  structuralMetadata: _smData["default"],
  peaksInstance: _peaksInstance["default"]
});

var rootReducer = function rootReducer(state, action) {
  if (action.type === types.RESET_STORE) {
    // Reducers return initial state when they are called with 'undefined'
    state = undefined;
  }

  return appReducer(state, action);
};

var _default = rootReducer;
exports["default"] = _default;