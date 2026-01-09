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
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
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