"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireWildcard(require("react"));

var _reactDnd = require("react-dnd");

var _Constants = require("../services/Constants");

var _reactRedux = require("react-redux");

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var styles = {
  li: {
    border: '2px #999 dashed',
    opacity: 0.3
  },
  liHovered: {
    border: '5px #999 dashed',
    opacity: 0.5
  }
};
var optionalTarget = {
  hover: function hover(props, monitor, component) {//console.log('hover over drop target');
  },
  drop: function drop(props, monitor, component) {
    var dragItem = monitor.getItem();
    props.handleListItemDrop(dragItem, props.item);
  }
};

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}

var PlaceholderItem = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(PlaceholderItem, _Component);

  var _super = _createSuper(PlaceholderItem);

  function PlaceholderItem() {
    (0, _classCallCheck2["default"])(this, PlaceholderItem);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(PlaceholderItem, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          isOver = _this$props.isOver,
          connectDropTarget = _this$props.connectDropTarget;
      return connectDropTarget( /*#__PURE__*/_react["default"].createElement("li", {
        className: "row-wrapper",
        "data-testid": "drop-list-item",
        style: isOver ? styles.liHovered : styles.li
      }, "Drop here"));
    }
  }]);
  return PlaceholderItem;
}(_react.Component);

var ConnectedDropTarget = (0, _reactDnd.DropTarget)(_Constants.ItemTypes.SPAN, optionalTarget, collect)(PlaceholderItem);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    handleListItemDrop: function handleListItemDrop(dragItem, dropItem) {
      return dispatch(smActions.handleListItemDrop(dragItem, dropItem));
    }
  };
};

var _default = (0, _reactRedux.connect)(null, mapDispatchToProps)(ConnectedDropTarget);

exports["default"] = _default;