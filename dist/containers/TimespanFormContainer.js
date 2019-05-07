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

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _TimespanForm = _interopRequireDefault(require("../components/TimespanForm"));

var _reactRedux = require("react-redux");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

var peaksActions = _interopRequireWildcard(require("../actions/peaks-instance"));

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var TimespanFormContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(TimespanFormContainer, _Component);

  function TimespanFormContainer() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, TimespanFormContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(TimespanFormContainer)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      isTyping: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "submit", function (values) {
      // Update the data structure with new heading
      var _structuralMetadataUt = structuralMetadataUtils.insertNewTimespan(values, _this.props.smData),
          newSpan = _structuralMetadataUt.newSpan,
          updatedData = _structuralMetadataUt.updatedData; // Update the waveform segments with new timespan


      _this.props.insertNewSegment(newSpan); // Update redux store


      _this.props.buildSMUI(updatedData); // Close the form


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
      return _react["default"].createElement(_TimespanForm["default"], (0, _extends2["default"])({}, this.props, {
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
    buildSMUI: function buildSMUI(data) {
      return dispatch(smActions.buildSMUI(data));
    },
    insertNewSegment: function insertNewSegment(newspan) {
      return dispatch(peaksActions.insertNewSegment(newspan));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanFormContainer);

exports["default"] = _default;