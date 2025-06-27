"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactErrorBoundary = require("react-error-boundary");
var _reactBootstrap = require("react-bootstrap");
function Fallback(_ref) {
  var resetErrorBoundary = _ref.resetErrorBoundary;
  return /*#__PURE__*/_react["default"].createElement("div", {
    role: "alert",
    className: "error-message-alert"
  }, /*#__PURE__*/_react["default"].createElement("span", null, "An error was encountered. Please try again."), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "primary",
    onClick: resetErrorBoundary
  }, "Try again"));
}
var ErrorMessage = function ErrorMessage(_ref2) {
  var children = _ref2.children;
  return /*#__PURE__*/_react["default"].createElement(_reactErrorBoundary.ErrorBoundary, {
    FallbackComponent: Fallback
  }, children);
};
ErrorMessage.propTypes = {
  children: _propTypes["default"].object
};
var _default = exports["default"] = ErrorMessage;