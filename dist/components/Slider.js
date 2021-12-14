"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = VolumeSlider;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _VolumeUp = _interopRequireDefault(require("@material-ui/icons/VolumeUp"));

var _VolumeOff = _interopRequireDefault(require("@material-ui/icons/VolumeOff"));

var _styles = require("@material-ui/core/styles");

var _core = require("@material-ui/core");

var _reactBootstrap = require("react-bootstrap");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var useStyles = (0, _styles.makeStyles)(function () {
  return {
    root: {
      width: 200,
      paddingLeft: 12,
      paddingTop: 5,
      paddingBottom: 5,
      paddingRight: 25
    }
  };
});
var StyledSlider = (0, _styles.withStyles)({
  root: {
    color: '#000',
    height: 1,
    marginLeft: 20
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#000',
    border: '2px solid #000',
    '&:focus,&:hover,&$active': {
      boxShadow: '#000'
    }
  },
  active: {},
  track: {
    height: 2,
    borderRadius: 4,
    backgroundColor: '#000'
  },
  rail: {
    height: 2,
    borderRadius: 4,
    backgroundColor: '#000'
  }
})(_core.Slider);

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

  return /*#__PURE__*/_react["default"].createElement(_core.Paper, {
    className: classes.root
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    xs: 2,
    md: 2,
    style: {
      paddingRight: 0,
      paddingLeft: 5
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    onClick: onToggle,
    style: {
      margin: 2,
      paddingRight: 15
    }
  }, props.volume === 0 ? /*#__PURE__*/_react["default"].createElement(_VolumeOff["default"], {
    style: _objectSpread(_objectSpread({}, SPEAKER_ICON_SIZE), {}, {
      transform: 'translateX(1px)'
    })
  }) : /*#__PURE__*/_react["default"].createElement(_VolumeUp["default"], {
    style: _objectSpread(_objectSpread({}, SPEAKER_ICON_SIZE), {}, {
      transform: 'translateX(1px)'
    })
  }))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    xs: 10,
    md: 10,
    style: {
      paddingRight: 25,
      paddingLeft: 0
    }
  }, /*#__PURE__*/_react["default"].createElement(StyledSlider, {
    value: props.volume,
    onChange: handleChange
  }))));
}