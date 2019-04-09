'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDnd = require('react-dnd');

var _Constants = require('../services/Constants');

var _reactRedux = require('react-redux');

var _smData = require('../actions/sm-data');

var smActions = _interopRequireWildcard(_smData);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
  hover: function hover(props, monitor, component) {
    //console.log('hover over drop target');
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
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}

var PlaceholderItem = function (_Component) {
  _inherits(PlaceholderItem, _Component);

  function PlaceholderItem() {
    _classCallCheck(this, PlaceholderItem);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  PlaceholderItem.prototype.render = function render() {
    var _props = this.props,
        isOver = _props.isOver,
        connectDropTarget = _props.connectDropTarget;


    return connectDropTarget(_react2.default.createElement(
      'li',
      { className: 'row-wrapper', style: isOver ? styles.liHovered : styles.li },
      'Drop here'
    ));
  };

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

exports.default = (0, _reactRedux.connect)(null, mapDispatchToProps)(ConnectedDropTarget);
module.exports = exports['default'];