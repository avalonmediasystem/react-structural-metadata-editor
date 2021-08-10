import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import List from './List';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';
import { deleteSegment } from '../actions/peaks-instance';
import { handleEditingTimespans } from '../actions/forms';
import PropTypes from 'prop-types';
import { ItemTypes } from '../services/Constants';
import { DragSource, DropTarget } from 'react-dnd';
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

class ListItem extends Component {
  static propTypes = {
    item: PropTypes.shape({
      active: PropTypes.bool,
      begin: PropTypes.string,
      end: PropTypes.string,
      items: PropTypes.array,
      id: PropTypes.string,
      type: PropTypes.string,
      editing: PropTypes.bool,
    }),
  };

  state = {
    editing: false,
    canDrag: this.props.canDrag,
  };
  node = undefined;

  handleDelete = () => {
    const { item } = this.props;

    this.props.deleteItem(item.id);
    this.props.deleteSegment(item);
  };

  handleEditClick = () => {
    // Disable the edit buttons of other list items
    this.props.handleEditingTimespans(1);

    this.setState({ editing: true });
  };

  handleEditFormCancel = () => {
    this.setState({ editing: false });

    // Enable the edit buttons of other list items
    this.props.handleEditingTimespans(0);
  };

  handleShowDropTargetsClick = () => {
    const {
      addDropTargets,
      item,
      removeActiveDragSources,
      removeDropTargets,
      setActiveDragSource,
    } = this.props;

    // Disable other editing actions
    this.props.handleEditingTimespans(1);

    // Clear out any current drop targets
    removeDropTargets();

    // Handle closing of current drag source drop targets, and exit with a clean UI.
    if (item.active === true) {
      // Clear out any active drag sources
      removeActiveDragSources();
      // Enable other editing actions
      this.props.handleEditingTimespans(0);
      return;
    }
    // Clear out any active drag sources
    removeActiveDragSources();

    // Calculate possible drop targets
    addDropTargets(item);

    // Redux way of setting active drag list item
    setActiveDragSource(item.id);
  };

  getInputElements = (node) => {
    return node
      ? Array.prototype.slice
          .call(node.getElementsByTagName('input'))
          .filter((e) => !e.readOnly)
      : [];
  };

  onHoverOverInput = () => {
    this.props.setCanDrag(false);
  };

  onHoverOutOfInput = () => {
    this.props.setCanDrag(true);
  };

  detachEventListeners = (node) => {
    this.getInputElements(node).map((e) => {
      e.removeEventListener('mouseleave', this.onHoverOutOfInput);
      e.removeEventListener('mouseenter', this.onHoverOverInput);
    });
  };

  componentWillUnmount() {
    this.detachEventListeners(this.node);
    this.node = undefined;
  }

  render() {
    const {
      item,
      canDrag,
      item: { begin },
      item: { end },
      item: { items },
      item: { label },
      item: { type },
      item: { active },
      item: { valid },
      connectDragSource,
      connectDropTarget,
    } = this.props;

    const subMenu = items && items.length > 0 ? <List items={items} /> : null;
    const itemProp = {
      childrenCount: items ? items.length : 0,
      label: label,
      type: type,
      active: active,
    };

    return connectDragSource(
      connectDropTarget(
        <li
          className={active ? 'active' : ''}
          ref={(instance) => {
            this.detachEventListeners(this.node);
            this.node = findDOMNode(instance);

            if (canDrag) {
              this.getInputElements(this.node).map((e) => {
                e.addEventListener('mouseenter', this.onHoverOverInput);
              });
            } else {
              this.getInputElements(this.node).map((e) => {
                e.addEventListener('mouseleave', this.onHoverOutOfInput);
              });
            }
          }}
        >
          {this.state.editing && (
            <ListItemEditForm
              item={item}
              handleEditFormCancel={this.handleEditFormCancel}
            />
          )}

          {!this.state.editing && (
            <div
              className={'row-wrapper' + (!valid ? ' invalid' : '')}
              data-testid="list-item"
            >
              {type === 'span' && (
                <React.Fragment>
                  <span
                    className="structure-title"
                    data-testid="timespan-label"
                  >
                    {!valid && (
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="icon-invalid"
                      />
                    )}{' '}
                    {label} ({begin} - {end})
                  </span>
                </React.Fragment>
              )}
              {(type === 'div' || type === 'root') && (
                <div
                  className="structure-title heading"
                  data-testid="heading-label"
                >
                  {label}
                </div>
              )}
              <ListItemControls
                handleDelete={this.handleDelete}
                handleEditClick={this.handleEditClick}
                item={itemProp}
                handleShowDropTargetsClick={this.handleShowDropTargetsClick}
              />
            </div>
          )}

          {subMenu}
        </li>
      )
    );
  }
}

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
  smData: state.structuralMetadata.smData,
});

const ConnectedDropTarget = DropTarget(ItemTypes.SPAN, spanTarget, collectDrop);
const ConnectedDragSource = DragSource(ItemTypes.SPAN, spanSource, collectDrag);
const DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

export default connect(mapStateToProps, mapDispatchToProps)(DragConnected);
