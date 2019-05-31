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
      // Lock setting isTyping to false before updating the DOM
      _this.props.setIsDragging(_this.props.segment, 0); // Set isTyping flag in props to true


      _this.props.setIsTyping(1);

      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), function () {
        _this.updateChildOfOptions(); // Update waveform segment with user inputs in the form


        if (_this.localValidTimespans().valid) {
          _this.props.updateSegment(_this.props.segment, _this.state);
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
      peaksInstance: _this.props.peaksInstance,
      isInitializing: _this.props.isInitializing
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
    value: function componentDidUpdate(prevProps, prevState) {
      var smData = this.props.smData;

      if (!(0, _lodash.isEqual)(smData, prevProps.smData)) {
        this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData); // Update valid headings when structure changes

        this.updateChildOfOptions();
      }

      var _this$state2 = this.state,
          beginTime = _this$state2.beginTime,
          endTime = _this$state2.endTime,
          isInitializing = _this$state2.isInitializing;
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
      var _this$state3 = this.state,
          beginTime = _this$state3.beginTime,
          endTime = _this$state3.endTime;
      var allSpans = this.allSpans;
      return (0, _formHelper.validTimespans)(beginTime, endTime, allSpans, this.props.peaksInstance.peaks);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state4 = this.state,
          beginTime = _this$state4.beginTime,
          endTime = _this$state4.endTime,
          timespanChildOf = _this$state4.timespanChildOf,
          timespanTitle = _this$state4.timespanTitle;
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
        onChange: this.handleTimeChange
      }), _react["default"].createElement(_reactBootstrap.FormControl.Feedback, null))), _react["default"].createElement(_reactBootstrap.Col, {
        sm: 6
      }, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "endTime",
        validationState: (0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "End Time"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        value: endTime,
        placeholder: "00:00:00",
        onChange: this.handleTimeChange
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
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.timespanOpen && !nextProps.isTyping) {
        var initSegment = nextProps.initSegment,
            isInitializing = nextProps.isInitializing,
            peaksInstance = nextProps.peaksInstance,
            segment = nextProps.segment;

        if (initSegment && isInitializing) {
          var startTime = initSegment.startTime,
              endTime = initSegment.endTime;
          return {
            beginTime: structuralMetadataUtils.toHHmmss(startTime),
            endTime: structuralMetadataUtils.toHHmmss(endTime),
            isInitializing: false
          };
        }

        if (prevState.peaksInstance !== peaksInstance && !isInitializing) {
          var _waveformDataUtils$va = waveformDataUtils.validateSegment(segment, peaksInstance.peaks),
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
}(_react.Component); // For testing purposes


exports.PureTimespanForm = TimespanForm;

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment,
    isDragging: state.peaksInstance.isDragging
  };
};

var mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment,
  setIsDragging: peaksActions.dragSegment
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanForm);

exports["default"] = _default;