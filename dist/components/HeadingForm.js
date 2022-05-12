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

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _reactBootstrap = require("react-bootstrap");

var _Form = _interopRequireDefault(require("react-bootstrap/Form"));

var actions = _interopRequireWildcard(require("../actions/forms"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = require("lodash");

var _formHelper = require("../services/form-helper");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var HeadingForm = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(HeadingForm, _Component);

  var _super = _createSuper(HeadingForm);

  function HeadingForm() {
    var _this;

    (0, _classCallCheck2["default"])(this, HeadingForm);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      headingTitle: '',
      headingChildOf: '',
      childOfOptions: []
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      _this.props.toggleHeading();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleChildOfChange", function (e) {
      _this.setState({
        headingChildOf: e.target.value
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleHeadingChange", function (e) {
      _this.setState({
        headingTitle: e.target.value
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSubmit", function (e) {
      var _this$state = _this.state,
          headingChildOf = _this$state.headingChildOf,
          headingTitle = _this$state.headingTitle;
      var submitItem = {
        headingChildOf: headingChildOf,
        headingTitle: headingTitle
      };
      e.preventDefault();

      _this.props.onSubmit(submitItem); // Clear form


      _this.clearFormValues();
    });
    return _this;
  }

  (0, _createClass2["default"])(HeadingForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.smData.length > 0) {
        this.processOptions();
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (!(0, _lodash.isEqual)(this.props.smData, prevProps.smData)) {
        this.processOptions();
      }
    }
  }, {
    key: "clearFormValues",
    value: function clearFormValues() {
      this.setState({
        headingTitle: '',
        headingChildOf: '',
        childOfOptions: []
      });
    }
  }, {
    key: "formIsValid",
    value: function formIsValid() {
      var headingTitle = this.state.headingTitle;
      var titleValid = headingTitle && headingTitle.length > 2;
      var childOfValid = this.state.headingChildOf.length > 0;
      return titleValid && childOfValid;
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      var rootHeader = structuralMetadataUtils.getItemsOfType('root', this.props.smData);
      var divHeaders = structuralMetadataUtils.getItemsOfType('div', this.props.smData);
      var allHeaders = rootHeader.concat(divHeaders);
      var options = allHeaders.map(function (header) {
        return /*#__PURE__*/_react["default"].createElement("option", {
          value: header.id,
          key: header.id
        }, header.label);
      });
      return options;
    }
  }, {
    key: "processOptions",
    value: function processOptions() {
      var options = this.getOptions();
      this.setState({
        childOfOptions: options
      });
    }
  }, {
    key: "render",
    value: function render() {
      var headingTitle = this.state.headingTitle;
      return /*#__PURE__*/_react["default"].createElement(_Form["default"], {
        onSubmit: this.handleSubmit,
        "data-testid": "heading-form"
      }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
        controlId: "headingTitle",
        "data-testid": "heading-title-form-group"
      }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
        type: "text",
        value: headingTitle,
        isValid: (0, _formHelper.getValidationTitleState)(headingTitle),
        isInvalid: !(0, _formHelper.getValidationTitleState)(headingTitle),
        onChange: this.handleHeadingChange
      }), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control.Feedback, null)), /*#__PURE__*/_react["default"].createElement(_Form["default"].Group, {
        controlId: "headingChildOf"
      }, /*#__PURE__*/_react["default"].createElement(_Form["default"].Label, null, "Child Of"), /*#__PURE__*/_react["default"].createElement(_Form["default"].Control, {
        as: "select",
        onChange: this.handleChildOfChange,
        value: this.state.headingChildOf
      }, /*#__PURE__*/_react["default"].createElement("option", {
        value: ""
      }, "Select..."), this.state.childOfOptions)), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        xs: 12
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.ButtonToolbar, {
        className: "pull-right"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        onClick: this.props.cancelClick,
        "data-testid": "heading-form-cancel-button"
      }, "Cancel"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        variant: "primary",
        type: "submit",
        disabled: !this.formIsValid(),
        "data-testid": "heading-form-save-button"
      }, "Save")))));
    }
  }]);
  return HeadingForm;
}(_react.Component);

HeadingForm.propTypes = {
  cancelClick: _propTypes["default"].func,
  onSubmit: _propTypes["default"].func
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, actions)(HeadingForm);

exports["default"] = _default;