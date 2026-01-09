"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _reactErrorBoundary = require("react-error-boundary");
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _Collapse = _interopRequireDefault(require("react-bootstrap/Collapse"));
var _HeadingFormContainer = _interopRequireDefault(require("../containers/HeadingFormContainer"));
var _TimespanFormContainer = _interopRequireDefault(require("../containers/TimespanFormContainer"));
var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));
var _alertStatus = require("../services/alert-status");
var _forms = require("../actions/forms");
var _smeHooks = require("../services/sme-hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
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
var ButtonSection = function ButtonSection() {
  // Dispatch actions to Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var createTempSegment = function createTempSegment() {
    return dispatch(peaksActions.insertTempSegment());
  };
  var removeTempSegment = function removeTempSegment(id) {
    return dispatch(peaksActions.deleteTempSegment(id));
  };
  var settingAlert = function settingAlert(alert) {
    return dispatch((0, _forms.setAlert)(alert));
  };
  var dragSegment = function dragSegment(id, startTimeChanged, flag) {
    return dispatch(peaksActions.dragSegment(id, startTimeChanged, flag));
  };
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateEditingTimespans = _useStructureUpdate.updateEditingTimespans;

  // Get state variables from Redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.forms;
    }),
    editingDisabled = _useSelector.editingDisabled,
    structureInfo = _useSelector.structureInfo,
    streamInfo = _useSelector.streamInfo;
  var _useSelector2 = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    peaks = _useSelector2.peaks;
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    headingOpen = _useState2[0],
    setHeadingOpen = _useState2[1];
  var _useState3 = (0, _react.useState)(false),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    timespanOpen = _useState4[0],
    setTimespanOpen = _useState4[1];
  var _useState5 = (0, _react.useState)(null),
    _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
    initSegment = _useState6[0],
    setInitSegment = _useState6[1];
  var _useState7 = (0, _react.useState)(true),
    _useState8 = (0, _slicedToArray2["default"])(_useState7, 2),
    isInitializing = _useState8[0],
    setIsInitializing = _useState8[1];
  var _useState9 = (0, _react.useState)(true),
    _useState0 = (0, _slicedToArray2["default"])(_useState9, 2),
    disabled = _useState0[0],
    setDisabled = _useState0[1];
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  var handleCancelHeadingClick = function handleCancelHeadingClick() {
    setHeadingOpen(false);
    updateEditingTimespans(0);
  };
  var handleHeadingClick = function handleHeadingClick() {
    // If heading form is open, close it before opening timespan form
    if (timespanOpen) {
      setTimespanOpen(false);
    }

    // Disable editing other items in structure
    updateEditingTimespans(1);

    // When opening heading form, delete if a temporary segment exists
    deleteTempSegment();
    setHeadingOpen(true);
    setDisabled(false);
  };
  var handleCancelTimespanClick = function handleCancelTimespanClick() {
    deleteTempSegment();
    setTimespanOpen(false);
    updateEditingTimespans(0);
  };
  var handleTimeSpanClick = function handleTimeSpanClick() {
    // If heading form is open, close it before opening timespan form
    if (headingOpen) {
      setHeadingOpen(false);
    }

    // Disable editing other items in structure
    updateEditingTimespans(1);

    // Create a temporary segment if timespan form is opened
    if (!timespanOpen) {
      createTempSegment();
    }
    var tempSegment = peaks.segments.getSegment('temp-segment');
    try {
      if (tempSegment == undefined) {
        var noSpaceAlert = (0, _alertStatus.configureAlert)(-4);
        settingAlert(noSpaceAlert);
      } else {
        // Initialize Redux store with temporary segment
        dragSegment(tempSegment.id, null, 0);
        setInitSegment(tempSegment);
        setTimespanOpen(true);
        setIsInitializing(true);
        setDisabled(false);
      }
    } catch (error) {
      showBoundary(error);
    }
  };

  // Delete if a temporary segment exists
  var deleteTempSegment = function deleteTempSegment() {
    try {
      if (initSegment != null) {
        removeTempSegment(initSegment.id);
      }
    } catch (error) {
      showBoundary(error);
    }
  };
  var timespanFormProps = {
    cancelClick: handleCancelTimespanClick,
    initSegment: initSegment,
    isInitializing: isInitializing,
    timespanOpen: timespanOpen,
    setIsInitializing: setIsInitializing
  };

  // Only return UI when both structure and waveform data exist
  if (structureInfo.structureRetrieved) {
    return /*#__PURE__*/_react["default"].createElement("section", {
      "data-testid": "button-section"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "d-grid gap-2 button-section-container",
      "data-testid": "button-row"
    }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
      variant: "outline-secondary",
      "data-testid": "add-heading-button",
      onClick: handleHeadingClick,
      disabled: disabled && editingDisabled
    }, "Add a Heading"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
      variant: "outline-secondary",
      "data-testid": "add-timespan-button",
      onClick: handleTimeSpanClick,
      disabled: disabled && editingDisabled || streamInfo.streamMediaError
    }, "Add a Timespan")), /*#__PURE__*/_react["default"].createElement(_Collapse["default"], {
      "in": headingOpen
    }, /*#__PURE__*/_react["default"].createElement("div", {
      style: styles.well,
      "data-testid": "heading-form-wrapper"
    }, /*#__PURE__*/_react["default"].createElement(_HeadingFormContainer["default"], {
      cancelClick: handleCancelHeadingClick
    }))), /*#__PURE__*/_react["default"].createElement(_Collapse["default"], {
      "in": timespanOpen
    }, /*#__PURE__*/_react["default"].createElement("div", {
      style: styles.well,
      "data-testid": "timespan-form-wrapper"
    }, /*#__PURE__*/_react["default"].createElement(_TimespanFormContainer["default"], timespanFormProps))));
  }
};
var _default = exports["default"] = ButtonSection;