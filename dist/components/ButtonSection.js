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

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _HeadingFormContainer = _interopRequireDefault(require("../containers/HeadingFormContainer"));

var _TimespanFormContainer = _interopRequireDefault(require("../containers/TimespanFormContainer"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _alertStatus = require("../services/alert-status");

var _AlertContainer = _interopRequireDefault(require("../containers/AlertContainer"));

var _forms = require("../actions/forms");

var styles = {
  well: {
    marginTop: '1rem'
  }
};

var ButtonSection =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(ButtonSection, _Component);

  function ButtonSection() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, ButtonSection);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(ButtonSection)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      headingOpen: false,
      timespanOpen: false,
      initSegment: null,
      isInitializing: true,
      alertObj: null,
      disabled: true
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setIsInitializing", function (value) {
      if (value === 1) {
        _this.setState({
          isInitializing: true
        });
      } else {
        _this.setState({
          isInitializing: false
        });
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null,
        disabled: true
      }); // Clear the redux-store flag when closing the alert from AlertContainer


      _this.props.handleEditingTimespans(1);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelHeadingClick", function () {
      _this.setState({
        headingOpen: false
      });

      _this.clearAlert();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleHeadingClick", function () {
      _this.props.handleEditingTimespans(0); // When opening heading form, delete if a temporary segment exists


      _this.deleteTempSegment();

      _this.setState({
        alertObj: null,
        headingOpen: true,
        timespanOpen: false,
        disabled: false
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelTimespanClick", function () {
      _this.deleteTempSegment();

      _this.setState({
        timespanOpen: false
      });

      _this.clearAlert();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleTimeSpanClick", function () {
      // Clear existing alertObj
      _this.clearAlert(); // Disable editing other items in structure


      _this.props.handleEditingTimespans(0); // Create a temporary segment if timespan form is closed


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
        // Initialize Redux store with temporary segment
        _this.props.bindInitSegment(tempSegment, 0);

        _this.setState({
          initSegment: tempSegment,
          headingOpen: false,
          timespanOpen: true,
          isInitializing: true,
          disabled: false
        });
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "deleteTempSegment", function () {
      if (_this.state.initSegment !== null) {
        _this.props.deleteTempSegment(_this.state.initSegment.id);
      }
    });
    return _this;
  }

  (0, _createClass2["default"])(ButtonSection, [{
    key: "render",
    value: function render() {
      var timespanFormProps = {
        cancelClick: this.handleCancelTimespanClick,
        initSegment: this.state.initSegment,
        isInitializing: this.state.isInitializing,
        timespanOpen: this.state.timespanOpen,
        setIsInitializing: this.setIsInitializing
      };
      var _this$props$forms = this.props.forms,
          editingDisabled = _this$props$forms.editingDisabled,
          structureRetrieved = _this$props$forms.structureRetrieved,
          waveformRetrieved = _this$props$forms.waveformRetrieved,
          streamMediaRetrieved = _this$props$forms.streamMediaRetrieved; // Only return UI when both structure and waveform data exist

      return structureRetrieved && waveformRetrieved ? _react["default"].createElement("section", null, _react["default"].createElement(_AlertContainer["default"], this.state.alertObj), _react["default"].createElement(_reactBootstrap.Row, {
        "data-testid": "button-row"
      }, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react["default"].createElement(_reactBootstrap.Button, {
        "data-testid": "add-heading-button",
        block: true,
        onClick: this.handleHeadingClick,
        disabled: this.state.disabled && editingDisabled
      }, "Add a Heading")), _react["default"].createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react["default"].createElement(_reactBootstrap.Button, {
        "data-testid": "add-timespan-button",
        block: true,
        onClick: this.handleTimeSpanClick,
        disabled: this.state.disabled && editingDisabled || !streamMediaRetrieved
      }, "Add a Timespan"))), _react["default"].createElement(_reactBootstrap.Collapse, {
        "in": this.state.headingOpen
      }, _react["default"].createElement("div", {
        className: "well",
        style: styles.well,
        "data-testid": "heading-form-wrapper"
      }, _react["default"].createElement(_HeadingFormContainer["default"], {
        cancelClick: this.handleCancelHeadingClick
      }))), _react["default"].createElement(_reactBootstrap.Collapse, {
        "in": this.state.timespanOpen
      }, _react["default"].createElement("div", {
        className: "well",
        style: styles.well,
        "data-testid": "timespan-form-wrapper"
      }, _react["default"].createElement(_TimespanFormContainer["default"], timespanFormProps)))) : null;
    }
  }]);
  return ButtonSection;
}(_react.Component);

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
  bindInitSegment: peaksActions.dragSegment,
  handleEditingTimespans: _forms.handleEditingTimespans
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ButtonSection);

exports["default"] = _default;