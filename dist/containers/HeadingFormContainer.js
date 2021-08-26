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

var _HeadingForm = _interopRequireDefault(require("../components/HeadingForm"));

var _reactRedux = require("react-redux");

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var HeadingFormContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(HeadingFormContainer, _Component);

  function HeadingFormContainer() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, HeadingFormContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(HeadingFormContainer)).call.apply(_getPrototypeOf2, [this].concat(args)));
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
      return _react["default"].createElement(_HeadingForm["default"], {
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