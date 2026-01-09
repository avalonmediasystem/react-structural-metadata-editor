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
var _peaksInstance = require("../actions/peaks-instance");
var _smeHooks = require("../services/sme-hooks");
var _excluded = ["cancelClick"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var TimespanFormContainer = function TimespanFormContainer(_ref) {
  var _restProps$initSegmen, _restProps$initSegmen2;
  var cancelClick = _ref.cancelClick,
    restProps = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  // Dispatch actions from Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var addNewSegment = function addNewSegment(newSpan) {
    return dispatch((0, _peaksInstance.insertNewSegment)(newSpan));
  };
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateStructure = _useStructureUpdate.updateStructure;

  // State variables from Redux store
  var smData = (0, _reactRedux.useSelector)(function (state) {
    return state.structuralMetadata.smData;
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

      // Update redux store via custom hook
      updateStructure(updatedData);

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