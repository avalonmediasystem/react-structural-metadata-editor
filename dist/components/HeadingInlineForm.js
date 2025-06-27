"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Form = _interopRequireDefault(require("react-bootstrap/Form"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _formHelper = require("../services/form-helper");
var _reactRedux = require("react-redux");
var _lodash = require("lodash");
var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var styles = {
  formControl: {
    margin: '0 5px',
    width: '300px'
  }
};
var HeadingInlineForm = function HeadingInlineForm(_ref) {
  var itemId = _ref.itemId,
    cancelFn = _ref.cancelFn,
    saveFn = _ref.saveFn;
  // State variables from Redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useState = (0, _react.useState)(''),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    headingTitle = _useState2[0],
    setHeadingTitle = _useState2[1];
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  (0, _react.useEffect)(function () {
    // Get a fresh copy of store data
    var tempSmData = (0, _lodash.cloneDeep)(smData);

    // Load existing form values
    var formValues = (0, _formHelper.getExistingFormValues)(itemId, tempSmData);
    setHeadingTitle(formValues.headingTitle);
  }, [smData]);
  var formIsValid = function formIsValid() {
    return (0, _formHelper.isTitleValid)(headingTitle);
  };
  var handleCancelClick = function handleCancelClick() {
    cancelFn();
  };
  var handleInputChange = function handleInputChange(e) {
    setHeadingTitle(e.target.value);
  };
  var handleSaveClick = function handleSaveClick() {
    try {
      saveFn(itemId, {
        headingTitle: headingTitle
      });
    } catch (error) {
      showBoundary(error);
    }
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "row-wrapper d-flex justify-content-between"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"], {
    "data-testid": "heading-inline-form",
    className: "mb-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    as: _Row["default"],
    controlId: "headingTitle"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, {
    column: true,
    sm: 2
  }, "Title"), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 10
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    style: styles.formControl,
    value: headingTitle,
    isValid: (0, _formHelper.getValidationTitleState)(headingTitle),
    isInvalid: !(0, _formHelper.getValidationTitleState)(headingTitle),
    onChange: handleInputChange,
    "data-testid": "inline-heading-title-form-control"
  })))), /*#__PURE__*/_react["default"].createElement(_ListItemInlineEditControls["default"], {
    formIsValid: formIsValid(),
    handleSaveClick: handleSaveClick,
    handleCancelClick: handleCancelClick
  }));
};
HeadingInlineForm.propTypes = {
  itemId: _propTypes["default"].string,
  cancelFn: _propTypes["default"].func,
  saveFn: _propTypes["default"].func
};
var _default = exports["default"] = HeadingInlineForm;