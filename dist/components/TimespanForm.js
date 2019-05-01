"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PureTimespanForm = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _formHelper = require("../services/form-helper");

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _lodash = require("lodash");

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformDataUtils = new _WaveformDataUtils["default"]();

var TimespanForm =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(TimespanForm, _Component);

  function TimespanForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, TimespanForm);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TimespanForm).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "buildHeadingsOptions", function () {
      var smData = _this.props.smData;
      var newSpan = {
        begin: _this.state.beginTime,
        end: _this.state.endTime
      }; // Get spans in overall span list which fall before and after the new span

      var wrapperSpans = structuralMetadataUtils.findWrapperSpans(newSpan, _this.allSpans); // Get all valid div headings

      var validHeadings = structuralMetadataUtils.getValidHeadings(wrapperSpans, smData); // Update state with valid headings

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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleTimeChange", function (e, callback) {
      // Update waveform segment with user inputs in the form
      _this.setState({
        isTyping: true
      });

      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), function () {
        callback();

        _this.updateChildOfOptions();

        var _this$props = _this.props,
            initSegment = _this$props.initSegment,
            peaksInstance = _this$props.peaksInstance;
        var segment = peaksInstance.peaks.segments.getSegment(initSegment.id);

        if (_this.localValidTimespans().valid) {
          _this.props.updateSegment(segment, _this.state);
        }
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      _this.props.cancelClick();
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
      isTyping: false
    };
    _this.allSpans = null;
    return _this;
  }

  (0, _createClass2["default"])(TimespanForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var smData = this.props.smData;
      this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var smData = this.props.smData;

      if (!(0, _lodash.isEqual)(smData, prevProps.smData)) {
        this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
      }
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.timespanOpen && !this.state.isTyping) {
        var initSegment = nextProps.initSegment,
            isInitializing = nextProps.isInitializing,
            peaksInstance = nextProps.peaksInstance,
            segment = nextProps.segment; // Set state to get initial begin and end times from temporary segment

        if (initSegment !== this.props.initSegment && isInitializing) {
          var startTime = initSegment.startTime,
              endTime = initSegment.endTime;
          this.setState({
            beginTime: structuralMetadataUtils.toHHmmss(startTime),
            endTime: structuralMetadataUtils.toHHmmss(endTime)
          });
          this.props.updateInitialize(false);
        } // Update state when segment handles are dragged in the waveform


        if (this.props.peaksInstance !== peaksInstance && !isInitializing) {
          // Prevent from overlapping when dragging the handles
          var _waveformDataUtils$va = waveformDataUtils.validateSegment(segment, peaksInstance.peaks),
              _startTime = _waveformDataUtils$va.startTime,
              _endTime = _waveformDataUtils$va.endTime;

          this.setState({
            beginTime: structuralMetadataUtils.toHHmmss(_startTime),
            endTime: structuralMetadataUtils.toHHmmss(_endTime)
          }, this.updateChildOfOptions());
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
        validHeadings: [],
        isTyping: false
      });
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
      var _this$state2 = this.state,
          beginTime = _this$state2.beginTime,
          endTime = _this$state2.endTime;
      var allSpans = this.allSpans;
      return (0, _formHelper.validTimespans)(beginTime, endTime, allSpans, this.props.peaksInstance.peaks);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$state3 = this.state,
          beginTime = _this$state3.beginTime,
          endTime = _this$state3.endTime,
          timespanChildOf = _this$state3.timespanChildOf,
          timespanTitle = _this$state3.timespanTitle;
      return _react["default"].createElement("form", {
        onSubmit: this.handleSubmit
      }, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "timespanTitle",
        validationState: (0, _formHelper.getValidationTitleState)(timespanTitle)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Title"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        value: timespanTitle,
        onChange: this.handleInputChange
      }), _react["default"].createElement(_reactBootstrap.FormControl.Feedback, null)), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        sm: 6
      }, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "beginTime",
        validationState: (0, _formHelper.getValidationBeginState)(beginTime, this.allSpans)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Begin Time"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        value: beginTime,
        placeholder: "00:00:00",
        onChange: function onChange(e) {
          _this2.handleTimeChange(e, function () {
            _this2.setState({
              isTyping: false
            });
          });
        }
      }), _react["default"].createElement(_reactBootstrap.FormControl.Feedback, null))), _react["default"].createElement(_reactBootstrap.Col, {
        sm: 6
      }, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "endTime",
        validationState: (0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "End Time"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        value: endTime,
        placeholder: "00:00:00",
        onChange: function onChange(e) {
          _this2.handleTimeChange(e, function () {
            _this2.setState({
              isTyping: false
            });
          });
        }
      }), _react["default"].createElement(_reactBootstrap.FormControl.Feedback, null)))), _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "timespanChildOf"
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Child Of"), _react["default"].createElement(_reactBootstrap.FormControl, {
        componentClass: "select",
        placeholder: "select",
        onChange: this.handleChildOfChange,
        value: timespanChildOf
      }, _react["default"].createElement("option", {
        value: ""
      }, "Select..."), this.state.validHeadings.map(function (item) {
        return _react["default"].createElement("option", {
          value: item.id,
          key: item.id
        }, item.label);
      }))), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12
      }, _react["default"].createElement(_reactBootstrap.ButtonToolbar, {
        className: "pull-right"
      }, _react["default"].createElement(_reactBootstrap.Button, {
        onClick: this.handleCancelClick
      }, "Cancel"), _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "primary",
        type: "submit",
        disabled: !this.formIsValid()
      }, "Save")))));
    }
  }]);
  return TimespanForm;
}(_react.Component); // For testing purposes


exports.PureTimespanForm = TimespanForm;

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment
  };
};

var mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanForm);

exports["default"] = _default;