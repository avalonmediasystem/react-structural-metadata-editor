'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AlertContainer = function (_Component) {
  _inherits(AlertContainer, _Component);

  function AlertContainer() {
    var _temp, _this, _ret;

    _classCallCheck(this, AlertContainer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      show: false
    }, _this.handleDismiss = function () {
      _this.setState({ show: false });
      _this.props.clearAlert();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  AlertContainer.prototype.componentDidMount = function componentDidMount() {
    if (this.props.message) {
      this.setState({ show: true });
    }
  };

  AlertContainer.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    if (this.props.message && !prevState.show) {
      this.setState({ show: true });
    }
  };

  AlertContainer.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if ((0, _lodash.isEmpty)(nextProps)) {
      this.setState({ show: false });
    }
  };

  AlertContainer.prototype.render = function render() {
    var _props = this.props,
        alertStyle = _props.alertStyle,
        message = _props.message;


    if (!this.state.show) {
      return null;
    }

    return _react2.default.createElement(
      _reactBootstrap.Alert,
      { bsStyle: alertStyle, onDismiss: this.handleDismiss },
      _react2.default.createElement(
        'p',
        null,
        message
      )
    );
  };

  return AlertContainer;
}(_react.Component);

AlertContainer.propTypes = process.env.NODE_ENV !== "production" ? {
  message: _propTypes2.default.string,
  alertStyle: _propTypes2.default.oneOf(['success', 'warning', 'danger', 'info']),
  clearAlert: _propTypes2.default.func
} : {};
exports.default = AlertContainer;
module.exports = exports['default'];