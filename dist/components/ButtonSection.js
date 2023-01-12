"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _HeadingFormContainer = _interopRequireDefault(require("../containers/HeadingFormContainer"));

var _TimespanFormContainer = _interopRequireDefault(require("../containers/TimespanFormContainer"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var styles = {
  well: {
    marginTop: '1rem',
    minHeight: '20px',
    padding: '19px',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #e3e3e3',
    borderRadius: '4px',
    boxShadow: 'inset 0 1px 1px rgb(0 0 0 / 5%)'
  }
};

var ButtonSection = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(ButtonSection, _Component);

  var _super = _createSuper(ButtonSection);

  function ButtonSection() {
    var _this;

    (0, _classCallCheck2["default"])(this, ButtonSection);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      headingOpen: false,
      timespanOpen: false,
      initSegment: null,
      isInitializing: true,
      alertObj: {
        alert: null,
        showAlert: false
      },
      disabled: true,
      formOpen: false
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelHeadingClick", function () {
      _this.setState({
        headingOpen: false,
        formOpen: false
      });

      _this.props.handleEditingTimespans(0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleHeadingClick", function () {
      _this.props.handleEditingTimespans(1); // When opening heading form, delete if a temporary segment exists


      _this.deleteTempSegment();

      _this.setState({
        headingOpen: true,
        timespanOpen: false,
        disabled: false,
        formOpen: true
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelTimespanClick", function () {
      _this.deleteTempSegment();

      _this.setState({
        timespanOpen: false,
        formOpen: false
      });

      _this.props.handleEditingTimespans(0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleTimeSpanClick", function () {
      // Disable editing other items in structure
      _this.props.handleEditingTimespans(1); // Create a temporary segment if timespan form is closed


      if (!_this.state.timespanOpen) {
        _this.props.createTempSegment();
      }

      var tempSegment = _this.props.peaksInstance.peaks.segments.getSegment('temp-segment');

      _this.setState({
        headingOpen: false,
        disabled: false,
        formOpen: true
      });

      if (tempSegment === null) {
        var noSpaceAlert = (0, _alertStatus.configureAlert)(-4);

        _this.props.setAlert(noSpaceAlert);
      } else {
        // Initialize Redux store with temporary segment
        _this.props.dragSegment(tempSegment.id, null, 0);

        _this.setState({
          initSegment: tempSegment,
          timespanOpen: true,
          isInitializing: true
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
          structureInfo = _this$props$forms.structureInfo,
          streamInfo = _this$props$forms.streamInfo; // Only return UI when both structure and waveform data exist

      return structureInfo.structureRetrieved ? /*#__PURE__*/_react["default"].createElement("section", {
        className: "button-section",
        "data-testid": "button-section"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
        "data-testid": "button-row"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        sm: "6"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "outline-secondary",
        "data-testid": "add-heading-button",
        block: true,
        onClick: this.handleHeadingClick,
        disabled: this.state.disabled && editingDisabled
      }, "Add a Heading")), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        sm: "6"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "outline-secondary",
        "data-testid": "add-timespan-button",
        block: true,
        onClick: this.handleTimeSpanClick,
        disabled: this.state.disabled && editingDisabled || streamInfo.streamMediaError
      }, "Add a Timespan"))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Collapse, {
        "in": this.state.headingOpen
      }, /*#__PURE__*/_react["default"].createElement("div", {
        style: styles.well,
        "data-testid": "heading-form-wrapper"
      }, /*#__PURE__*/_react["default"].createElement(_HeadingFormContainer["default"], {
        cancelClick: this.handleCancelHeadingClick
      }))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Collapse, {
        "in": this.state.timespanOpen
      }, /*#__PURE__*/_react["default"].createElement("div", {
        style: styles.well,
        "data-testid": "timespan-form-wrapper"
      }, /*#__PURE__*/_react["default"].createElement(_TimespanFormContainer["default"], timespanFormProps)))) : null;
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var formOpen = prevState.formOpen;
      var editingDisabled = nextProps.forms.editingDisabled;

      if (editingDisabled && !formOpen) {
        return {
          disabled: true
        };
      }

      return null;
    }
  }]);
  return ButtonSection;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state) {
  return {
    peaksInstance: state.peaksInstance,
    forms: state.forms
  };
};

var mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  dragSegment: peaksActions.dragSegment,
  handleEditingTimespans: _forms.handleEditingTimespans,
  setAlert: _forms.setAlert
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ButtonSection);

exports["default"] = _default;