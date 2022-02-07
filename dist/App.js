"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

require("./App.css");

var _WaveformContainer = _interopRequireDefault(require("./containers/WaveformContainer"));

var _ButtonSection = _interopRequireDefault(require("./components/ButtonSection"));

var _StructureOutputContainer = _interopRequireDefault(require("./containers/StructureOutputContainer"));

var _reactDnd = require("react-dnd");

var _reactDndHtml5Backend = _interopRequireDefault(require("react-dnd-html5-backend"));

var _reactRedux = require("react-redux");

var _actions = require("./actions");

var _forms = require("./actions/forms");

var _ErrorBoundary = _interopRequireDefault(require("./components/ErrorBoundary"));

var _fontawesomeSvgCore = require("@fortawesome/fontawesome-svg-core");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var _AlertContainer = _interopRequireDefault(require("./containers/AlertContainer"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faDotCircle, _freeSolidSvgIcons.faMinusCircle, _freeSolidSvgIcons.faPen, _freeSolidSvgIcons.faSave, _freeSolidSvgIcons.faTrash, _freeSolidSvgIcons.faExclamationTriangle);

var App = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(App, _Component);

  var _super = _createSuper(App);

  function App(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, App);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "structureIsSaved", function (value) {
      _this.props.structureIsSaved(value);
    });
    _this.state = {
      structureAlert: {}
    };
    return _this;
  } // Lifecycle method fired before unmounting the React component


  (0, _createClass2["default"])(App, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // Reset the redux-store
      this.props.resetStore();
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_reactDnd.DragDropContextProvider, {
        backend: _reactDndHtml5Backend["default"]
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "sme-container"
      }, /*#__PURE__*/_react["default"].createElement(_WaveformContainer["default"], this.props), /*#__PURE__*/_react["default"].createElement(_ErrorBoundary["default"], null, /*#__PURE__*/_react["default"].createElement(_AlertContainer["default"], {
        removeAlert: this.props.removeAlert
      }), /*#__PURE__*/_react["default"].createElement(_ButtonSection["default"], null), /*#__PURE__*/_react["default"].createElement(_StructureOutputContainer["default"], this.props))));
    }
  }]);
  return App;
}(_react.Component);

App.propTypes = {
  structureURL: _propTypes["default"].string.isRequired,
  waveformURL: _propTypes["default"].string.isRequired,
  audioURL: _propTypes["default"].string.isRequired,
  streamDuration: _propTypes["default"].number.isRequired,
  initStructure: _propTypes["default"].object,
  withCredentials: _propTypes["default"].bool,
  structureIsSaved: _propTypes["default"].func
};
App.defaultProps = {
  withCredentials: false,
  structureIsSaved: function structureIsSaved(val) {}
};
var mapDispatchToProps = {
  resetStore: _actions.resetReduxStore,
  handleStructureError: _forms.handleStructureError,
  removeAlert: _forms.removeAlert
};

var _default = (0, _reactRedux.connect)(null, mapDispatchToProps)(App);

exports["default"] = _default;