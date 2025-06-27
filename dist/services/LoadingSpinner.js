"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var LoadingSpinner = function LoadingSpinner(_ref) {
  var isLoading = _ref.isLoading;
  return isLoading ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "loading-spinner"
  }) : null;
};
var _default = exports["default"] = LoadingSpinner;