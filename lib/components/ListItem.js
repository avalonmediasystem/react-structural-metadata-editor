'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _List = require('./List');

var _List2 = _interopRequireDefault(_List);

var _reactRedux = require('react-redux');

var _smData = require('../actions/sm-data');

var smActions = _interopRequireWildcard(_smData);

var _peaksInstance = require('../actions/peaks-instance');

var peaksActions = _interopRequireWildcard(_peaksInstance);

var _forms = require('../actions/forms');

var forms = _interopRequireWildcard(_forms);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Constants = require('../services/Constants');

var _reactDnd = require('react-dnd');

var _ListItemEditForm = require('./ListItemEditForm');

var _ListItemEditForm2 = _interopRequireDefault(_ListItemEditForm);

var _ListItemControls = require('./ListItemControls');

var _ListItemControls2 = _interopRequireDefault(_ListItemControls);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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


    var subMenu = items && items.length > 0 ? _react2.default.createElement(_List2.default, { items: items }) : null;
    var itemProp = {
      childrenCount: item.items ? item.items.length : 0,
      label: item.label,
      type: item.type
    };

    return connectDragSource(connectDropTarget(_react2.default.createElement(
      'li',
      { className: active ? 'active' : '' },
      this.state.editing && _react2.default.createElement(_ListItemEditForm2.default, {
        item: item,
        handleEditFormCancel: this.handleEditFormCancel
      }),
      !this.state.editing && _react2.default.createElement(
        'div',
        { className: 'row-wrapper' },
        type === 'span' && _react2.default.createElement(
          'span',
          { className: 'structure-title' },
          label,
          ' (',
          begin,
          ' - ',
          end,
          ')'
        ),
        (type === 'div' || type === 'root') && _react2.default.createElement(
          'div',
          { className: 'structure-title heading' },
          label
        ),
        _react2.default.createElement(_ListItemControls2.default, {
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
}(_react.Component);

ListItem.propTypes = process.env.NODE_ENV !== "production" ? {
  item: _propTypes2.default.shape({
    active: _propTypes2.default.bool,
    begin: _propTypes2.default.string,
    end: _propTypes2.default.string,
    items: _propTypes2.default.array,
    id: _propTypes2.default.string,
    type: _propTypes2.default.string,
    editing: _propTypes2.default.bool
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

var ConnectedDropTarget = (0, _reactDnd.DropTarget)(_Constants.ItemTypes.SPAN, spanTarget, collectDrop);
var ConnectedDragSource = (0, _reactDnd.DragSource)(_Constants.ItemTypes.SPAN, spanSource, collectDrag);
var DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DragConnected);
module.exports = exports['default'];