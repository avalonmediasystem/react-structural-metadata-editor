import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { connect, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import ListItemEditForm from './ListItemEditForm';
import ListItemControls from './ListItemControls';
import { ItemTypes } from '../services/Constants';
import {
  addDropTargets, deleteItem, handleListItemDrop, removeActiveDragSources,
  removeDropTargets, setActiveDragSource
} from '../actions/sm-data';
import { deleteSegment } from '../actions/peaks-instance';
import { handleEditingTimespans } from '../actions/forms';

const ListItem = ({ item, children }) => {
  const dispatch = useDispatch();
  const { smDataIsValid } = useSelector((state) => state.structuralMetadata);

  const [editing, setEditing] = useState(false);

  const nodeRef = useRef(null);

  // Wire the component into DnD system as a drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SPAN,
    item: { id: item.id },
    // Call this function when the item is dropped
    end: (item, monitor) => {
      // Get the dropItem saved in PlaceholderItem
      const { dropItem } = monitor.getDropResult();
      if (item && dropItem) {
        dispatch(handleListItemDrop(item, dropItem));
      }
    },
  }), [item.id]);

  const handleDelete = () => {
    dispatch(deleteItem(item.id));
    dispatch(deleteSegment(item));
  };

  const handleEditClick = () => {
    dispatch(handleEditingTimespans(1, smDataIsValid));
    setEditing(true);
  };

  const handleEditFormCancel = () => {
    setEditing(false);
    dispatch(handleEditingTimespans(0, smDataIsValid));
  };

  const handleShowDropTargetsClick = () => {
    dispatch(handleEditingTimespans(1));
    dispatch(removeDropTargets());

    if (item.active === true) {
      dispatch(removeActiveDragSources());
      dispatch(handleEditingTimespans(0));
      return;
    }

    dispatch(removeActiveDragSources());
    dispatch(addDropTargets(item));
    dispatch(setActiveDragSource(item.id));
  };

  const { begin, end, items, label, type, active, valid } = item;

  const itemProp = {
    childrenCount: items ? items.length : 0,
    label: label,
    type: type,
    active: active,
  };

  /**
   * Add drag source ref to nodeRef
   * @param {Object} el 
   */
  const dragRef = (el) => {
    nodeRef.current = el;
    drag(el);
  };

  return (
    <li
      key={item.id}
      ref={dragRef}
      className={active ? 'active' : ''}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {editing && (
        <ListItemEditForm
          item={item}
          handleEditFormCancel={handleEditFormCancel}
        />
      )}
      {!editing && (
        <div
          className={`d-flex justify-content-between row-wrapper ${!valid ? ' invalid' : ''}`}
          data-testid='list-item'
        >
          {type === 'span' && (
            <span
              className='structure-title'
              data-testid='timespan-label'
            >
              {!valid && (
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className='icon-invalid'
                />
              )}{' '}
              {label} ({begin} - {end})
            </span>
          )}
          {(type === 'div' || type === 'root') && (
            <div
              className='structure-title heading'
              data-testid='heading-label'
            >
              {label}
            </div>
          )}
          <ListItemControls
            handleDelete={handleDelete}
            handleEditClick={handleEditClick}
            item={itemProp}
            handleShowDropTargetsClick={handleShowDropTargetsClick}
          />
        </div>
      )}
      {children}
    </li>
  );
};

ListItem.propTypes = {
  item: PropTypes.shape({
    active: PropTypes.bool,
    begin: PropTypes.string,
    end: PropTypes.string,
    items: PropTypes.array,
    id: PropTypes.string,
    type: PropTypes.string,
    editing: PropTypes.bool,
    valid: PropTypes.bool,
  }),
  children: PropTypes.node,
};

const mapDispatchToProps = {
  deleteItem: deleteItem,
  addDropTargets: addDropTargets,
  removeDropTargets: removeDropTargets,
  removeActiveDragSources: removeActiveDragSources,
  setActiveDragSource: setActiveDragSource,
  handleListItemDrop: handleListItemDrop,
  deleteSegment: deleteSegment,
  handleEditingTimespans: handleEditingTimespans,
};

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
  smDataIsValid: state.structuralMetadata.smDataIsValid,
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);
