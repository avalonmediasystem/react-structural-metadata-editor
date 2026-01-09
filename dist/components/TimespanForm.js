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
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _ButtonToolbar = _interopRequireDefault(require("react-bootstrap/ButtonToolbar"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _Form = _interopRequireDefault(require("react-bootstrap/Form"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _formHelper = require("../services/form-helper");
var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));
var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));
var _smeHooks = require("../services/sme-hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformDataUtils = new _WaveformDataUtils["default"]();
var TimespanForm = function TimespanForm(_ref) {
  var cancelClick = _ref.cancelClick,
    initSegment = _ref.initSegment,
    isInitializing = _ref.isInitializing,
    isTyping = _ref.isTyping,
    onSubmit = _ref.onSubmit,
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
  var duration = peaksInstance.duration,
    isDragging = peaksInstance.isDragging,
    segment = peaksInstance.segment,
    startTimeChanged = peaksInstance.startTimeChanged;

  // Dispatch actions
  var dispatch = (0, _reactRedux.useDispatch)();
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
    timespanChildOf = _useState6[0],
    setTimespanChildOf = _useState6[1];
  var _useState7 = (0, _react.useState)(''),
    _useState8 = (0, _slicedToArray2["default"])(_useState7, 2),
    timespanTitle = _useState8[0],
    setTimespanTitle = _useState8[1];
  var _useState9 = (0, _react.useState)([]),
    _useState0 = (0, _slicedToArray2["default"])(_useState9, 2),
    validHeadings = _useState0[0],
    setValidHeadings = _useState0[1];

  // Update beginTime and endTime on load
  (0, _react.useEffect)(function () {
    if (initSegment) {
      setBeginTime(structuralMetadataUtils.toHHmmss(initSegment.startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(initSegment.endTime));
    }
  }, [initSegment]);

  // Find neighboring timespans of the currently editing timespan
  var _useFindNeighborSegme = (0, _smeHooks.useFindNeighborSegments)({
      segment: segment
    }),
    prevSiblingRef = _useFindNeighborSegme.prevSiblingRef,
    nextSiblingRef = _useFindNeighborSegme.nextSiblingRef,
    parentTimespanRef = _useFindNeighborSegme.parentTimespanRef;

  // Validate timespan form when editing
  var _useTimespanFormValid = (0, _smeHooks.useTimespanFormValidation)({
      beginTime: beginTime,
      endTime: endTime,
      neighbors: {
        prevSiblingRef: prevSiblingRef,
        nextSiblingRef: nextSiblingRef,
        parentTimespanRef: parentTimespanRef
      },
      timespanTitle: timespanTitle
    }),
    formIsValid = _useTimespanFormValid.formIsValid,
    isBeginValid = _useTimespanFormValid.isBeginValid,
    isEndValid = _useTimespanFormValid.isEndValid;
  var buildHeadingsOptions = function buildHeadingsOptions() {
    var newSpan = {
      begin: beginTime,
      end: endTime
    };

    // Build wrapperSpans from sibling timespans
    var wrapperSpans = {
      before: prevSiblingRef.current,
      after: nextSiblingRef.current
    };

    // Get all valid div headings and potential parent timespans
    var validHeadings = structuralMetadataUtils.getValidParents(newSpan, wrapperSpans, smData, parentTimespanRef.current);

    // Update state with valid headings
    setValidHeadings(validHeadings);
  };
  var isValidTimespan = (0, _react.useMemo)(function () {
    var _validTimespans = (0, _formHelper.validTimespans)(beginTime, endTime, duration),
      valid = _validTimespans.valid;
    if (valid) {
      buildHeadingsOptions();
    } else {
      setValidHeadings([]);
    }
    return valid;
  }, [beginTime, endTime, duration]);
  (0, _react.useEffect)(function () {
    if (!isTyping) {
      if (initSegment && isInitializing) {
        // Set isInitializing flag to false
        setIsInitializing(false);
        validateSegmentInPeaks();
      }
    }
    if (isDragging) {
      setIsTyping(0);
      validateSegmentInPeaks();
    }
  }, [initSegment, isDragging, isInitializing, peaksInstance]);
  var validateSegmentInPeaks = function validateSegmentInPeaks() {
    var _waveformDataUtils$va = waveformDataUtils.validateSegment(segment, startTimeChanged, duration, {
        previousSibling: prevSiblingRef.current,
        nextSibling: nextSiblingRef.current,
        parentTimespan: parentTimespanRef.current
      }),
      startTime = _waveformDataUtils$va.startTime,
      endTime = _waveformDataUtils$va.endTime;
    setBeginTime(structuralMetadataUtils.toHHmmss(startTime));
    setEndTime(structuralMetadataUtils.toHHmmss(endTime));
  };
  var clearFormValues = function clearFormValues() {
    setBeginTime('');
    setEndTime('');
    setTimespanChildOf('');
    setTimespanTitle('');
    setValidHeadings([]);
    // Reset isTyping flag
    setIsTyping(0);
  };
  var handleInputChange = function handleInputChange(e) {
    setTimespanTitle(e.target.value);
  };
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    cancelClick();
    onSubmit({
      beginTime: beginTime,
      endTime: endTime,
      timespanChildOf: timespanChildOf,
      timespanTitle: timespanTitle
    });

    // Clear form values
    clearFormValues();
  };

  /**
   * Set begin and end time and call handleTimeChange to update peaks
   * segement. This is a reusable function to update the begin and end time
   * of the segment when the user changes times in the form.
   * @param {Object} obj
   * @param {string} obj.start changed/existing start time
   * @param {string} obj.end changed/existing end time
   */
  var handleTimeChange = function handleTimeChange(_ref2) {
    var start = _ref2.start,
      end = _ref2.end;
    // Lock setting isTyping to false before updating the DOM
    dragSegment(segment.id, startTimeChanged, 0);

    // Set isTyping flag in props to true
    setIsTyping(1);
    if (isValidTimespan) {
      updateSegment(segment, {
        beginTime: start,
        endTime: end
      });
    }
  };

  /**
   * Set end time and call handleTimeChange to update peaks
   * segement. This event is triggered when the user types in the
   * input field for end time.
   * @param {Event} e 
   */
  var handleEndTimeChange = function handleEndTimeChange(e) {
    setEndTime(e.target.value);
    handleTimeChange({
      start: beginTime,
      end: e.target.value
    });
  };

  /**
   * Set begin time and call handleTimeChange to update peaks
   * segement. This event is triggered when the user types in the
   * input field for begin time.
   * @param {Event} e 
   */
  var handleBeginTimeChange = function handleBeginTimeChange(e) {
    setBeginTime(e.target.value);
    handleTimeChange({
      start: e.target.value,
      end: endTime
    });
  };
  var handleCancelClick = function handleCancelClick() {
    cancelClick();
    setIsTyping(0);
  };
  var handleChildOfChange = function handleChildOfChange(e) {
    setTimespanChildOf(e.target.value);
  };
  return /*#__PURE__*/_react["default"].createElement(_Form["default"], {
    onSubmit: handleSubmit,
    "data-testid": "timespan-form",
    className: "mb-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "timespanTitle"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    value: timespanTitle,
    isValid: (0, _formHelper.isTitleValid)(timespanTitle),
    isInvalid: !(0, _formHelper.isTitleValid)(timespanTitle),
    onChange: handleInputChange,
    "data-testid": "timespan-form-title"
  }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null)), /*#__PURE__*/_react["default"].createElement(_Row["default"], null, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 6
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "beginTime",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Begin Time"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    value: beginTime,
    isValid: isBeginValid,
    isInvalid: !isBeginValid,
    placeholder: "00:00:00",
    onChange: handleBeginTimeChange,
    "data-testid": "timespan-form-begintime"
  }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null))), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 6
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "endTime",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "End Time"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    value: endTime,
    isValid: isEndValid,
    isInvalid: !isEndValid,
    placeholder: "00:00:00",
    onChange: handleEndTimeChange,
    "data-testid": "timespan-form-endtime"
  }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null)))), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "timespanChildOf",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Child Of"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Select, {
    onChange: handleChildOfChange,
    value: timespanChildOf,
    "data-testid": "timespan-form-childof"
  }, /*#__PURE__*/_react["default"].createElement("option", {
    value: ""
  }, "Select..."), validHeadings.map(function (item) {
    return /*#__PURE__*/_react["default"].createElement("option", {
      value: item.id,
      key: item.id
    }, item.label);
  }))), /*#__PURE__*/_react["default"].createElement(_Row["default"], null, /*#__PURE__*/_react["default"].createElement(_Col["default"], null, /*#__PURE__*/_react["default"].createElement(_ButtonToolbar["default"], {
    className: "float-end"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    className: "me-1",
    onClick: handleCancelClick,
    "data-testid": "timespan-form-cancel-button"
  }, "Cancel"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "primary",
    type: "submit",
    disabled: !(formIsValid && timespanChildOf.length > 0),
    "data-testid": "timespan-form-save-button"
  }, "Save")))));
};
TimespanForm.propTypes = {
  cancelClick: _propTypes["default"].func,
  initSegment: _propTypes["default"].object,
  isInitializing: _propTypes["default"].bool,
  isTyping: _propTypes["default"].bool,
  onSubmit: _propTypes["default"].func,
  timespanOpen: _propTypes["default"].bool,
  setIsInitializing: _propTypes["default"].func,
  setIsTyping: _propTypes["default"].func
};
var _default = exports["default"] = TimespanForm;