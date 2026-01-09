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
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
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
    /**
     * Only get type='span' (timespans) items with children as possible headings.
     * This helps to keep the options list smaller, but allows to add heading
     * inside timespans. These headings then can be used as drop-zones for child
     * timespans inside them.
     */
    var allHeaders = structuralMetadataUtils.getItemsOfType(['root', 'div', 'span'], smData).filter(function (h) {
      return h.type !== 'span' || h.items && h.items.length > 0;
    });
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
    isValid: (0, _formHelper.isTitleValid)(headingTitle),
    isInvalid: !(0, _formHelper.isTitleValid)(headingTitle),
    onChange: handleHeadingChange,
    "data-testid": "heading-form-title"
  }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null)), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
    controlId: "headingChildOf",
    className: "mb-3"
  }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Child Of"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Select, {
    onChange: handleChildOfChange,
    value: headingChildOf,
    "data-testid": "heading-form-childof"
  }, /*#__PURE__*/_react["default"].createElement("option", {
    value: ""
  }, "Select..."), childOfOptions)), /*#__PURE__*/_react["default"].createElement(_Row["default"], null, /*#__PURE__*/_react["default"].createElement(_Col["default"], null, /*#__PURE__*/_react["default"].createElement(_ButtonToolbar["default"], {
    className: "float-end"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    className: "me-1",
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