"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _OverlayTrigger = _interopRequireDefault(require("react-bootstrap/OverlayTrigger"));
var _Tooltip = _interopRequireDefault(require("react-bootstrap/Tooltip"));
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var ListItemInlineEditControls = function ListItemInlineEditControls(_ref) {
  var formIsValid = _ref.formIsValid,
    handleCancelClick = _ref.handleCancelClick,
    handleSaveClick = _ref.handleSaveClick;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "edit-controls-wrapper d-flex",
    "data-testid": "inline-form-controls"
  }, /*#__PURE__*/_react["default"].createElement(_OverlayTrigger["default"], {
    placement: "left",
    overlay: /*#__PURE__*/_react["default"].createElement(_Tooltip["default"], {
      id: "tooltip-save"
    }, "Save")
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "link",
    disabled: !formIsValid,
    onClick: handleSaveClick,
    "data-testid": "inline-form-save-button"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSave
  }))), /*#__PURE__*/_react["default"].createElement(_OverlayTrigger["default"], {
    placement: "left",
    overlay: /*#__PURE__*/_react["default"].createElement(_Tooltip["default"], {
      id: "tooltip-cancel"
    }, "Cancel")
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "link",
    "data-testid": "inline-form-cancel-button",
    onClick: handleCancelClick
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faMinusCircle
  }))));
};
ListItemInlineEditControls.propTypes = {
  formIsValid: _propTypes["default"].bool,
  handleSaveClick: _propTypes["default"].func,
  handleCancelClick: _propTypes["default"].func
};
var _default = exports["default"] = ListItemInlineEditControls;