"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDnd = require("react-dnd");

var _reactDndHtml5Backend = _interopRequireDefault(require("react-dnd-html5-backend"));

var _reactRedux = require("react-redux");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ErrorBoundary = _interopRequireDefault(require("./components/ErrorBoundary"));

var _AlertContainer = _interopRequireDefault(require("./containers/AlertContainer"));

var _WaveformContainer = _interopRequireDefault(require("./containers/WaveformContainer"));

var _ButtonSection = _interopRequireDefault(require("./components/ButtonSection"));

var _StructureOutputContainer = _interopRequireDefault(require("./containers/StructureOutputContainer"));

var _actions = require("./actions");

var _forms = require("./actions/forms");

var _manifest = require("./actions/manifest");

require("./App.css");

var App = function App(props) {
  var dispatch = (0, _reactRedux.useDispatch)();

  _react["default"].useEffect(function () {
    var canvasIndex = props.canvasIndex,
        initStructure = props.initStructure,
        manifestURL = props.manifestURL;
    dispatch((0, _manifest.fetchManifest)(manifestURL, initStructure, canvasIndex));
    return function () {
      dispatch((0, _actions.resetReduxStore)());
    };
  }, []);

  return /*#__PURE__*/_react["default"].createElement(_reactDnd.DragDropContextProvider, {
    backend: _reactDndHtml5Backend["default"],
    key: 1
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "sme-container"
  }, /*#__PURE__*/_react["default"].createElement(_WaveformContainer["default"], props), /*#__PURE__*/_react["default"].createElement(_ErrorBoundary["default"], null, /*#__PURE__*/_react["default"].createElement(_AlertContainer["default"], {
    removeAlert: _forms.removeAlert
  }), /*#__PURE__*/_react["default"].createElement(_ButtonSection["default"], null), /*#__PURE__*/_react["default"].createElement(_StructureOutputContainer["default"], props))));
};

App.propTypes = {
  canvasIndex: _propTypes["default"].number.isRequired,
  manifestURL: _propTypes["default"].string.isRequired,
  initStructure: _propTypes["default"].object,
  withCredentials: _propTypes["default"].bool,
  structureIsSaved: _propTypes["default"].func
};
App.defaultProps = {
  withCredentials: false,
  structureIsSaved: function structureIsSaved(val) {}
};
var _default = App;
exports["default"] = _default;