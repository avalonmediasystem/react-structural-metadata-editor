"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _TimespanForm = _interopRequireDefault(require("../components/TimespanForm"));

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var TimespanFormContainer = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(TimespanFormContainer, _Component);

  var _super = _createSuper(TimespanFormContainer);

  function TimespanFormContainer() {
    var _this;

    (0, _classCallCheck2["default"])(this, TimespanFormContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      isTyping: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "submit", function (values) {
      // Update the data structure with new heading
      var _structuralMetadataUt = structuralMetadataUtils.insertNewTimespan(values, _this.props.smData),
          newSpan = _structuralMetadataUt.newSpan,
          updatedData = _structuralMetadataUt.updatedData; // Update the waveform segments with new timespan


      _this.props.insertNewSegment(newSpan); // Update redux store


      _this.props.reBuildSMUI(updatedData, _this.props.duration); // Close the form


      _this.props.cancelClick();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setIsTyping", function (value) {
      if (value === 1) {
        _this.setState({
          isTyping: true
        });
      } else {
        _this.setState({
          isTyping: false
        });
      }
    });
    return _this;
  }

  (0, _createClass2["default"])(TimespanFormContainer, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_TimespanForm["default"], (0, _extends2["default"])({}, this.props, {
        setIsTyping: this.setIsTyping,
        isTyping: this.state.isTyping,
        onSubmit: this.submit
      }));
    }
  }]);
  return TimespanFormContainer;
}(_react.Component);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    reBuildSMUI: function reBuildSMUI(data) {
      return dispatch(smActions.reBuildSMUI(data));
    },
    insertNewSegment: function insertNewSegment(newspan) {
      return dispatch(peaksActions.insertNewSegment(newspan));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    duration: state.peaksInstance.duration
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanFormContainer);

exports["default"] = _default;