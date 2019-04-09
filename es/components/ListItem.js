function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import List from './List';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';
import * as peaksActions from '../actions/peaks-instance';
import * as forms from '../actions/forms';
import PropTypes from 'prop-types';
import { ItemTypes } from '../services/Constants';
import { DragSource, DropTarget } from 'react-dnd';
import ListItemEditForm from './ListItemEditForm';
import ListItemControls from './ListItemControls';

var spanSource = {
  beginDrag: function beginDrag(props) {
    return { id: props.item.id };
  }
};

var spanTarget = {
  canDrop: function canDrop(props, monitor) {
    // You can disallow drop based on props or item
    return true;
  }
};

function collectDrag(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}

var ListItem = function (_Component) {
  _inherits(ListItem, _Component);

  function ListItem() {
    var _temp, _this, _ret;

    _classCallCheck(this, ListItem);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      editing: false
    }, _this.handleDelete = function () {
      var item = _this.props.item;

      _this.props.deleteItem(item.id);
      _this.props.deleteSegment(item);
    }, _this.handleEditClick = function () {
      // Disable the edit buttons of other list items
      _this.props.handleEditingTimespans(0);

      _this.setState({ editing: true });
    }, _this.handleEditFormCancel = function () {
      _this.setState({ editing: false });

      // Enable the edit buttons of other list items
      _this.props.handleEditingTimespans(1);
    }, _this.handleShowDropTargetsClick = function () {
      var _this$props = _this.props,
          addDropTargets = _this$props.addDropTargets,
          item = _this$props.item,
          removeActiveDragSources = _this$props.removeActiveDragSources,
          removeDropTargets = _this$props.removeDropTargets,
          setActiveDragSource = _this$props.setActiveDragSource;

      // Clear out any current drop targets

      removeDropTargets();

      // Handle closing of current drag source drop targets, and exit with a clean UI.
      if (item.active === true) {
        // Clear out any active drag sources
        removeActiveDragSources();
        return;
      }
      // Clear out any active drag sources
      removeActiveDragSources();

      // Calculate possible drop targets
      addDropTargets(item);

      // Redux way of setting active drag list item
      setActiveDragSource(item.id);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  ListItem.prototype.render = function render() {
    var _props = this.props,
        item = _props.item,
        begin = _props.item.begin,
        end = _props.item.end,
        items = _props.item.items,
        label = _props.item.label,
        type = _props.item.type,
        active = _props.item.active,
        connectDragSource = _props.connectDragSource,
        connectDropTarget = _props.connectDropTarget;


    var subMenu = items && items.length > 0 ? React.createElement(List, { items: items }) : null;
    var itemProp = {
      childrenCount: item.items ? item.items.length : 0,
      label: item.label,
      type: item.type
    };

    return connectDragSource(connectDropTarget(React.createElement(
      'li',
      { className: active ? 'active' : '' },
      this.state.editing && React.createElement(ListItemEditForm, {
        item: item,
        handleEditFormCancel: this.handleEditFormCancel
      }),
      !this.state.editing && React.createElement(
        'div',
        { className: 'row-wrapper' },
        type === 'span' && React.createElement(
          'span',
          { className: 'structure-title' },
          label,
          ' (',
          begin,
          ' - ',
          end,
          ')'
        ),
        (type === 'div' || type === 'root') && React.createElement(
          'div',
          { className: 'structure-title heading' },
          label
        ),
        React.createElement(ListItemControls, {
          handleDelete: this.handleDelete,
          handleEditClick: this.handleEditClick,
          item: itemProp,
          handleShowDropTargetsClick: this.handleShowDropTargetsClick
        })
      ),
      subMenu
    )));
  };

  return ListItem;
}(Component);

ListItem.propTypes = process.env.NODE_ENV !== "production" ? {
  item: PropTypes.shape({
    active: PropTypes.bool,
    begin: PropTypes.string,
    end: PropTypes.string,
    items: PropTypes.array,
    id: PropTypes.string,
    type: PropTypes.string,
    editing: PropTypes.bool
  })
} : {};


var mapDispatchToProps = {
  deleteItem: smActions.deleteItem,
  addDropTargets: smActions.addDropTargets,
  removeDropTargets: smActions.removeDropTargets,
  removeActiveDragSources: smActions.removeActiveDragSources,
  setActiveDragSource: smActions.setActiveDragSource,
  deleteSegment: peaksActions.deleteSegment,
  handleEditingTimespans: forms.handleEditingTimespans
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

var ConnectedDropTarget = DropTarget(ItemTypes.SPAN, spanTarget, collectDrop);
var ConnectedDragSource = DragSource(ItemTypes.SPAN, spanSource, collectDrag);
var DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

export default connect(mapStateToProps, mapDispatchToProps)(DragConnected);