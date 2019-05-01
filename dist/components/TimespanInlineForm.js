"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PureTimespanInlineForm = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _formHelper = require("../services/form-helper");

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _lodash = require("lodash");

var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformUtils = new _WaveformDataUtils["default"]();
var styles = {
  formControl: {
    margin: '0 5px'
  }
};

var TimespanInlineForm =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(TimespanInlineForm, _Component);

  function TimespanInlineForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, TimespanInlineForm);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TimespanInlineForm).call(this, props)); // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data

    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      beginTime: '',
      endTime: '',
      timespanTitle: '',
      clonedSegment: {},
      isTyping: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      // Revert to segment to the state before
      _this.props.revertSegment(_this.state.clonedSegment);

      _this.props.cancelFn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleInputChange", function (e, callback) {
      _this.setState({
        isTyping: true
      });

      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), function () {
        callback();
        var _this$props = _this.props,
            item = _this$props.item,
            peaksInstance = _this$props.peaksInstance;
        var segment = peaksInstance.peaks.segments.getSegment(item.id);

        if (_this.formIsValid()) {
          _this.props.updateSegment(segment, _this.state);
        }
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveClick", function () {
      _this.props.saveSegment(_this.state);

      var _this$state = _this.state,
          beginTime = _this$state.beginTime,
          endTime = _this$state.endTime,
          timespanTitle = _this$state.timespanTitle;

      _this.props.saveFn(_this.props.item.id, {
        beginTime: beginTime,
        endTime: endTime,
        timespanTitle: timespanTitle
      });
    });
    _this.tempSmData = undefined;
    return _this;
  }

  (0, _createClass2["default"])(TimespanInlineForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props,
          smData = _this$props2.smData,
          item = _this$props2.item,
          peaksInstance = _this$props2.peaksInstance; // Get a fresh copy of store data

      this.tempSmData = (0, _lodash.cloneDeep)(smData); // Load existing form values

      this.setState((0, _formHelper.getExistingFormValues)(item.id, this.tempSmData, peaksInstance.peaks)); // Remove current list item from the data we're doing validation against in this form

      this.tempSmData = structuralMetadataUtils.deleteListItem(item.id, this.tempSmData); // Save a reference to all the spans for future calculations

      this.allSpans = structuralMetadataUtils.getItemsOfType('span', this.tempSmData); // Make segment related to timespan editable

      this.props.activateSegment(item.id);
      this.props.changeSegment();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.peaksInstance !== nextProps.peaksInstance) {
        if (nextProps.segment && !this.state.isTyping) {
          var segment = nextProps.segment,
              peaksInstance = nextProps.peaksInstance; // Prevent from overlapping when dragging the handles

          var _waveformUtils$valida = waveformUtils.validateSegment(segment, peaksInstance.peaks),
              startTime = _waveformUtils$valida.startTime,
              endTime = _waveformUtils$valida.endTime;

          this.setState({
            beginTime: structuralMetadataUtils.toHHmmss(startTime),
            endTime: structuralMetadataUtils.toHHmmss(endTime)
          });
        }
      }
    }
  }, {
    key: "formIsValid",
    value: function formIsValid() {
      var _this$state2 = this.state,
          beginTime = _this$state2.beginTime,
          endTime = _this$state2.endTime;
      var titleValid = (0, _formHelper.isTitleValid)(this.state.timespanTitle);
      var timesValidResponse = (0, _formHelper.validTimespans)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks);
      return titleValid && timesValidResponse.valid;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$state3 = this.state,
          beginTime = _this$state3.beginTime,
          endTime = _this$state3.endTime,
          timespanTitle = _this$state3.timespanTitle;
      return _react["default"].createElement(_reactBootstrap.Form, {
        inline: true
      }, _react["default"].createElement("div", {
        className: "row-wrapper"
      }, _react["default"].createElement("div", null, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "timespanTitle",
        validationState: (0, _formHelper.getValidationTitleState)(timespanTitle)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Title"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        style: styles.formControl,
        value: timespanTitle,
        onChange: function onChange(e) {
          _this2.handleInputChange(e, function () {
            _this2.setState({
              isTyping: false
            });
          });
        }
      })), _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "beginTime",
        validationState: (0, _formHelper.getValidationBeginState)(beginTime, this.allSpans)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Begin Time"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        style: styles.formControl,
        value: beginTime,
        onChange: function onChange(e) {
          _this2.handleInputChange(e, function () {
            _this2.setState({
              isTyping: false
            });
          });
        }
      })), _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "endTime",
        validationState: (0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks)
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "End Time"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        style: styles.formControl,
        value: endTime,
        onChange: function onChange(e) {
          _this2.handleInputChange(e, function () {
            _this2.setState({
              isTyping: false
            });
          });
        }
      }))), _react["default"].createElement(_ListItemInlineEditControls["default"], {
        formIsValid: this.formIsValid(),
        handleSaveClick: this.handleSaveClick,
        handleCancelClick: this.handleCancelClick
      })));
    }
  }]);
  return TimespanInlineForm;
}(_react.Component); // For testing purposes


exports.PureTimespanInlineForm = TimespanInlineForm;
(0, _defineProperty2["default"])(TimespanInlineForm, "propTypes", {
  item: _propTypes["default"].object,
  cancelFn: _propTypes["default"].func,
  saveFn: _propTypes["default"].func
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment
  };
};

var mapDispatchToProps = {
  activateSegment: peaksActions.activateSegment,
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  changeSegment: peaksActions.changeSegment
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanInlineForm);

exports["default"] = _default;