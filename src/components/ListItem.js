import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import ListItemEditForm from './ListItemEditForm';
import ListItemControls from './ListItemControls';
import { ItemTypes } from '../services/Constants';
import * as actions from '../actions/sm-data';
import { useStructureUpdate } from '../services/sme-hooks';

const ListItem = ({ item, children }) => {
  // Dispatch actions to Redux store
  const dispatch = useDispatch();
  const addDropTargets = (item) => dispatch(actions.addDropTargets(item));
  const removeDropTargets = () => dispatch(actions.removeDropTargets());
  const removeActiveDragSources = () => dispatch(actions.removeActiveDragSources());
  const setActiveDragSource = (id) => dispatch(actions.setActiveDragSource(id));
  const handleListItemDrop = (item, dropItem) => dispatch(actions.handleListItemDrop(item, dropItem));

  const { deleteStructItem, updateEditingTimespans } = useStructureUpdate();

  const [editing, setEditing] = useState(false);

  const { showBoundary } = useErrorBoundary();

  const nodeRef = useRef(null);

  // Wire the component into DnD system as a drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SPAN,
    item: { id: item.id },
    // Call this function when the item is dropped
    end: (item, monitor) => {
      try {
        // Get the dropItem saved in PlaceholderItem
        const dropResult = monitor.getDropResult();
        if (dropResult && item && dropResult?.dropItem) {
          handleListItemDrop(item, dropResult.dropItem);
        }
      } catch (error) {
        showBoundary(error);
      }
    },
  }), [item.id]);

  const handleDelete = () => {
    try {
      deleteStructItem(item);
    } catch (error) {
      showBoundary(error);
    }
  };

  const handleEditClick = () => {
    updateEditingTimespans(1);
    setEditing(true);
  };

  const handleEditFormCancel = () => {
    setEditing(false);
    updateEditingTimespans(0);
  };

  const handleShowDropTargetsClick = () => {
    try {
      updateEditingTimespans(1);
      removeDropTargets();

      if (item.active === true) {
        removeActiveDragSources();
        updateEditingTimespans(0);
        return;
      }

      removeActiveDragSources();
      addDropTargets(item);
      setActiveDragSource(item.id);
    } catch (error) {
      showBoundary(error);
    }
  };

  const { begin, end, nestedSpan, items, label, type, active, valid } = item;

  const itemProp = {
    childrenCount: items ? items.length : 0,
    label, type, active, nestedSpan
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
              {(!valid && type !== 'root') && (
                <>
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className='icon-invalid'
                    title='Please add at least one timespan or remove this heading.' />
                  {' '}
                </>
              )}
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


export default ListItem;
