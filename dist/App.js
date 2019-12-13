"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

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

var _fontawesomeSvgCore = require("@fortawesome/fontawesome-svg-core");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

// Font Awesome Imports
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faDotCircle, _freeSolidSvgIcons.faMinusCircle, _freeSolidSvgIcons.faPen, _freeSolidSvgIcons.faSave, _freeSolidSvgIcons.faTrash);

var App =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(App, _Component);

  function App(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, App);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(App).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearStructureAlert", function () {
      _this.setState({
        structureAlert: null
      });

      _this.props.handleStructureError(0);
    });
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
      return _react["default"].createElement(_reactDnd.DragDropContextProvider, {
        backend: _reactDndHtml5Backend["default"]
      }, _react["default"].createElement("div", {
        className: "sme-container"
      }, _react["default"].createElement(_WaveformContainer["default"], (0, _extends2["default"])({}, this.props, {
        structureAlert: this.state.structureAlert
      })), _react["default"].createElement(_ButtonSection["default"], null), _react["default"].createElement(_StructureOutputContainer["default"], (0, _extends2["default"])({
        alertObj: this.state.structureAlert,
        clearAlert: this.clearStructureAlert
      }, this.props))));
    }
  }]);
  return App;
}(_react.Component);

var mapDispatchToProps = {
  resetStore: _actions.resetReduxStore,
  handleStructureError: _forms.handleStructureError
};

var _default = (0, _reactRedux.connect)(null, mapDispatchToProps)(App);

exports["default"] = _default;