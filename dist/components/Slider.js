"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Slider;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function Slider(_ref) {
  var setVolume = _ref.setVolume,
    volume = _ref.volume;
  var _useState = (0, _react.useState)(100),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    prevValue = _useState2[0],
    setPrevValue = _useState2[1];
  var sliderRef = (0, _react.useRef)(null);

  // Set the initial volume progress when the component mounts
  (0, _react.useEffect)(function () {
    updateVolumeProgress(volume);
  }, []);
  var handleChange = function handleChange(e) {
    updateVolumeProgress(e.target.value, e.target.max);
  };

  /**
   * Toggle volume between 0 and previous value when clicked on mute/unmute button
   */
  var onToggle = function onToggle() {
    if (volume == 0) {
      updateVolumeProgress(prevValue);
    } else {
      setPrevValue(volume);
      updateVolumeProgress(0);
    }
  };

  /**
   * Update volume in the parent component and set styling for the current
   * volume in the slider
   * @param {Number} value current value of the slider
   */
  var updateVolumeProgress = function updateVolumeProgress(value) {
    var progress = value / 100 * 100;
    sliderRef.current.style.background = "linear-gradient(to right, #000000 ".concat(progress, "%, #9d9d9d ").concat(progress, "%)");
    setVolume(value);
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "volume-slider"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    onClick: onToggle
  }, volume > 50 ? /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faVolumeHigh
  }) : volume == 0 ? /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faVolumeMute
  }) : /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faVolumeLow
  })), /*#__PURE__*/_react["default"].createElement("input", {
    type: "range",
    className: "volume-slider-range",
    min: "0",
    max: "100",
    value: volume,
    onChange: handleChange,
    ref: sliderRef
  }));
}