'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ListItem = require('./ListItem');

var _ListItem2 = _interopRequireDefault(_ListItem);

var _PlaceholderItem = require('./PlaceholderItem');

var _PlaceholderItem2 = _interopRequireDefault(_PlaceholderItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var List = function List(props) {
  return _react2.default.createElement(
    'ul',
    { className: 'structure-list' },
    props.items.map(function (item, i) {
      if (!item) {
        return null;
      }
      if (item.type === 'optional') {
        return _react2.default.createElement(_PlaceholderItem2.default, { key: i, item: item });
      }
      return _react2.default.createElement(_ListItem2.default, { key: item.id, item: item });
    })
  );
};

exports.default = List;
module.exports = exports['default'];