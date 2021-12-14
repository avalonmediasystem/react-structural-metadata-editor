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

var _reactRedux = require("react-redux");

var _TimespanInlineForm = _interopRequireDefault(require("./TimespanInlineForm"));

var _HeadingInlineForm = _interopRequireDefault(require("./HeadingInlineForm"));

var _smData = require("../actions/sm-data");

var _lodash = require("lodash");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var ListItemEditForm = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(ListItemEditForm, _Component);

  var _super = _createSuper(ListItemEditForm);

  function ListItemEditForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, ListItemEditForm);
    _this = _super.call(this, props);
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setIsInitializing", function (value) {
      if (value === 1) {
        _this.setState({
          isInitializing: true
        });
      } else {
        _this.setState({
          isInitializing: false
        });
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleCancelClick", function (e) {
      _this.props.handleEditFormCancel();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveClick", function (id, payload) {
      // Clone smData
      var clonedItems = (0, _lodash.cloneDeep)(_this.props.smData); // Get the original item

      /* eslint-disable */

      var item = structuralMetadataUtils.findItem(id, clonedItems);
      /* eslint-enable */
      // Update item values

      item = _this.addUpdatedValues(item, payload); // Send updated smData back to redux

      _this.props.reBuildSMUI(clonedItems, _this.props.duration); // Turn off editing state


      _this.props.handleEditFormCancel();
    });
    _this.state = {
      isTyping: false,
      isInitializing: true
    };
    return _this;
  }

  (0, _createClass2["default"])(ListItemEditForm, [{
    key: "addUpdatedValues",
    value: function addUpdatedValues(item, payload) {
      if (item.type === 'div' || item.type === 'root') {
        item.label = payload.headingTitle;
      } else if (item.type === 'span') {
        item.label = payload.timespanTitle;
        item.begin = payload.beginTime;
        item.end = payload.endTime;
      }

      return item;
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.setState({
        isInitializing: true,
        isTyping: false
      });
    }
  }, {
    key: "render",
    value: function render() {
      var item = this.props.item;

      if (item.type === 'span') {
        return /*#__PURE__*/_react["default"].createElement(_TimespanInlineForm["default"], {
          item: item,
          cancelFn: this.handleCancelClick,
          saveFn: this.handleSaveClick,
          setIsTyping: this.setIsTyping,
          isTyping: this.state.isTyping,
          isInitializing: this.state.isInitializing,
          setIsInitializing: this.setIsInitializing
        });
      }

      if (item.type === 'div' || item.type === 'root') {
        return /*#__PURE__*/_react["default"].createElement(_HeadingInlineForm["default"], {
          item: item,
          cancelFn: this.handleCancelClick,
          saveFn: this.handleSaveClick
        });
      }
    }
  }]);
  return ListItemEditForm;
}(_react.Component);

(0, _defineProperty2["default"])(ListItemEditForm, "propTypes", {
  handleEditFormCancel: _propTypes["default"].func,
  item: _propTypes["default"].object.isRequired
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    duration: state.peaksInstance.duration
  };
};

var mapDispathToProps = {
  reBuildSMUI: _smData.reBuildSMUI
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispathToProps)(ListItemEditForm);

exports["default"] = _default;