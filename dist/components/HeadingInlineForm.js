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

var _reactBootstrap = require("react-bootstrap");

var _formHelper = require("../services/form-helper");

var _reactRedux = require("react-redux");

var _lodash = require("lodash");

var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var styles = {
  formControl: {
    margin: '0 5px',
    width: '300px'
  }
};

var HeadingInlineForm = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(HeadingInlineForm, _Component);

  var _super = _createSuper(HeadingInlineForm);

  function HeadingInlineForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HeadingInlineForm);
    _this = _super.call(this, props); // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data

    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      headingTitle: ''
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function () {
      _this.props.cancelFn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleInputChange", function (e) {
      _this.setState((0, _defineProperty2["default"])({}, e.target.id, e.target.value));
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveClick", function () {
      var headingTitle = _this.state.headingTitle;

      _this.props.saveFn(_this.props.item.id, {
        headingTitle: headingTitle
      });
    });
    _this.tempSmData = undefined;
    return _this;
  }

  (0, _createClass2["default"])(HeadingInlineForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var smData = this.props.smData; // Get a fresh copy of store data

      this.tempSmData = (0, _lodash.cloneDeep)(smData); // Load existing form values

      this.setState((0, _formHelper.getExistingFormValues)(this.props.item.id, this.tempSmData));
    }
  }, {
    key: "formIsValid",
    value: function formIsValid() {
      return (0, _formHelper.isTitleValid)(this.state.headingTitle);
    }
  }, {
    key: "render",
    value: function render() {
      var headingTitle = this.state.headingTitle;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "row-wrapper"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form, {
        inline: true,
        "data-testid": "heading-inline-form",
        className: "mb-0"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Group, {
        controlId: "headingTitle",
        "data-testid": "inline-heading-title-form-group"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Label, null, "Title"), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Form.Control, {
        type: "text",
        style: styles.formControl,
        value: headingTitle,
        isValid: (0, _formHelper.getValidationTitleState)(headingTitle),
        isInvalid: !(0, _formHelper.getValidationTitleState)(headingTitle),
        onChange: this.handleInputChange
      }))), /*#__PURE__*/_react["default"].createElement(_ListItemInlineEditControls["default"], {
        formIsValid: this.formIsValid(),
        handleSaveClick: this.handleSaveClick,
        handleCancelClick: this.handleCancelClick
      }));
    }
  }]);
  return HeadingInlineForm;
}(_react.Component);

(0, _defineProperty2["default"])(HeadingInlineForm, "propTypes", {
  item: _propTypes["default"].object,
  cancelFn: _propTypes["default"].func,
  saveFn: _propTypes["default"].func
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(HeadingInlineForm);

exports["default"] = _default;