function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { ItemTypes } from '../services/Constants';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';

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


    return connectDropTarget(React.createElement(
      'li',
      { className: 'row-wrapper', style: isOver ? styles.liHovered : styles.li },
      'Drop here'
    ));
  };

  return PlaceholderItem;
}(Component);

var ConnectedDropTarget = DropTarget(ItemTypes.SPAN, optionalTarget, collect)(PlaceholderItem);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    handleListItemDrop: function handleListItemDrop(dragItem, dropItem) {
      return dispatch(smActions.handleListItemDrop(dragItem, dropItem));
    }
  };
};

export default connect(null, mapDispatchToProps)(ConnectedDropTarget);