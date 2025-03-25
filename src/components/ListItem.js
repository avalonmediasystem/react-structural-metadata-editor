import React, { useEffect, useRef } from 'react';
import List from './List';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';
import { deleteSegment } from '../actions/peaks-instance';
import { handleEditingTimespans } from '../actions/forms';
import { ItemTypes } from '../services/Constants';
import ListItemEditForm from './ListItemEditForm';
import ListItemControls from './ListItemControls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const spanSource = {
  // canDrag prop is turned false/true based on mouse events mouseenter/mouseleave
  // respectively. This takes place when an item is being edited inline.
  canDrag(props) {
    // props.canDrag = false => dragging is disabled
    return props.canDrag;
  },
  beginDrag(props) {
    return { id: props.item.id };
  },
};

const spanTarget = {
  canDrop(props, monitor) {
    // You can disallow drop based on props or item
    return true;
  },
};

function collectDrag(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
  };
}

const ListItem = ({
  addDropTargets,
  item,
  canDrag,
  deleteItem,
  deleteSegment,
  handleEditingTimespans,
  removeActiveDragSources,
  removeDropTargets,
  setActiveDragSource,
  setCanDrag,
  smDataIsValid
}) => {
  const [editing, setEditing] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const liRef = useRef(null);

  const handleDelete = () => {
    deleteItem(item.id);
    deleteSegment(item);
  };

  const handleEditClick = () => {
    // Disable the edit buttons of other list items
    handleEditingTimespans(1, smDataIsValid);

    setEditing(true);
  };

  const handleEditFormCancel = () => {
    setEditing(false);

    // Enable the edit buttons of other list items
    handleEditingTimespans(0, smDataIsValid);
  };

  const handleShowDropTargetsClick = () => {
    // Disable other editing actions
    const handleEditingTimespans(1);

    // Clear out any current drop targets
    removeDropTargets();

    // Handle closing of current drag source drop targets, and exit with a clean UI.
    if (item.active === true) {
      // Clear out any active drag sources
      removeActiveDragSources();
      // Enable other editing actions
      handleEditingTimespans(0);
      return;
    }
    // Clear out any active drag sources
    removeActiveDragSources();

    // Calculate possible drop targets
    addDropTargets(item);

    // Redux way of setting active drag list item
    setActiveDragSource(item.id);
  };

  const getInputElements = (node) => {
    return node
      ? Array.prototype.slice
        .call(node.getElementsByTagName('input'))
        .filter((e) => !e.readOnly)
      : [];
  };

  const onHoverOverInput = () => setCanDrag(false);
  const onHoverOutOfInput = () => setCanDrag(true);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  const detachEventListeners = (node) => {
    getInputElements(node).map((e) => {
      e.removeEventListener('mouseleave', onHoverOutOfInput);
      e.removeEventListener('mouseenter', onHoverOverInput);
    });
  };

  useEffect(() => {
    if (liRef.current) {
      detachEventListeners(liRef.current);
      if (canDrag) {
        getInputElements(liRef.current).map((e) => {
          e.addEventListener('mouseenter', onHoverOverInput);
        });
      } else {
        getInputElements(liRef.current).map((e) => {
          e.addEventListener('mouseleave', onHoverOutOfInput);
        });
      }
    }

    return () => {
      detachEventListeners(liRef.current);
    };
  }, [canDrag]);

  const subMenu = item.items && item.items.length > 0 ? <List items={item.items} /> : null;
  const itemProp = {
    childrenCount: item.items ? item.items.length : 0,
    label: item.label,
    type: item.type,
    active: item.active,
  };

  return (
    <li
      className={item.active ? 'active' : ''}
      ref={liRef}
    >
      {editing && (
        <ListItemEditForm
          item={item}
          handleEditFormCancel={handleEditFormCancel}
        />
      )}

      {!editing && (
        <div
          className={'row-wrapper' + (!item.valid ? ' invalid' : '')}
          data-testid="list-item"
        >
          {item.type === 'span' && (
            <React.Fragment>
              <span
                className="structure-title"
                data-testid="timespan-label"
              >
                {!item.valid && (
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="icon-invalid"
                  />
                )}{' '}
                {item.label} ({item.begin} - {item.end})
              </span>
            </React.Fragment>
          )}
          {(item.type === 'div' || item.type === 'root') && (
            <div
              className="structure-title heading"
              data-testid="heading-label"
            >
              {item.label}
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

      {subMenu}
    </li>
  );
};

const mapDispatchToProps = {
  deleteItem: smActions.deleteItem,
  addDropTargets: smActions.addDropTargets,
  removeDropTargets: smActions.removeDropTargets,
  removeActiveDragSources: smActions.removeActiveDragSources,
  setActiveDragSource: smActions.setActiveDragSource,
  deleteSegment: deleteSegment,
  handleEditingTimespans: handleEditingTimespans,
};

const mapStateToProps = (state) => ({
  smDataIsValid: state.structuralMetadata.smDataIsValid,
});

const ConnectedDropTarget = DropTarget(ItemTypes.SPAN, spanTarget, collectDrop);
const ConnectedDragSource = DragSource(ItemTypes.SPAN, spanSource, collectDrag);
const DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

export default connect(mapStateToProps, mapDispatchToProps)(DragConnected);
