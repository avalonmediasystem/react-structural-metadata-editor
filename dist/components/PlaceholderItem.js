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

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireWildcard(require("react"));

var _reactDnd = require("react-dnd");

var _Constants = require("../services/Constants");

var _reactRedux = require("react-redux");

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

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

var PlaceholderItem =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(PlaceholderItem, _Component);

  function PlaceholderItem() {
    (0, _classCallCheck2["default"])(this, PlaceholderItem);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(PlaceholderItem).apply(this, arguments));
  }

  (0, _createClass2["default"])(PlaceholderItem, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          isOver = _this$props.isOver,
          connectDropTarget = _this$props.connectDropTarget;
      return connectDropTarget(_react["default"].createElement("li", {
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