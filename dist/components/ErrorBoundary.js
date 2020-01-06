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

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var ErrorBoundary =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(ErrorBoundary, _Component);

  function ErrorBoundary(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, ErrorBoundary);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ErrorBoundary).call(this, props));
    _this.state = {
      hasError: false,
      error: null
    };
    return _this;
  }

  (0, _createClass2["default"])(ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, errorInfo) {
      console.log('Error: ', error);
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.error) {
        return _react["default"].createElement(_reactBootstrap.Alert, {
          bsStyle: "danger",
          "data-testid": "alert-container"
        }, _react["default"].createElement("p", {
          "data-testid": "alert-message"
        }, "Something went wrong..."));
      }

      return this.props.children;
    }
  }], [{
    key: "getDerivedStateFromError",
    value: function getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return {
        hasError: true,
        error: error
      };
    }
  }]);
  return ErrorBoundary;
}(_react.Component);

var _default = ErrorBoundary;
exports["default"] = _default;