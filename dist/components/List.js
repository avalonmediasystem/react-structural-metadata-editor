"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _ListItem = _interopRequireDefault(require("./ListItem"));

var _PlaceholderItem = _interopRequireDefault(require("./PlaceholderItem"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var List = function List(props) {
  var _React$useState = _react["default"].useState(true),
      _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
      canDrag = _React$useState2[0],
      _setCanDrag = _React$useState2[1];

  return _react["default"].createElement("ul", {
    className: "structure-list",
    "data-testid": "list"
  }, props.items.map(function (item, i) {
    if (!item) {
      return null;
    }

    if (item.type === 'optional') {
      return _react["default"].createElement(_PlaceholderItem["default"], {
        key: i,
        item: item
      });
    }

    return _react["default"].createElement(_ListItem["default"], {
      key: item.id,
      item: item,
      canDrag: canDrag,
      setCanDrag: function setCanDrag(flag) {
        return _setCanDrag(flag);
      }
    });
  }));
};

List.propTypes = {
  items: _propTypes["default"].array
};
var _default = List;
exports["default"] = _default;