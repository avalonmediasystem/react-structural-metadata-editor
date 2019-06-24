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

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _formHelper = require("../services/form-helper");

var _reactRedux = require("react-redux");

var _lodash = require("lodash");

var _ListItemInlineEditControls = _interopRequireDefault(require("./ListItemInlineEditControls"));

var styles = {
  formControl: {
    margin: '0 5px',
    width: '300px'
  }
};

var HeadingInlineForm =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(HeadingInlineForm, _Component);

  function HeadingInlineForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HeadingInlineForm);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(HeadingInlineForm).call(this, props)); // To implement validation logic on begin and end times, we need to remove the current item
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
      return _react["default"].createElement(_reactBootstrap.Form, {
        inline: true,
        "data-testid": "heading-inline-form"
      }, _react["default"].createElement("div", {
        className: "row-wrapper"
      }, _react["default"].createElement("div", null, _react["default"].createElement(_reactBootstrap.FormGroup, {
        controlId: "headingTitle",
        validationState: (0, _formHelper.getValidationTitleState)(headingTitle),
        "data-testid": "inline-heading-title-form-group"
      }, _react["default"].createElement(_reactBootstrap.ControlLabel, null, "Title"), _react["default"].createElement(_reactBootstrap.FormControl, {
        type: "text",
        style: styles.formControl,
        value: headingTitle,
        onChange: this.handleInputChange
      }))), _react["default"].createElement(_ListItemInlineEditControls["default"], {
        formIsValid: this.formIsValid(),
        handleSaveClick: this.handleSaveClick,
        handleCancelClick: this.handleCancelClick
      })));
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