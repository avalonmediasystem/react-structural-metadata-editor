"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = require("react-dom");

var _List = _interopRequireDefault(require("./List"));

var _reactRedux = require("react-redux");

var smActions = _interopRequireWildcard(require("../actions/sm-data"));

var _peaksInstance = require("../actions/peaks-instance");

var _forms = require("../actions/forms");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Constants = require("../services/Constants");

var _reactDnd = require("react-dnd");

var _ListItemEditForm = _interopRequireDefault(require("./ListItemEditForm"));

var _ListItemControls = _interopRequireDefault(require("./ListItemControls"));

var spanSource = {
  // canDrag prop is turned false/true based on mouse events mouseenter/mouseleave
  // respectively. This takes place when an item is being edited inline.
  canDrag: function canDrag(props) {
    // props.canDrag = false => dragging is disabled
    return props.canDrag;
  },
  beginDrag: function beginDrag(props) {
    return {
      id: props.item.id
    };
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
    isOverCurrent: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}

var ListItem =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(ListItem, _Component);

  function ListItem() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, ListItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(ListItem)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      editing: false,
      canDrag: _this.props.canDrag
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "node", undefined);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDelete", function () {
      var item = _this.props.item;

      _this.props.deleteItem(item.id);

      _this.props.deleteSegment(item);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleEditClick", function () {
      // Disable the edit buttons of other list items
      _this.props.handleEditingTimespans(1);

      _this.setState({
        editing: true
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleEditFormCancel", function () {
      _this.setState({
        editing: false
      }); // Enable the edit buttons of other list items


      _this.props.handleEditingTimespans(0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleShowDropTargetsClick", function () {
      var _this$props = _this.props,
          addDropTargets = _this$props.addDropTargets,
          item = _this$props.item,
          removeActiveDragSources = _this$props.removeActiveDragSources,
          removeDropTargets = _this$props.removeDropTargets,
          setActiveDragSource = _this$props.setActiveDragSource; // Disable other editing actions

      _this.props.handleEditingTimespans(1); // Clear out any current drop targets


      removeDropTargets(); // Handle closing of current drag source drop targets, and exit with a clean UI.

      if (item.active === true) {
        // Clear out any active drag sources
        removeActiveDragSources(); // Enable other editing actions

        _this.props.handleEditingTimespans(0);

        return;
      } // Clear out any active drag sources


      removeActiveDragSources(); // Calculate possible drop targets

      addDropTargets(item); // Redux way of setting active drag list item

      setActiveDragSource(item.id);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getInputElements", function (node) {
      return node ? Array.prototype.slice.call(node.getElementsByTagName('input')).filter(function (e) {
        return !e.readOnly;
      }) : [];
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onHoverOverInput", function () {
      _this.props.setCanDrag(false);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onHoverOutOfInput", function () {
      _this.props.setCanDrag(true);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "detachEventListeners", function (node) {
      _this.getInputElements(node).map(function (e) {
        e.removeEventListener('mouseleave', _this.onHoverOutOfInput);
        e.removeEventListener('mouseenter', _this.onHoverOverInput);
      });
    });
    return _this;
  }

  (0, _createClass2["default"])(ListItem, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.detachEventListeners(this.node);
      this.node = undefined;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          item = _this$props2.item,
          canDrag = _this$props2.canDrag,
          begin = _this$props2.item.begin,
          end = _this$props2.item.end,
          items = _this$props2.item.items,
          label = _this$props2.item.label,
          type = _this$props2.item.type,
          active = _this$props2.item.active,
          connectDragSource = _this$props2.connectDragSource,
          connectDropTarget = _this$props2.connectDropTarget;
      var subMenu = items && items.length > 0 ? _react["default"].createElement(_List["default"], {
        items: items
      }) : null;
      var itemProp = {
        childrenCount: item.items ? item.items.length : 0,
        label: item.label,
        type: item.type,
        active: item.active
      };
      return connectDragSource(connectDropTarget(_react["default"].createElement("li", {
        className: active ? 'active' : '',
        ref: function ref(instance) {
          _this2.detachEventListeners(_this2.node);

          _this2.node = (0, _reactDom.findDOMNode)(instance);

          if (canDrag) {
            _this2.getInputElements(_this2.node).map(function (e) {
              e.addEventListener('mouseenter', _this2.onHoverOverInput);
            });
          } else {
            _this2.getInputElements(_this2.node).map(function (e) {
              e.addEventListener('mouseleave', _this2.onHoverOutOfInput);
            });
          }
        }
      }, this.state.editing && _react["default"].createElement(_ListItemEditForm["default"], {
        item: item,
        handleEditFormCancel: this.handleEditFormCancel
      }), !this.state.editing && _react["default"].createElement("div", {
        className: "row-wrapper"
      }, type === 'span' && _react["default"].createElement("span", {
        className: "structure-title",
        "data-testid": "timespan-label"
      }, label, " (", begin, " - ", end, ")"), (type === 'div' || type === 'root') && _react["default"].createElement("div", {
        className: "structure-title heading",
        "data-testid": "heading-label"
      }, label), _react["default"].createElement(_ListItemControls["default"], {
        handleDelete: this.handleDelete,
        handleEditClick: this.handleEditClick,
        item: itemProp,
        handleShowDropTargetsClick: this.handleShowDropTargetsClick
      })), subMenu)));
    }
  }]);
  return ListItem;
}(_react.Component);

(0, _defineProperty2["default"])(ListItem, "propTypes", {
  item: _propTypes["default"].shape({
    active: _propTypes["default"].bool,
    begin: _propTypes["default"].string,
    end: _propTypes["default"].string,
    items: _propTypes["default"].array,
    id: _propTypes["default"].string,
    type: _propTypes["default"].string,
    editing: _propTypes["default"].bool
  })
});
var mapDispatchToProps = {
  deleteItem: smActions.deleteItem,
  addDropTargets: smActions.addDropTargets,
  removeDropTargets: smActions.removeDropTargets,
  removeActiveDragSources: smActions.removeActiveDragSources,
  setActiveDragSource: smActions.setActiveDragSource,
  deleteSegment: _peaksInstance.deleteSegment,
  handleEditingTimespans: _forms.handleEditingTimespans
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData
  };
};

var ConnectedDropTarget = (0, _reactDnd.DropTarget)(_Constants.ItemTypes.SPAN, spanTarget, collectDrop);
var ConnectedDragSource = (0, _reactDnd.DragSource)(_Constants.ItemTypes.SPAN, spanSource, collectDrag);
var DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DragConnected);

exports["default"] = _default;