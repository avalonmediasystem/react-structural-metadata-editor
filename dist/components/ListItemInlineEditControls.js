"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var tooltip = function tooltip(tip) {
  return /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Tooltip, {
    id: "tooltip"
  }, tip);
};

var ListItemInlineEditControls = function ListItemInlineEditControls(props) {
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "edit-controls-wrapper",
    "data-testid": "inline-form-controls"
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.OverlayTrigger, {
    placement: "bottom",
    overlay: tooltip('Save')
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "link",
    disabled: !props.formIsValid,
    onClick: props.handleSaveClick,
    "data-testid": "inline-form-save-button"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSave
  }))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.OverlayTrigger, {
    placement: "bottom",
    overlay: tooltip('Cancel')
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "link",
    "data-testid": "inline-form-cancel-button",
    onClick: props.handleCancelClick
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faMinusCircle
  }))));
};

ListItemInlineEditControls.propTypes = {
  formIsValid: _propTypes["default"].bool,
  handleSaveClick: _propTypes["default"].func,
  handleCancelClick: _propTypes["default"].func
};
var _default = ListItemInlineEditControls;
exports["default"] = _default;