"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var types = _interopRequireWildcard(require("../actions/types"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var initialState = {
  manifest: null,
  manifestError: null,
  manifestFetched: false,
  mediaInfo: {
    src: '',
    duration: 0,
    isStream: false,
    isVideo: false
  },
  waveformInfo: null
};
var manifest = function manifest() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case types.SET_MANIFEST:
      return _objectSpread(_objectSpread({}, state), {}, {
        manifest: action.manifest
      });
    case types.FETCH_MANIFEST_SUCCESS:
      return _objectSpread(_objectSpread({}, state), {}, {
        manifestFetched: true
      });
    case types.FETCH_MANIFEST_ERROR:
      return _objectSpread(_objectSpread({}, state), {}, {
        manifestError: action.flag === 0 ? null : action.status
      });
    case types.SET_MANIFEST_MEDIAINFO:
      return _objectSpread(_objectSpread({}, state), {}, {
        mediaInfo: _objectSpread(_objectSpread({}, state.mediaInfo), {}, {
          src: action.src,
          duration: action.duration,
          isStream: action.isStream,
          isVideo: action.isVideo
        })
      });
    case types.SET_CANVAS_WAVEFORMINFO:
      return _objectSpread(_objectSpread({}, state), {}, {
        waveformInfo: action.waveformUrl
      });
    default:
      return state;
  }
};
var _default = exports["default"] = manifest;