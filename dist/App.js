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
var _ButtonSection = _interopRequireDefault(require("./components/ButtonSection"));
var _StructureOutputContainer = _interopRequireDefault(require("./containers/StructureOutputContainer"));
var _reactDnd = require("react-dnd");
var _reactDndHtml5Backend = require("react-dnd-html5-backend");
var _reactRedux = require("react-redux");
var _actions = require("./actions");
var _forms = require("./actions/forms");
var _AlertContainer = _interopRequireDefault(require("./containers/AlertContainer"));
var _ErrorMessage = _interopRequireDefault(require("./components/ErrorMessage"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
  }), /*#__PURE__*/_react["default"].createElement(_ButtonSection["default"], null), /*#__PURE__*/_react["default"].createElement(_ErrorMessage["default"], null, /*#__PURE__*/_react["default"].createElement(_reactDnd.DndProvider, {
    backend: _reactDndHtml5Backend.HTML5Backend
  }, /*#__PURE__*/_react["default"].createElement(_StructureOutputContainer["default"], props)))));
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
  disableSave: _propTypes["default"].bool
};
var _default = exports["default"] = App;