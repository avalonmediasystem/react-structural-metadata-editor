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

var tooltip = function tooltip(tip) {
  return _react["default"].createElement(_reactBootstrap.Tooltip, {
    id: "tooltip"
  }, tip);
};

var ListItemInlineEditControls = function ListItemInlineEditControls(props) {
  return _react["default"].createElement("div", {
    className: "edit-controls-wrapper",
    "data-testid": "inline-form-controls"
  }, _react["default"].createElement(_reactBootstrap.OverlayTrigger, {
    placement: "left",
    overlay: tooltip('Save')
  }, _react["default"].createElement(_reactBootstrap.Button, {
    bsStyle: "link",
    disabled: !props.formIsValid,
    onClick: props.handleSaveClick,
    "data-testid": "inline-form-save-button"
  }, _react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: "save"
  }))), _react["default"].createElement(_reactBootstrap.OverlayTrigger, {
    placement: "right",
    overlay: tooltip('Cancel'),
    onClick: props.handleCancelClick
  }, _react["default"].createElement(_reactBootstrap.Button, {
    bsStyle: "link",
    "data-testid": "inline-form-cancel-button"
  }, _react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: "minus-circle"
  }))));
};

ListItemInlineEditControls.propTypes = {
  formIsValid: _propTypes["default"].bool,
  handleSaveClick: _propTypes["default"].func,
  handleCancelClick: _propTypes["default"].func
};
var _default = ListItemInlineEditControls;
exports["default"] = _default;