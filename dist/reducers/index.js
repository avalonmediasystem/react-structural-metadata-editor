"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _redux = require("redux");

var _forms = _interopRequireDefault(require("./forms"));

var _smData = _interopRequireDefault(require("./sm-data"));

var _peaksInstance = _interopRequireDefault(require("./peaks-instance"));

var types = _interopRequireWildcard(require("../actions/types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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