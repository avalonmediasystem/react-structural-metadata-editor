import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { ItemTypes } from '../services/Constants';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';

const styles = {
  li: {
    border: '2px #999 dashed',
    opacity: 0.3
  },
  liHovered: {
    border: '5px #999 dashed',
    opacity: 0.5
  }
};

const optionalTarget = {
  hover(props, monitor, component) {
    //console.log('hover over drop target');
  },

  drop(props, monitor, component) {
    let dragItem = monitor.getItem();

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

class PlaceholderItem extends Component {
  render() {
    const { isOver, connectDropTarget } = this.props;

    return connectDropTarget(
      <li className="row-wrapper" style={isOver ? styles.liHovered : styles.li}>
        Drop here
      </li>
    );
  }
}

const ConnectedDropTarget = DropTarget(ItemTypes.SPAN, optionalTarget, collect)(
  PlaceholderItem
);

const mapDispatchToProps = dispatch => ({
  handleListItemDrop: (dragItem, dropItem) =>
    dispatch(smActions.handleListItemDrop(dragItem, dropItem))
});

export default connect(
  null,
  mapDispatchToProps
)(ConnectedDropTarget);
