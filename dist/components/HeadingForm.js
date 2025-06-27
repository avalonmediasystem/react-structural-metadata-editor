"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _ButtonToolbar = _interopRequireDefault(require("react-bootstrap/ButtonToolbar"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _Form = _interopRequireDefault(require("react-bootstrap/Form"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _formHelper = require("../services/form-helper");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var HeadingForm = function HeadingForm(_ref) {
  var cancelClick = _ref.cancelClick,
    onSubmit = _ref.onSubmit;
  // State variables from Redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useState = (0, _react.useState)(''),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    headingTitle = _useState2[0],
    setHeadingTitle = _useState2[1];
  var _useState3 = (0, _react.useState)(''),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    headingChildOf = _useState4[0],
    setHeadingChildOf = _useState4[1];
  var _useState5 = (0, _react.useState)([]),
    _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
    childOfOptions = _useState6[0],
    setChildOfOptions = _useState6[1];
  (0, _react.useEffect)(function () {
    if ((smData === null || smData === void 0 ? void 0 : smData.length) > 0) {
      processOptions();
    }
  }, [smData]);
  var processOptions = function processOptions() {
    var options = getOptions();
    setChildOfOptions((0, _toConsumableArray2["default"])(options));
  };
  var clearFormValues = function clearFormValues() {
    setHeadingTitle('');
    setHeadingChildOf('');
    setChildOfOptions([]);
  };
  var formIsValid = function formIsValid() {
    var titleValid = headingTitle && headingTitle.length > 2;
    var childOfValid = headingChildOf.length > 0;
    return titleValid && childOfValid;
  };
  var getOptions = function getOptions() {
    var rootHeader = structuralMetadataUtils.getItemsOfType('root', smData);
    var divHeaders = structuralMetadataUtils.getItemsOfType('div', smData);
    var allHeaders = rootHeader.concat(divHeaders);
    var options = allHeaders.map(function (header) {
      return /*#__PURE__*/_react["default"].createElement("option", {
        value: header.id,
        key: header.id
      }, header.label);
    });
    return options;
  };
  var handleChildOfChange = function handleChildOfChange(e) {
    setHeadingChildOf(e.target.value);
  };
  var handleHeadingChange = function handleHeadingChange(e) {
    setHeadingTitle(e.target.value);
  };
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      headingChildOf: headingChildOf,
      headingTitle: headingTitle
    });

    // Clear form
    clearFormValues();
  };
  return /*#__PURE__*/_react["default"].createElement(_Form["default"], {
    onSubmit: handleSubmit,
    "data-testid": "heading-form",
    className: "mb-0"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "headingTitle",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
    type: "text",
    value: headingTitle,
    isValid: (0, _formHelper.getValidationTitleState)(headingTitle),
    isInvalid: !(0, _formHelper.getValidationTitleState)(headingTitle),
    onChange: handleHeadingChange,
    "data-testid": "heading-title-form-control"
  }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null)), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "headingChildOf",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Child Of"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Select, {
    onChange: handleChildOfChange,
    value: headingChildOf
  }, /*#__PURE__*/_react["default"].createElement("option", {
    value: ""
  }, "Select..."), childOfOptions)), /*#__PURE__*/_react["default"].createElement(_Row["default"], null, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: {
      offset: 5
    },
    md: {
      offset: 5
    },
    lg: {
      offset: 10
    }
  }, /*#__PURE__*/_react["default"].createElement(_ButtonToolbar["default"], {
    className: "float-right"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    className: "mr-1",
    onClick: cancelClick,
    "data-testid": "heading-form-cancel-button"
  }, "Cancel"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "primary",
    type: "submit",
    disabled: !formIsValid(),
    "data-testid": "heading-form-save-button"
  }, "Save")))));
};
HeadingForm.propTypes = {
  cancelClick: _propTypes["default"].func,
  onSubmit: _propTypes["default"].func
};
var _default = exports["default"] = HeadingForm;