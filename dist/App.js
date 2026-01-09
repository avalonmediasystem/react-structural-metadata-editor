"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
require("./App.css");
var _WaveformContainer = _interopRequireDefault(require("./containers/WaveformContainer"));
var _StructureTabView = _interopRequireDefault(require("./containers/StructureTabView"));
var _reactDnd = require("react-dnd");
var _reactDndHtml5Backend = require("react-dnd-html5-backend");
var _reactRedux = require("react-redux");
var _actions = require("./actions");
var _forms = require("./actions/forms");
var _AlertContainer = _interopRequireDefault(require("./containers/AlertContainer"));
var _ErrorMessage = _interopRequireDefault(require("./components/ErrorMessage"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var App = function App(props) {
  // Dispatch actions from Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var resetStore = function resetStore() {
    return dispatch((0, _actions.resetReduxStore)());
  };
  var deleteAlert = function deleteAlert() {
    return dispatch((0, _forms.removeAlert)());
  };
  (0, _react.useEffect)(function () {
    return function () {
      // Reset the redux-store
      resetStore();
    };
  }, []);
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "sme-container"
  }, /*#__PURE__*/_react["default"].createElement(_ErrorMessage["default"], null, /*#__PURE__*/_react["default"].createElement(_ErrorMessage["default"], null, /*#__PURE__*/_react["default"].createElement(_WaveformContainer["default"], props)), /*#__PURE__*/_react["default"].createElement(_AlertContainer["default"], {
    removeAlert: deleteAlert
  }), /*#__PURE__*/_react["default"].createElement(_ErrorMessage["default"], null, /*#__PURE__*/_react["default"].createElement(_reactDnd.DndProvider, {
    backend: _reactDndHtml5Backend.HTML5Backend
  }, /*#__PURE__*/_react["default"].createElement(_StructureTabView["default"], props)))));
};
App.defaultProps = {
  canvasIndex: 0,
  structureIsSaved: function structureIsSaved(val) {},
  withCredentials: false,
  disableSave: false
};
App.propTypes = {
  canvasIndex: _propTypes["default"].number,
  manifestURL: _propTypes["default"].string.isRequired,
  structureURL: function structureURL(props, propName) {
    if (props['disableSave'] == false && props[propName] == undefined) {
      return new Error('Please provide a value for `structureURL` prop');
    }
  },
  structureIsSaved: _propTypes["default"].func,
  withCredentials: _propTypes["default"].bool,
  disableSave: _propTypes["default"].bool,
  showTextEditor: _propTypes["default"].bool
};
var _default = exports["default"] = App;