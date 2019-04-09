'use strict';

exports.__esModule = true;
exports.PureButtonSection = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _HeadingFormContainer = require('../containers/HeadingFormContainer');

var _HeadingFormContainer2 = _interopRequireDefault(_HeadingFormContainer);

var _TimespanFormContainer = require('../containers/TimespanFormContainer');

var _TimespanFormContainer2 = _interopRequireDefault(_TimespanFormContainer);

var _peaksInstance = require('../actions/peaks-instance');

var peaksActions = _interopRequireWildcard(_peaksInstance);

var _alertStatus = require('../services/alert-status');

var _AlertContainer = require('../containers/AlertContainer');

var _AlertContainer2 = _interopRequireDefault(_AlertContainer);

var _forms = require('../actions/forms');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
  section: {
    margin: '4rem 0'
  },
  well: {
    marginTop: '1rem'
  }
};

var ButtonSection = function (_Component) {
  _inherits(ButtonSection, _Component);

  function ButtonSection() {
    var _temp, _this, _ret;

    _classCallCheck(this, ButtonSection);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      headingOpen: false,
      timespanOpen: false,
      initSegment: null,
      isInitializing: true,
      alertObj: null,
      disabled: true
    }, _this.updateInitializeFlag = function (value) {
      _this.setState({
        isInitializing: value
      });
    }, _this.clearAlert = function () {
      _this.setState({
        alertObj: null,
        disabled: true
      });
      // Clear the redux-store flag when closing the alert from AlertContainer
      _this.props.handleEditingTimespans(1);
    }, _this.handleCancelHeadingClick = function () {
      _this.setState({ headingOpen: false });
      _this.clearAlert();
    }, _this.handleHeadingClick = function () {
      _this.props.handleEditingTimespans(0);
      // When opening heading form, delete if a temporary segment exists
      _this.deleteTempSegment();
      _this.setState({
        alertObj: null,
        headingOpen: true,
        timespanOpen: false,
        disabled: false
      });
    }, _this.handleCancelTimespanClick = function () {
      _this.deleteTempSegment();
      _this.setState({ timespanOpen: false });
      _this.clearAlert();
    }, _this.handleTimeSpanClick = function () {
      // Clear existing alertObj
      _this.clearAlert();

      // Disable editing other items in structure
      _this.props.handleEditingTimespans(0);

      // Create a temporary segment if timespan form is closed
      if (!_this.state.timespanOpen) {
        _this.props.createTempSegment();
      }
      var tempSegment = _this.props.peaksInstance.peaks.segments.getSegment('temp-segment');
      if (tempSegment === null) {
        _this.setState({
          alertObj: (0, _alertStatus.configureAlert)(-4, _this.clearAlert),
          headingOpen: false,
          disabled: false
        });
      } else {
        _this.setState({
          initSegment: tempSegment,
          headingOpen: false,
          timespanOpen: true,
          isInitializing: true,
          disabled: false
        });
      }
    }, _this.deleteTempSegment = function () {
      if (_this.state.initSegment !== null) {
        _this.props.deleteTempSegment(_this.state.initSegment.id);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // Delete if a temporary segment exists


  ButtonSection.prototype.render = function render() {
    var timespanFormProps = {
      cancelClick: this.handleCancelTimespanClick,
      initSegment: this.state.initSegment,
      isInitializing: this.state.isInitializing,
      timespanOpen: this.state.timespanOpen,
      updateInitialize: this.updateInitializeFlag
    };

    var _props$forms = this.props.forms,
        structureRetrieved = _props$forms.structureRetrieved,
        waveformRetrieved = _props$forms.waveformRetrieved;

    var waveformAndStructureValid = structureRetrieved && waveformRetrieved;

    return waveformAndStructureValid ? _react2.default.createElement(
      'section',
      { style: styles.section },
      _react2.default.createElement(_AlertContainer2.default, this.state.alertObj),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 6 },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              block: true,
              onClick: this.handleHeadingClick,
              disabled: this.state.disabled && this.props.forms.editingDisabled
            },
            'Add a Heading'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 6 },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              block: true,
              onClick: this.handleTimeSpanClick,
              disabled: this.state.disabled && this.props.forms.editingDisabled
            },
            'Add a Timespan'
          )
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Collapse,
        { 'in': this.state.headingOpen },
        _react2.default.createElement(
          'div',
          { className: 'well', style: styles.well },
          _react2.default.createElement(_HeadingFormContainer2.default, { cancelClick: this.handleCancelHeadingClick })
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Collapse,
        { 'in': this.state.timespanOpen },
        _react2.default.createElement(
          'div',
          { className: 'well', style: styles.well },
          _react2.default.createElement(_TimespanFormContainer2.default, timespanFormProps)
        )
      )
    ) : null;
  };

  return ButtonSection;
}(_react.Component);

// To use in tests as a disconnected component (to access state)


exports.PureButtonSection = ButtonSection;


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    forms: state.forms
  };
};

var mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  handleEditingTimespans: _forms.handleEditingTimespans
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ButtonSection);