"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _HeadingForm = _interopRequireDefault(require("../components/HeadingForm"));
var _reactRedux = require("react-redux");
var smActions = _interopRequireWildcard(require("../actions/sm-data"));
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var HeadingFormContainer = function HeadingFormContainer(_ref) {
  var cancelClick = _ref.cancelClick;
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useSelector2 = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    duration = _useSelector2.duration;
  var dispatch = (0, _reactRedux.useDispatch)();
  var updateSMData = function updateSMData(updatedData, duration) {
    return dispatch(smActions.reBuildSMUI(updatedData, duration));
  };
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  var submit = function submit(values) {
    try {
      var submittedItem = {
        headingChildOf: values.headingChildOf,
        headingTitle: values.headingTitle
      };
      var updatedSmData = null;

      // Update the data structure with new heading
      updatedSmData = structuralMetadataUtils.insertNewHeader(submittedItem, smData);

      // Update redux store
      updateSMData(updatedSmData, duration);

      // Close the form
      cancelClick();
    } catch (error) {
      showBoundary(error);
    }
  };
  return /*#__PURE__*/_react["default"].createElement(_HeadingForm["default"], {
    onSubmit: submit,
    cancelClick: cancelClick
  });
};
HeadingFormContainer.propTypes = {
  cancelClick: _propTypes["default"].func.isRequired
};
var _default = exports["default"] = HeadingFormContainer;