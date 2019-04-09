'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WaveformErrorBoundary = function (_Component) {
  _inherits(WaveformErrorBoundary, _Component);

  function WaveformErrorBoundary() {
    var _temp, _this, _ret;

    _classCallCheck(this, WaveformErrorBoundary);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = { error: '' }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  WaveformErrorBoundary.prototype.componentDidCatch = function componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
  };

  WaveformErrorBoundary.prototype.render = function render() {
    if (this.state.error) {
      return _react2.default.createElement(
        _reactBootstrap.Alert,
        { bsStyle: 'danger' },
        _react2.default.createElement(
          'p',
          null,
          'Error rendering Peak.js waveform'
        )
      );
    }

    return this.props.children;
  };

  return WaveformErrorBoundary;
}(_react.Component);

exports.default = WaveformErrorBoundary;
module.exports = exports['default'];