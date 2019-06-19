"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = VolumeSlider;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _Slider = _interopRequireDefault(require("@material-ui/lab/Slider"));

var _VolumeUp = _interopRequireDefault(require("@material-ui/icons/VolumeUp"));

var _VolumeOff = _interopRequireDefault(require("@material-ui/icons/VolumeOff"));

var _styles = require("@material-ui/core/styles");

var _core = require("@material-ui/core");

var _reactBootstrap = require("react-bootstrap");

/**
 * NOTE:
 * The logic of turning on/off volume in this module is taken from,
 * https://github.com/digirati-co-uk/timeliner/blob/master/src/components/VolumeSliderCompact/VolumeSliderCompact.js
 *
 */
var useStyles = (0, _styles.makeStyles)(function () {
  return {
    root: {
      width: 200,
      paddingLeft: 10,
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 25
    }
  };
});
var StyledSlider = (0, _styles.withStyles)({
  root: {
    color: '#000',
    height: 2,
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
      margin: 2,
      paddingRight: 15
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