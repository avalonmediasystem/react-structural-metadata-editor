"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRedux = require("react-redux");
var _Alert = _interopRequireDefault(require("react-bootstrap/Alert"));
function AlertContainer(_ref) {
  var removeAlert = _ref.removeAlert;
  var alertList = [];
  var alertMessage = [];

  // State variables from global redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.forms;
    }),
    alerts = _useSelector.alerts;
  if (alerts && alerts.length != 0) {
    alerts.map(function (alert) {
      var alertStyle = alert.alertStyle,
        message = alert.message,
        persistent = alert.persistent,
        id = alert.id;
      if (!alertMessage.includes(message)) {
        alertMessage.push(message);
        if (!persistent) {
          alertList.push(/*#__PURE__*/_react["default"].createElement(_Alert["default"], {
            key: id,
            variant: alertStyle,
            "data-testid": "alert-container",
            onClose: function onClose() {
              removeAlert(id);
            },
            dismissible: true
          }, /*#__PURE__*/_react["default"].createElement("p", {
            "data-testid": "alert-message"
          }, message)));
        } else {
          alertList.push(/*#__PURE__*/_react["default"].createElement(_Alert["default"], {
            key: id,
            variant: alertStyle,
            "data-testid": "persistent-alert-container"
          }, /*#__PURE__*/_react["default"].createElement("p", {
            "data-testid": "alert-message"
          }, message)));
        }
      }
    });
  }
  if (alerts) {
    return /*#__PURE__*/_react["default"].createElement("div", null, alertList);
  } else {
    return null;
  }
}
var _default = exports["default"] = AlertContainer;