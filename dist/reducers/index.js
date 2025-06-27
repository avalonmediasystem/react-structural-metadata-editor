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
var _manifest = _interopRequireDefault(require("./manifest"));
var types = _interopRequireWildcard(require("../actions/types"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var appReducer = (0, _redux.combineReducers)({
  forms: _forms["default"],
  structuralMetadata: _smData["default"],
  peaksInstance: _peaksInstance["default"],
  manifest: _manifest["default"]
});
var rootReducer = function rootReducer(state, action) {
  if (action.type === types.RESET_STORE) {
    // Reducers return initial state when they are called with 'undefined'
    state = undefined;
  }
  return appReducer(state, action);
};
var _default = exports["default"] = rootReducer;