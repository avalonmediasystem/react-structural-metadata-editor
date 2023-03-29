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

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _formHelper = require("../services/form-helper");

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _lodash = require("lodash");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformDataUtils = new _WaveformDataUtils["default"]();

var TimespanForm = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(TimespanForm, _Component);

  var _super = _createSuper(TimespanForm);

  function TimespanForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, TimespanForm);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "buildHeadingsOptions", function () {
      var smData = _this.props.smData;
      var newSpan = {
        begin: _this.state.beginTime,
        end: _this.state.endTime
      }; // Get spans in overall span list which fall before and after the new span

      var wrapperSpans = structuralMetadataUtils.findWrapperSpans(newSpan, _this.state.allSpans); // Get all valid div headings

      var validHeadings = structuralMetadataUtils.getValidHeadings(newSpan, wrapperSpans, smData); // Update state with valid headings

      _this.setState({
        validHeadings: validHeadings
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearHeadingOptions", function () {
      _this.setState({
        validHeadings: []
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleInputChange", function (e) {
      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), _this.updateChildOfOptions());
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSubmit", function (e) {
      e.preventDefault();
      var _this$state = _this.state,
          beginTime = _this$state.beginTime,
          endTime = _this$state.endTime,
          timespanChildOf = _this$state.timespanChildOf,
          timespanTitle = _this$state.timespanTitle;

      _this.props.cancelClick();

      _this.props.onSubmit({
        beginTime: beginTime,
        endTime: endTime,
        timespanChildOf: timespanChildOf,
        timespanTitle: timespanTitle
      }); // Clear form values


      _this.clearFormValues();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleTimeChange", function (e) {
      var _this$props = _this.props,
          segment = _this$props.segment,
          startTimeChanged = _this$props.startTimeChanged; // Lock setting isTyping to false before updating the DOM

      _this.props.dragSegment(segment.id, startTimeChanged, 0); // Set isTyping flag in props to true


      _this.props.setIsTyping(1);

      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), function () {
        _this.updateChildOfOptions(); // Update waveform segment with user inputs in the form


        if (_this.localValidTimespans().valid) {
          _this.props.updateSegment(segment, _this.state);
        }
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      _this.props.cancelClick();

      _this.props.setIsTyping(0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleChildOfChange", function (e) {
      _this.setState({
        timespanChildOf: e.target.value
      });
    });
    _this.state = {
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: [],
      peaksInstance: _this.props.peaksInstance,
      isInitializing: _this.props.isInitializing,
      allSpans: null
    };
    return _this;
  }

  (0, _createClass2["default"])(TimespanForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props,
          smData = _this$props2.smData,
          peaksInstance = _this$props2.peaksInstance;
      var _this$state2 = this.state,
          beginTime = _this$state2.beginTime,
          endTime = _this$state2.endTime;
      this.setState({
        allSpans: structuralMetadataUtils.getItemsOfType('span', smData)
      });

      if (peaksInstance && beginTime !== '' && endTime !== '') {
        this.updateChildOfOptions();
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var smData = this.props.smData;

      if (!(0, _lodash.isEqual)(smData, prevProps.smData) && smData.length > 0) {
        this.setState({
          allSpans: structuralMetadataUtils.getItemsOfType('span', smData)
        }); // Update valid headings when structure changes

        this.updateChildOfOptions();
      }

      var _this$state3 = this.state,
          beginTime = _this$state3.beginTime,
          endTime = _this$state3.endTime,
          isInitializing = _this$state3.isInitializing;
      var prevBeginTime = prevState.beginTime,
          prevEndTime = prevState.endTime;

      if (beginTime !== prevBeginTime || endTime !== prevEndTime) {
        this.updateChildOfOptions();

        if (!isInitializing) {
          // Set isInitializing flag to false
          this.props.setIsInitializing(0);
        }
      }
    }
  }, {
    key: "clearFormValues",
    value: function clearFormValues() {
      this.setState({
        beginTime: '',
        endTime: '',
        timespanChildOf: '',
        timespanTitle: '',
        validHeadings: []
      }); // Reset isTyping flag

      this.props.setIsTyping(0);
    }
  }, {
    key: "formIsValid",
    value: function formIsValid() {
      var titleValid = (0, _formHelper.isTitleValid)(this.state.timespanTitle);
      var childOfValid = this.state.timespanChildOf.length > 0;
      var timesValidResponse = this.localValidTimespans();
      return titleValid && childOfValid && timesValidResponse.valid;
    }
  }, {
    key: "updateChildOfOptions",
    value: function updateChildOfOptions() {
      var timesValidResponse = this.localValidTimespans();

      if (timesValidResponse.valid) {
        this.buildHeadingsOptions();
      } else {
        this.clearHeadingOptions();
      }
    }
    /**
     * A local wrapper for the reusable function 'validTimespans'
     */

  }, {
    key: "localValidTimespans",
    value: function localValidTimespans() {
      var _this$state4 = this.state,
          beginTime = _this$state4.beginTime,
          endTime = _this$state4.endTime,
          allSpans = _this$state4.allSpans;
      return (0, _formHelper.validTimespans)(beginTime, endTime, this.props.peaksInstance.duration, allSpans);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state5 = this.state,
          beginTime = _this$state5.beginTime,
          endTime = _this$state5.endTime,
          timespanChildOf = _this$state5.timespanChildOf,
          timespanTitle = _this$state5.timespanTitle,
          allSpans = _this$state5.allSpans;
      return /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form, {
        onSubmit: this.handleSubmit,
        "data-testid": "timespan-form"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "timespanTitle"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        value: timespanTitle,
        isValid: (0, _formHelper.getValidationTitleState)(timespanTitle),
        isInvalid: !(0, _formHelper.getValidationTitleState)(timespanTitle),
        onChange: this.handleInputChange,
        "data-testid": "timespan-form-title"
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control.Feedback, null)), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        sm: 6
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "beginTime"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Begin Time"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        value: beginTime,
        isValid: (0, _formHelper.getValidationBeginState)(beginTime, allSpans),
        isInvalid: !(0, _formHelper.getValidationBeginState)(beginTime, allSpans),
        placeholder: "00:00:00",
        onChange: this.handleTimeChange,
        "data-testid": "timespan-form-begintime"
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control.Feedback, null))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        sm: 6
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "endTime"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "End Time"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        value: endTime,
        isValid: (0, _formHelper.getValidationEndState)(beginTime, endTime, allSpans, this.props.peaksInstance.peaks),
        isInvalid: !(0, _formHelper.getValidationEndState)(beginTime, endTime, allSpans, this.props.peaksInstance.peaks),
        placeholder: "00:00:00",
        onChange: this.handleTimeChange,
        "data-testid": "timespan-form-endtime"
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control.Feedback, null)))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "timespanChildOf"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Child Of"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        as: "select",
        onChange: this.handleChildOfChange,
        value: timespanChildOf,
        "data-testid": "timespan-form-childof"
      }, /*#__PURE__*/_react["default"].createElement("option", {
        value: ""
      }, "Select..."), this.state.validHeadings.map(function (item) {
        return /*#__PURE__*/_react["default"].createElement("option", {
          value: item.id,
          key: item.id
        }, item.label);
      }))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        sm: {
          offset: 5
        },
        md: {
          offset: 5
        },
        lg: {
          offset: 10
        }
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.ButtonToolbar, {
        className: "float-right"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "outline-secondary",
        className: "mr-1",
        onClick: this.handleCancelClick,
        "data-testid": "timespan-form-cancel-button"
      }, "Cancel"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "primary",
        type: "submit",
        disabled: !this.formIsValid(),
        "data-testid": "timespan-form-save-button"
      }, "Save")))));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.timespanOpen && !nextProps.isTyping) {
        var initSegment = nextProps.initSegment,
            isInitializing = nextProps.isInitializing,
            peaksInstance = nextProps.peaksInstance,
            segment = nextProps.segment,
            smData = nextProps.smData,
            startTimeChanged = nextProps.startTimeChanged; // Render initial values when form opens

        if (initSegment && isInitializing) {
          var startTime = initSegment.startTime,
              endTime = initSegment.endTime;
          return {
            allSpans: structuralMetadataUtils.getItemsOfType('span', smData),
            beginTime: structuralMetadataUtils.toHHmmss(startTime),
            endTime: structuralMetadataUtils.toHHmmss(endTime),
            isInitializing: false
          };
        } // Render time value changes


        if (prevState.peaksInstance !== peaksInstance && !isInitializing) {
          var _waveformDataUtils$va = waveformDataUtils.validateSegment(segment, startTimeChanged, peaksInstance.peaks, peaksInstance.duration),
              _startTime = _waveformDataUtils$va.startTime,
              _endTime = _waveformDataUtils$va.endTime;

          return {
            beginTime: structuralMetadataUtils.toHHmmss(_startTime),
            endTime: structuralMetadataUtils.toHHmmss(_endTime)
          };
        }
      } // When handles in waveform is dragged disable typing in the input form


      if (nextProps.isDragging) {
        nextProps.setIsTyping(0);
      }

      return null;
    }
  }]);
  return TimespanForm;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment,
    startTimeChanged: state.peaksInstance.startTimeChanged,
    isDragging: state.peaksInstance.isDragging
  };
};

var mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment,
  dragSegment: peaksActions.dragSegment
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanForm);

exports["default"] = _default;