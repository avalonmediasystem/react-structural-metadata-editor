"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _Slider = _interopRequireDefault(require("@material-ui/lab/Slider"));

var _VolumeUp = _interopRequireDefault(require("@material-ui/icons/VolumeUp"));

var _VolumeOff = _interopRequireDefault(require("@material-ui/icons/VolumeOff"));

var _styles = require("@material-ui/core/styles");

var _core = require("@material-ui/core");

var _colorManipulator = require("@material-ui/core/styles/colorManipulator");

var _reactBootstrap = require("react-bootstrap");

/**
 * NOTE:
 * The logic of turning on/off volume in this module is taken from,
 * https://github.com/digirati-co-uk/timeliner/blob/master/src/components/VolumeSliderCompact/VolumeSliderCompact.js
 *
 */
var useStyles = (0, _styles.makeStyles)({
  root: {
    width: 200,
    padding: 20
  }
});
var StyledSlider = (0, _styles.withStyles)({
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#000',
    border: '2px solid #000',
    '&$focused, &:hover': {
      boxShadow: "0px 0px 0px ".concat(8, "px ", (0, _colorManipulator.fade)('#000', 0.16))
    },
    '&$activated': {
      boxShadow: "0px 0px 0px ".concat(8 * 1.5, "px ").concat((0, _colorManipulator.fade)('#000', 0.16))
    },
    '&$jumped': {
      boxShadow: "0px 0px 0px ".concat(8 * 1.5, "px ").concat((0, _colorManipulator.fade)('#000', 0.16))
    }
  },
  track: {
    backgroundColor: '#000',
    height: 2,
    "float": 'left'
  },
  trackAfter: {
    backgroundColor: '#787D81'
  },
  focused: {},
  activated: {},
  jumped: {}
})(_Slider["default"]);

function VolumeSlider(props) {
  var SPEAKER_ICON_SIZE = {
    width: 20,
    height: 20
  };
  var classes = useStyles();

  var _React$useState = _react["default"].useState(100),
      _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
      prevValue = _React$useState2[0],
      setPrevValue = _React$useState2[1];

  var handleChange = function handleChange(e, value) {
    setPrevValue(value);
    props.setVolume(value);
  };

  var onToggle = function onToggle() {
    var volume = props.volume,
        setVolume = props.setVolume;

    if (volume === 0) {
      setVolume(prevValue);
    } else {
      setPrevValue(volume);
      setVolume(0);
    }
  };

  return _react["default"].createElement(_core.Paper, {
    className: classes.root
  }, _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
    xs: 1,
    md: 1
  }, _react["default"].createElement("div", {
    onClick: onToggle,
    style: {
      margin: -9
    }
  }, props.volume === 0 ? _react["default"].createElement(_VolumeOff["default"], {
    style: (0, _objectSpread2["default"])({}, SPEAKER_ICON_SIZE, {
      transform: 'translateX(1px)'
    })
  }) : _react["default"].createElement(_VolumeUp["default"], {
    style: (0, _objectSpread2["default"])({}, SPEAKER_ICON_SIZE, {
      transform: 'translateX(1px)'
    })
  }))), _react["default"].createElement(_reactBootstrap.Col, {
    xs: 10,
    md: 10
  }, _react["default"].createElement(StyledSlider, {
    value: props.volume,
    onChange: handleChange
  }))));
}

var _default = VolumeSlider;
exports["default"] = _default;