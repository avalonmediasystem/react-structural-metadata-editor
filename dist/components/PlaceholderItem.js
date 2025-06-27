"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireDefault(require("react"));
var _reactDnd = require("react-dnd");
var _Constants = require("../services/Constants");
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
var PlaceholderItem = function PlaceholderItem(_ref) {
  var item = _ref.item;
  // Wire the component into DnD system as a drop target
  var _useDrop = (0, _reactDnd.useDrop)({
      // Specifying the item type that can be dropped
      accept: _Constants.ItemTypes.SPAN,
      // Use drop method to store placeholder to update in handleListItemDrop()
      drop: function drop() {
        return {
          dropItem: item
        };
      },
      collect: function collect(monitor) {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        };
      }
    }, [item]),
    _useDrop2 = (0, _slicedToArray2["default"])(_useDrop, 2),
    _useDrop2$ = _useDrop2[0],
    isOver = _useDrop2$.isOver,
    canDrop = _useDrop2$.canDrop,
    drop = _useDrop2[1];
  return /*#__PURE__*/_react["default"].createElement("li", {
    className: "row-wrapper",
    "data-testid": "drop-list-item",
    style: isOver ? styles.liHovered : styles.li,
    ref: drop
  }, canDrop && isOver ? 'Release to drop' : 'Drop here');
};
var _default = exports["default"] = PlaceholderItem;