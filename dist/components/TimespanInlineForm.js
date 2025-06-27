"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Form = _interopRequireDefault(require("react-bootstrap/Form"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _formHelper = require("../services/form-helper");
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _lodash = require("lodash");
var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));
var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));
var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformUtils = new _WaveformDataUtils["default"]();
var styles = {
  formControl: {
    margin: '0 5px'
  }
};
function TimespanInlineForm(_ref) {
  var cancelFn = _ref.cancelFn,
    item = _ref.item,
    isInitializing = _ref.isInitializing,
    isTyping = _ref.isTyping,
    saveFn = _ref.saveFn,
    setIsInitializing = _ref.setIsInitializing,
    setIsTyping = _ref.setIsTyping;
  // State variables from global state
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var peaksInstance = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance;
  });
  var isDragging = peaksInstance.isDragging,
    segment = peaksInstance.segment,
    startTimeChanged = peaksInstance.startTimeChanged;

  // Dispatch actions
  var dispatch = (0, _reactRedux.useDispatch)();
  var activateSegment = function activateSegment(id) {
    return dispatch(peaksActions.activateSegment(id));
  };
  var insertPlaceholderSegment = function insertPlaceholderSegment(item, wrapperSpans) {
    return dispatch(peaksActions.insertPlaceholderSegment(item, wrapperSpans));
  };
  var revertSegment = function revertSegment(segment) {
    return dispatch(peaksActions.revertSegment(segment));
  };
  var saveSegment = function saveSegment(state) {
    return dispatch(peaksActions.saveSegment(state));
  };
  var updateSegment = function updateSegment(segment, state) {
    return dispatch(peaksActions.updateSegment(segment, state));
  };
  var dragSegment = function dragSegment(id, startTimeChanged, value) {
    return dispatch(peaksActions.dragSegment(id, startTimeChanged, value));
  };
  var _useState = (0, _react.useState)(''),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    beginTime = _useState2[0],
    setBeginTime = _useState2[1];
  var _useState3 = (0, _react.useState)(''),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    endTime = _useState4[0],
    setEndTime = _useState4[1];
  var _useState5 = (0, _react.useState)(''),
    _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
    timespanTitle = _useState6[0],
    setTimespanTitle = _useState6[1];
  var _useState7 = (0, _react.useState)({}),
    _useState8 = (0, _slicedToArray2["default"])(_useState7, 2),
    clonedSegment = _useState8[0],
    setClonedSegment = _useState8[1];
  var tempSmDataRef = (0, _react.useRef)();
  var allSpansRef = (0, _react.useRef)([]);
  (0, _react.useEffect)(function () {
    // Get a fresh copy of store data
    tempSmDataRef.current = (0, _lodash.cloneDeep)(smData);
    var tempPeaks = (0, _lodash.cloneDeep)(peaksInstance.peaks);

    // Make segment related to timespan editable
    if (item.valid) {
      // Load existing form values
      var formValues = (0, _formHelper.getExistingFormValues)(item.id, tempSmDataRef.current, tempPeaks);
      setBeginTime(formValues.beginTime);
      setEndTime(formValues.endTime);
      setTimespanTitle(formValues.timespanTitle);
      setClonedSegment(formValues.clonedSegment);
      activateSegment(item.id);
    } else {
      handleInvalidTimespan();
    }

    // Remove current list item from the data we're doing validation against in this form
    tempSmDataRef.current = structuralMetadataUtils.deleteListItem(item.id, tempSmDataRef.current);

    // Save a reference to all the spans for future calculations
    allSpansRef.current = structuralMetadataUtils.getItemsOfType('span', tempSmDataRef.current);

    // Get segment from current peaks instance
    var currentSegment = peaksInstance.peaks.segments.getSegment(item.id);

    // Initialize the segment in Redux store with the selected item
    dragSegment(currentSegment.id, startTimeChanged, 0);
  }, []);
  (0, _react.useEffect)(function () {
    if (!isDragging && isInitializing && !isTyping && !(0, _lodash.isEmpty)(segment)) {
      var startTime = segment.startTime,
        _endTime = segment.endTime;
      setBeginTime(structuralMetadataUtils.toHHmmss(startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(_endTime));
    }
    if (isDragging) {
      // When handles in waveform are dragged clear out isInitializing and isTyping flags
      if (isInitializing) setIsInitializing(0);
      if (isTyping) setIsTyping(0);
      var _waveformUtils$valida = waveformUtils.validateSegment(segment, startTimeChanged, peaksInstance.peaks, peaksInstance.duration),
        _startTime = _waveformUtils$valida.startTime,
        _endTime2 = _waveformUtils$valida.endTime;
      setBeginTime(structuralMetadataUtils.toHHmmss(_startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(_endTime2));
    }
  }, [isDragging, isInitializing, isTyping, segment, peaksInstance]);

  /**
   * When there are invalid timespans in the structure, to edit them
   * a placeholder segment is created within the Peaks instance, since
   * they cannot be added at the time Peaks is initialized.
   */
  var handleInvalidTimespan = function handleInvalidTimespan() {
    var itemIndex = structuralMetadataUtils.getItemsOfType('span', smData).findIndex(function (i) {
      return i.id === item.id;
    });
    var allSpans = structuralMetadataUtils.getItemsOfType('span', tempSmDataRef.current);
    var wrapperSpans = {
      prevSpan: null,
      nextSpan: null
    };
    wrapperSpans.prevSpan = allSpans[itemIndex - 1] || null;
    wrapperSpans.nextSpan = allSpans[itemIndex + 1] || null;
    insertPlaceholderSegment(item, wrapperSpans);
    var placeholderSegment = peaksInstance.peaks.segments.getSegment(item.id);
    placeholderSegment.valid = false;
    setClonedSegment(placeholderSegment);
    setBeginTime(structuralMetadataUtils.toHHmmss(placeholderSegment.startTime));
    setEndTime(structuralMetadataUtils.toHHmmss(placeholderSegment.endTime));
    setTimespanTitle(placeholderSegment.labelText);
  };
  var formIsValid = function formIsValid() {
    var titleValid = (0, _formHelper.isTitleValid)(timespanTitle);
    var timesValidResponse = (0, _formHelper.validTimespans)(beginTime, endTime, peaksInstance.duration, allSpansRef.current);
    return titleValid && timesValidResponse.valid;
  };
  var handleCancelClick = function handleCancelClick() {
    // Revert to segment to the state prior to editing
    revertSegment(clonedSegment);
    cancelFn();
  };
  var handleInputChange = function handleInputChange(e) {
    // Lock disabling isTyping flag before updating DOM from form inputs
    dragSegment(segment.id, startTimeChanged, 0);
    // Enable updating state from form inputs
    setIsTyping(1);
    var _e$target = e.target,
      id = _e$target.id,
      value = _e$target.value;
    if (id === 'timespanTitle') {
      setTimespanTitle(value);
    } else if (id === 'beginTime') {
      setBeginTime(value);
    } else if (id === 'endTime') {
      setEndTime(value);
    }

    // Update waveform segment with user inputs in the form
    updateSegment(segment, {
      beginTime: id === 'beginTime' ? value : beginTime,
      endTime: id === 'endTime' ? value : endTime,
      timespanTitle: id === 'timespanTitle' ? value : timespanTitle
    });
  };
  var handleSaveClick = function handleSaveClick() {
    saveSegment({
      beginTime: beginTime,
      endTime: endTime,
      timespanTitle: timespanTitle,
      clonedSegment: clonedSegment
    });
    saveFn(segment.id, {
      beginTime: beginTime,
      endTime: endTime,
      timespanTitle: timespanTitle
    });
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "row-wrapper d-flex justify-content-between gap-5 px-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"], {
    "data-testid": "timespan-inline-form",
    className: "mb-0 d-flex gap-4 flex-wrap flex-lg-nowrap no-gutters"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    as: _Row["default"],
    controlId: "timespanTitle",
    className: "ml-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, {
    column: true,
    sm: 2,
    md: 3
  }, "Title"), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 10,
    md: 9,
    className: "px-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    style: styles.formControl,
    value: timespanTitle,
    isValid: (0, _formHelper.getValidationTitleState)(timespanTitle),
    isInvalid: !(0, _formHelper.getValidationTitleState)(timespanTitle),
    onChange: handleInputChange,
    "data-testid": "timespan-inline-form-title",
    className: "mx-0"
  }))), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    as: _Row["default"],
    controlId: "beginTime",
    className: "ml-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, {
    column: true,
    sm: 2,
    md: 3
  }, "Begin"), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 10,
    md: 9,
    className: "px-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    as: "input",
    style: styles.formControl,
    value: beginTime,
    onChange: handleInputChange,
    isValid: (0, _formHelper.getValidationBeginState)(beginTime, allSpansRef.current),
    isInvalid: !(0, _formHelper.getValidationBeginState)(beginTime, allSpansRef.current),
    "data-testid": "timespan-inline-form-begintime",
    className: "mx-0"
  }))), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    as: _Row["default"],
    controlId: "endTime",
    className: "ml-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, {
    column: true,
    sm: 2,
    md: 3
  }, "End"), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 10,
    md: 9,
    className: "px-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    style: styles.formControl,
    value: endTime,
    isValid: (0, _formHelper.getValidationEndState)(beginTime, endTime, allSpansRef.current, peaksInstance.duration),
    isInvalid: !(0, _formHelper.getValidationEndState)(beginTime, endTime, allSpansRef.current, peaksInstance.duration),
    onChange: handleInputChange,
    "data-testid": "timespan-inline-form-endtime",
    className: "mx-0"
  })))), /*#__PURE__*/_react["default"].createElement(_ListItemInlineEditControls["default"], {
    formIsValid: formIsValid(),
    handleSaveClick: handleSaveClick,
    handleCancelClick: handleCancelClick
  }));
}
TimespanInlineForm.propTypes = {
  item: _propTypes["default"].object,
  cancelFn: _propTypes["default"].func,
  saveFn: _propTypes["default"].func,
  setIsTyping: _propTypes["default"].func,
  isTyping: _propTypes["default"].bool,
  isInitializing: _propTypes["default"].bool,
  setIsInitializing: _propTypes["default"].func
};
var _default = exports["default"] = TimespanInlineForm;