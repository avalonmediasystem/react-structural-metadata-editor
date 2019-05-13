"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _lodash = require("lodash");

var AlertContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(AlertContainer, _Component);

  function AlertContainer() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, AlertContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(AlertContainer)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      show: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDismiss", function () {
      _this.setState({
        show: false
      });

      _this.props.clearAlert();
    });
    return _this;
  }

  (0, _createClass2["default"])(AlertContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.message) {
        this.setState({
          show: true
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          alertStyle = _this$props.alertStyle,
          message = _this$props.message;

      if (!this.state.show) {
        return null;
      }

      return _react["default"].createElement(_reactBootstrap.Alert, {
        bsStyle: alertStyle,
        onDismiss: this.handleDismiss
      }, _react["default"].createElement("p", null, message));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if ((0, _lodash.isEmpty)(nextProps)) {
        return {
          show: false
        };
      }

      if (nextProps.message && !prevState.show) {
        return {
          show: true
        };
      }

      return null;
    }
  }]);
  return AlertContainer;
}(_react.Component);

(0, _defineProperty2["default"])(AlertContainer, "propTypes", {
  message: _propTypes["default"].string,
  alertStyle: _propTypes["default"].oneOf(['success', 'warning', 'danger', 'info']),
  clearAlert: _propTypes["default"].func
});
var _default = AlertContainer;
exports["default"] = _default;