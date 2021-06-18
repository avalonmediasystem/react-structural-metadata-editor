"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

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

// Font Awesome Imports
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faDotCircle, _freeSolidSvgIcons.faMinusCircle, _freeSolidSvgIcons.faPen, _freeSolidSvgIcons.faSave, _freeSolidSvgIcons.faTrash);

var App =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(App, _Component);

  function App() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, App);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(App)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "structureIsSaved", function (value) {
      _this.props.structureIsSaved(value);
    });
    return _this;
  }

  (0, _createClass2["default"])(App, [{
    key: "componentWillUnmount",
    // Lifecycle method fired before unmounting the React component
    value: function componentWillUnmount() {
      // Reset the redux-store
      this.props.resetStore();
    }
  }, {
    key: "render",
    value: function render() {
      return _react["default"].createElement(_reactDnd.DragDropContextProvider, {
        backend: _reactDndHtml5Backend["default"]
      }, _react["default"].createElement("div", {
        className: "sme-container"
      }, _react["default"].createElement(_WaveformContainer["default"], this.props), _react["default"].createElement(_ErrorBoundary["default"], null, _react["default"].createElement(_AlertContainer["default"], {
        removeAlert: this.props.removeAlert
      }), _react["default"].createElement(_ButtonSection["default"], null), _react["default"].createElement(_StructureOutputContainer["default"], this.props))));
    }
  }]);
  return App;
}(_react.Component);

var mapDispatchToProps = {
  resetStore: _actions.resetReduxStore,
  handleStructureError: _forms.handleStructureError,
  removeAlert: _forms.removeAlert
};

var _default = (0, _reactRedux.connect)(null, mapDispatchToProps)(App);

exports["default"] = _default;