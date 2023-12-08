"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

function AlertContainer(props) {
  var alertList = [];
  var alertMessage = [];

  if (props.alerts && props.alerts.length != 0) {
    props.alerts.map(function (alert) {
      var alertStyle = alert.alertStyle,
          message = alert.message,
          persistent = alert.persistent,
          id = alert.id;

      if (!alertMessage.includes(message)) {
        alertMessage.push(message);

        if (!persistent) {
          alertList.push( /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Alert, {
            key: id,
            variant: alertStyle,
            "data-testid": "alert-container",
            onClose: function onClose() {
              props.removeAlert(id);
            },
            dismissible: true
          }, /*#__PURE__*/_react["default"].createElement("p", {
            "data-testid": "alert-message"
          }, message)));
        } else {
          alertList.push( /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Alert, {
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

  if (props.alerts) {
    return /*#__PURE__*/_react["default"].createElement("div", null, alertList);
  } else {
    return null;
  }
}

var mapStateToProps = function mapStateToProps(state) {
  return {
    alerts: state.forms.alerts
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(AlertContainer);

exports["default"] = _default;