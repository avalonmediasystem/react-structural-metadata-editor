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

var _reactRedux = require("react-redux");

var _TimespanInlineForm = _interopRequireDefault(require("./TimespanInlineForm"));

var _HeadingInlineForm = _interopRequireDefault(require("./HeadingInlineForm"));

var _smData = require("../actions/sm-data");

var _lodash = require("lodash");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var ListItemEditForm =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(ListItemEditForm, _Component);

  function ListItemEditForm(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, ListItemEditForm);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ListItemEditForm).call(this, props));
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

      _this.props.buildSMUI(clonedItems); // Turn off editing state


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
    key: "render",
    value: function render() {
      var item = this.props.item;

      if (item.type === 'span') {
        return _react["default"].createElement(_TimespanInlineForm["default"], {
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
        return _react["default"].createElement(_HeadingInlineForm["default"], {
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
    smData: state.smData
  };
};

var mapDispathToProps = function mapDispathToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(json) {
      return dispatch((0, _smData.buildSMUI)(json));
    }
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispathToProps)(ListItemEditForm);

exports["default"] = _default;