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

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _reactBootstrap = require("react-bootstrap");

var actions = _interopRequireWildcard(require("../actions/forms"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = require("lodash");

var _formHelper = require("../services/form-helper");

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var HeadingForm =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(HeadingForm, _Component);

  function HeadingForm() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, HeadingForm);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(HeadingForm)).call.apply(_getPrototypeOf2, [this].concat(args)));
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
        return _react["default"].createElement("option", {
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
      var adamOptions = [{
        id: 1,
        label: '1'
      }, {
        id: 2,
        label: '2'
      }].map(function (header) {
        return _react["default"].createElement("option", {
          value: header.id,
          key: header.id
        }, header.label);
      });
      this.setState({
        childOfOptions: options,
        adamOptions: adamOptions
      });
    }
  }, {
    key: "render",
    value: function render() {
      var headingTitle = this.state.headingTitle;
      return _react["default"].createElement("form", {
        onSubmit: this.handleSubmit,
        "data-testid": "heading-form"
      }, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "headingTitle",
        validationState: (0, _formHelper.getValidationTitleState)(headingTitle),
        "data-testid": "heading-title-form-group"
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Title"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        value: headingTitle,
        onChange: this.handleHeadingChange
      }), _react["default"].createElement(_reactBootstrap.FormControl.Feedback, null)), _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "headingChildOf"
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Child Of"), _react["default"].createElement(_reactBootstrap.FormControl, {
        componentClass: "select",
        placeholder: "select",
        onChange: this.handleChildOfChange,
        value: this.state.headingChildOf
      }, _react["default"].createElement("option", {
        value: "asdfasdf"
      }, "Select..."), this.state.childOfOptions)), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12
      }, _react["default"].createElement(_reactBootstrap.ButtonToolbar, {
        className: "pull-right"
      }, _react["default"].createElement(_reactBootstrap.Button, {
        onClick: this.props.cancelClick,
        "data-testid": "heading-form-cancel-button"
      }, "Cancel"), _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "primary",
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
    smData: state.smData
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, actions)(HeadingForm);

exports["default"] = _default;