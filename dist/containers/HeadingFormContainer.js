"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _HeadingForm = _interopRequireDefault(require("../components/HeadingForm"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _smeHooks = require("../services/sme-hooks");
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var HeadingFormContainer = function HeadingFormContainer(_ref) {
  var cancelClick = _ref.cancelClick;
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateStructure = _useStructureUpdate.updateStructure;
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

      // Update redux store via custom hook
      updateStructure(updatedSmData);

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