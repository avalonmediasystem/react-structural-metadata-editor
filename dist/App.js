"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

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

var _reactBootstrap = require("react-bootstrap");

var _actions = require("./actions");

var _forms = require("./actions/forms");

var _alertStatus = require("./services/alert-status");

var _Utils = _interopRequireDefault(require("./api/Utils"));

var _ErrorBoundary = _interopRequireDefault(require("./components/ErrorBoundary"));

var _AlertContainer = _interopRequireDefault(require("./containers/AlertContainer"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var apiUtils = new _Utils["default"]();

var App = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(App, _Component);

  var _super = _createSuper(App);

  function App(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, App);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveError", function (error) {
      console.log('TCL: handleSaveError -> error -> ', error);
      var status = -10;
      var alert = (0, _alertStatus.configureAlert)(status);

      _this.props.setAlert(alert);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveItClick", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var postData, response, status, alert;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              postData = {
                json: _this.props.smData[0]
              };
              _context.prev = 1;
              _context.next = 4;
              return apiUtils.postRequest(_this.props.structureURL, postData);

            case 4:
              response = _context.sent;
              status = response.status;
              alert = (0, _alertStatus.configureAlert)(status);

              _this.props.setAlert(alert);

              _this.props.updateStructureStatus(1);

              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](1);

              _this.handleSaveError(_context.t0);

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 11]]);
    })));
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
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
        className: "mx-0"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        lg: 12
      }, /*#__PURE__*/_react["default"].createElement(_WaveformContainer["default"], this.props))), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        lg: 12
      }, /*#__PURE__*/_react["default"].createElement(_ErrorBoundary["default"], null, /*#__PURE__*/_react["default"].createElement(_AlertContainer["default"], {
        removeAlert: this.props.removeAlert
      }), /*#__PURE__*/_react["default"].createElement(_ButtonSection["default"], null), /*#__PURE__*/_react["default"].createElement(_StructureOutputContainer["default"], this.props))), !this.props.disableSave && this.props.manifestFetched && /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
        className: "structure-save"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        md: 12,
        className: "mt-1 text-right"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "primary",
        onClick: this.handleSaveItClick,
        "data-testid": "structure-save-button",
        disabled: this.props.editingDisabled
      }, "Save Structure")))));
    }
  }]);
  return App;
}(_react.Component);

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
var mapDispatchToProps = {
  resetStore: _actions.resetReduxStore,
  removeAlert: _forms.removeAlert,
  setAlert: _forms.setAlert,
  updateStructureStatus: _forms.updateStructureStatus
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    editingDisabled: state.forms.editingDisabled,
    manifestFetched: state.manifest.manifestFetched
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(App);

exports["default"] = _default;