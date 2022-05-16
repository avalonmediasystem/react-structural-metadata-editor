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

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _formHelper = require("../services/form-helper");

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _lodash = require("lodash");

var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformUtils = new _WaveformDataUtils["default"]();
var styles = {
  formControl: {
    margin: '0 5px'
  }
};

var TimespanInlineForm = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(TimespanInlineForm, _Component);

  var _super = _createSuper(TimespanInlineForm);

  function TimespanInlineForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, TimespanInlineForm);
    _this = _super.call(this, props); // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data

    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      beginTime: '',
      endTime: '',
      timespanTitle: '',
      clonedSegment: {},
      peaksInstance: _this.props.peaksInstance,
      segment: _this.props.segment,
      startTimeChanged: _this.props.startTimeChanged
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      // Revert to segment to the state before
      _this.props.revertSegment(_this.state.clonedSegment);

      _this.props.cancelFn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleInputChange", function (e) {
      var _this$props = _this.props,
          segment = _this$props.segment,
          startTimeChanged = _this$props.startTimeChanged; // Lock disabling isTyping flag before updating DOM from form inputs

      _this.props.dragSegment(segment.id, startTimeChanged, 0); // Enable updating state from form inputs


      _this.props.setIsTyping(1);

      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value), function () {
        // Update waveform segment with user inputs in the form
        _this.props.updateSegment(segment, _this.state);
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveClick", function () {
      _this.props.saveSegment(_this.state);

      var _this$state = _this.state,
          beginTime = _this$state.beginTime,
          endTime = _this$state.endTime,
          timespanTitle = _this$state.timespanTitle;

      _this.props.saveFn(_this.props.segment.id, {
        beginTime: beginTime,
        endTime: endTime,
        timespanTitle: timespanTitle
      });
    });
    _this.tempSmData = undefined;
    _this.allSpans = [];
    return _this;
  }

  (0, _createClass2["default"])(TimespanInlineForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props,
          smData = _this$props2.smData,
          item = _this$props2.item,
          peaksInstance = _this$props2.peaksInstance,
          startTimeChanged = _this$props2.startTimeChanged; // Get a fresh copy of store data

      this.tempSmData = (0, _lodash.cloneDeep)(smData);
      var tempPeaks = (0, _lodash.cloneDeep)(peaksInstance.peaks); // Make segment related to timespan editable

      if (item.valid) {
        // Load existing form values
        this.setState((0, _formHelper.getExistingFormValues)(item.id, this.tempSmData, tempPeaks));
        this.props.activateSegment(item.id);
      } else {
        this.handleInvalidTimespan();
      } // Remove current list item from the data we're doing validation against in this form


      this.tempSmData = structuralMetadataUtils.deleteListItem(item.id, this.tempSmData); // Save a reference to all the spans for future calculations

      this.allSpans = structuralMetadataUtils.getItemsOfType('span', this.tempSmData); // Get segment from current peaks instance

      var segment = peaksInstance.peaks.segments.getSegment(item.id); // Set the selected segment in the component's state

      this.setState({
        segment: segment
      }); // Initialize the segment in Redux store with the selected item

      this.props.dragSegment(segment.id, startTimeChanged, 0);
    }
  }, {
    key: "handleInvalidTimespan",
    value:
    /**
     * When there are invalid timespans in the structure, to edit them
     * a placeholder segment is created within the Peaks instance, since
     * they cannot be added at the time Peaks is initialized.
     */
    function handleInvalidTimespan() {
      var _this$props3 = this.props,
          item = _this$props3.item,
          smData = _this$props3.smData,
          peaksInstance = _this$props3.peaksInstance;
      var itemIndex = structuralMetadataUtils.getItemsOfType('span', smData).findIndex(function (i) {
        return i.id === item.id;
      });
      var allSpans = structuralMetadataUtils.getItemsOfType('span', this.tempSmData);
      var wrapperSpans = {
        prevSpan: null,
        nextSpan: null
      };
      wrapperSpans.prevSpan = allSpans[itemIndex - 1] || null;
      wrapperSpans.nextSpan = allSpans[itemIndex + 1] || null;
      this.props.insertPlaceholderSegment(item, wrapperSpans);
      var placeholderSegment = peaksInstance.peaks.segments.getSegment(item.id);
      placeholderSegment.valid = false;
      this.setState({
        clonedSegment: placeholderSegment,
        beginTime: structuralMetadataUtils.toHHmmss(placeholderSegment.startTime),
        endTime: structuralMetadataUtils.toHHmmss(placeholderSegment.endTime),
        timespanTitle: placeholderSegment.labelText
      });
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
      var _this$state3 = this.state,
          beginTime = _this$state3.beginTime,
          endTime = _this$state3.endTime,
          timespanTitle = _this$state3.timespanTitle;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "row-wrapper"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form, {
        inline: true,
        "data-testid": "timespan-inline-form",
        className: "mb-0"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "timespanTitle"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        style: styles.formControl,
        value: timespanTitle,
        isValid: (0, _formHelper.getValidationTitleState)(timespanTitle),
        isInvalid: !(0, _formHelper.getValidationTitleState)(timespanTitle),
        onChange: this.handleInputChange,
        "data-testid": "timespan-inline-form-title"
      })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "beginTime"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Begin Time"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        as: "input",
        style: styles.formControl,
        value: beginTime,
        onChange: this.handleInputChange,
        isValid: (0, _formHelper.getValidationBeginState)(beginTime, this.allSpans),
        isInvalid: !(0, _formHelper.getValidationBeginState)(beginTime, this.allSpans),
        "data-testid": "timespan-inline-form-begintime"
      })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "endTime"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "End Time"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        style: styles.formControl,
        value: endTime,
        isValid: (0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.duration),
        isInvalid: !(0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.duration),
        onChange: this.handleInputChange,
        "data-testid": "timespan-inline-form-endtime"
      }))), /*#__PURE__*/_react["default"].createElement(_ListItemInlineEditControls["default"], {
        formIsValid: this.formIsValid(),
        handleSaveClick: this.handleSaveClick,
        handleCancelClick: this.handleCancelClick
      }));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var peaksInstance = nextProps.peaksInstance,
          segment = nextProps.segment,
          isTyping = nextProps.isTyping,
          isDragging = nextProps.isDragging,
          isInitializing = nextProps.isInitializing,
          startTimeChanged = nextProps.startTimeChanged;

      if (!isDragging && isInitializing && !isTyping && !(0, _lodash.isEmpty)(segment)) {
        var startTime = segment.startTime,
            endTime = segment.endTime;
        return {
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        };
      }

      if (isDragging) {
        // When handles in waveform are dragged clear out isInitializing and isTyping flags
        isInitializing ? nextProps.setIsInitializing(0) : null;
        isTyping ? nextProps.setIsTyping(0) : null;

        if (prevState.peaksInstance !== peaksInstance) {
          var _waveformUtils$valida = waveformUtils.validateSegment(segment, startTimeChanged, peaksInstance.peaks, peaksInstance.duration),
              _startTime = _waveformUtils$valida.startTime,
              _endTime = _waveformUtils$valida.endTime;

          return {
            beginTime: structuralMetadataUtils.toHHmmss(_startTime),
            endTime: structuralMetadataUtils.toHHmmss(_endTime)
          };
        }
      }

      return null;
    }
  }]);
  return TimespanInlineForm;
}(_react.Component);

(0, _defineProperty2["default"])(TimespanInlineForm, "propTypes", {
  item: _propTypes["default"].object,
  cancelFn: _propTypes["default"].func,
  saveFn: _propTypes["default"].func
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment,
    isDragging: state.peaksInstance.isDragging,
    startTimeChanged: state.peaksInstance.startTimeChanged
  };
};

var mapDispatchToProps = {
  activateSegment: peaksActions.activateSegment,
  insertPlaceholderSegment: peaksActions.insertPlaceholderSegment,
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  dragSegment: peaksActions.dragSegment
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanInlineForm);

exports["default"] = _default;