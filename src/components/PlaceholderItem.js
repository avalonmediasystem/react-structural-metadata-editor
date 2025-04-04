import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../services/Constants';

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

const PlaceholderItem = ({ item }) => {
  // Wire the component into DnD system as a drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    // Specifying the item type that can be dropped
    accept: ItemTypes.SPAN,
    // Use drop method to store placeholder to update in handleListItemDrop()
    drop: () => ({ dropItem: item }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
  }, [item]);

  return (
    <li
      className="row-wrapper"
      data-testid="drop-list-item"
      style={isOver ? styles.liHovered : styles.li}
      ref={drop}
    >
      {canDrop && isOver ? 'Release to drop' : 'Drop here'}
    </li>
  );
};

export default PlaceholderItem;
