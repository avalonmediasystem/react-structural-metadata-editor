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

var _HeadingForm = _interopRequireDefault(require("../components/HeadingForm"));

var _reactRedux = require("react-redux");

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var HeadingFormContainer = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(HeadingFormContainer, _Component);

  var _super = _createSuper(HeadingFormContainer);

  function HeadingFormContainer() {
    var _this;

    (0, _classCallCheck2["default"])(this, HeadingFormContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      message: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "submit", function (values) {
      var smData = _this.props.smData;
      var submittedItem = {
        headingChildOf: values.headingChildOf,
        headingTitle: values.headingTitle
      };
      var updatedSmData = null; // Update the data structure with new heading

      updatedSmData = structuralMetadataUtils.insertNewHeader(submittedItem, smData); // Update redux store

      _this.props.reBuildSMUI(updatedSmData, _this.props.duration); // Close the form


      _this.props.cancelClick();
    });
    return _this;
  }

  (0, _createClass2["default"])(HeadingFormContainer, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_HeadingForm["default"], {
        onSubmit: this.submit,
        cancelClick: this.props.cancelClick
      });
    }
  }]);
  return HeadingFormContainer;
}(_react.Component);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    reBuildSMUI: function reBuildSMUI(data, duration) {
      return dispatch(smActions.reBuildSMUI(data, duration));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    duration: state.peaksInstance.duration
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(HeadingFormContainer);

exports["default"] = _default;