"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _ListItem = _interopRequireDefault(require("./ListItem"));
var _PlaceholderItem = _interopRequireDefault(require("./PlaceholderItem"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _List = function List(_ref) {
  var items = _ref.items;
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, items.map(function (item, i) {
    var _item$items;
    if (!item) {
      return null;
    }
    if (item.type === 'optional') {
      return /*#__PURE__*/_react["default"].createElement(_PlaceholderItem["default"], {
        key: i,
        item: item
      });
    }
    return /*#__PURE__*/_react["default"].createElement(_ListItem["default"], {
      key: item.id,
      item: item
    }, ((_item$items = item.items) === null || _item$items === void 0 ? void 0 : _item$items.length) > 0 && /*#__PURE__*/_react["default"].createElement("ul", {
      "data-testid": "list"
    }, /*#__PURE__*/_react["default"].createElement(_List, {
      items: item.items
    })));
  }));
};
_List.propTypes = {
  items: _propTypes["default"].array
};
var _default = exports["default"] = _List;