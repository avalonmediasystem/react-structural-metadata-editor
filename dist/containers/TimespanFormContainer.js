"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _TimespanForm = _interopRequireDefault(require("../components/TimespanForm"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var smActions = _interopRequireWildcard(require("../actions/sm-data"));
var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));
var _excluded = ["cancelClick"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var TimespanFormContainer = function TimespanFormContainer(_ref) {
  var _restProps$initSegmen, _restProps$initSegmen2;
  var cancelClick = _ref.cancelClick,
    restProps = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  // Dispatch actions from Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var updateSMUI = function updateSMUI(data, duration) {
    return dispatch(smActions.reBuildSMUI(data, duration));
  };
  var addNewSegment = function addNewSegment(newSpan) {
    return dispatch(peaksActions.insertNewSegment(newSpan));
  };

  // State variables from Redux store
  var smData = (0, _reactRedux.useSelector)(function (state) {
    return state.structuralMetadata.smData;
  });
  var duration = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance.duration;
  });
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    isTyping = _useState2[0],
    _setIsTyping = _useState2[1];
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  var submit = function submit(values) {
    try {
      // Update the data structure with new heading
      var _structuralMetadataUt = structuralMetadataUtils.insertNewTimespan(values, smData),
        newSpan = _structuralMetadataUt.newSpan,
        updatedData = _structuralMetadataUt.updatedData;

      // Update the waveform segments with new timespan
      addNewSegment(newSpan);

      // Update redux store
      updateSMUI(updatedData, duration);

      // Close the form
      cancelClick();
    } catch (error) {
      showBoundary(error);
    }
  };
  var setIsTyping = function setIsTyping(value) {
    if (value === 1) {
      _setIsTyping(true);
    } else {
      _setIsTyping(false);
    }
  };
  return /*#__PURE__*/_react["default"].createElement(_TimespanForm["default"], (0, _extends2["default"])({}, restProps, {
    // Unique id for re-rendering each time a new timespan form is opened
    key: (_restProps$initSegmen = (_restProps$initSegmen2 = restProps.initSegment) === null || _restProps$initSegmen2 === void 0 ? void 0 : _restProps$initSegmen2._pid) !== null && _restProps$initSegmen !== void 0 ? _restProps$initSegmen : Math.random(),
    cancelClick: cancelClick,
    setIsTyping: setIsTyping,
    isTyping: isTyping,
    onSubmit: submit
  }));
};
TimespanFormContainer.propTypes = {
  cancelClick: _propTypes["default"].func.isRequired,
  initSegment: _propTypes["default"].object,
  isInitializing: _propTypes["default"].bool,
  setIsInitializing: _propTypes["default"].func
};
var _default = exports["default"] = TimespanFormContainer;