"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

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

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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

var ListItem = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(ListItem, _Component);

  var _super = _createSuper(ListItem);

  function ListItem() {
    var _this;

    (0, _classCallCheck2["default"])(this, ListItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      editing: false,
      canDrag: _this.props.canDrag,
      focused: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "node", undefined);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDelete", function () {
      var item = _this.props.item;

      _this.props.deleteItem(item.id);

      _this.props.deleteSegment(item);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleEditClick", function () {
      // Disable the edit buttons of other list items
      _this.props.handleEditingTimespans(1, _this.props.smDataIsValid);

      _this.setState({
        editing: true
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleEditFormCancel", function () {
      _this.setState({
        editing: false
      }); // Enable the edit buttons of other list items


      _this.props.handleEditingTimespans(0, _this.props.smDataIsValid);
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onFocus", function () {
      return _this.setState({
        focused: true
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onBlur", function () {
      return _this.setState({
        focused: false
      });
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
          valid = _this$props2.item.valid,
          connectDragSource = _this$props2.connectDragSource,
          connectDropTarget = _this$props2.connectDropTarget;
      var subMenu = items && items.length > 0 ? /*#__PURE__*/_react["default"].createElement(_List["default"], {
        items: items
      }) : null;
      var itemProp = {
        childrenCount: items ? items.length : 0,
        label: label,
        type: type,
        active: active
      };
      return connectDragSource(connectDropTarget( /*#__PURE__*/_react["default"].createElement("li", {
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
      }, this.state.editing && /*#__PURE__*/_react["default"].createElement(_ListItemEditForm["default"], {
        item: item,
        handleEditFormCancel: this.handleEditFormCancel
      }), !this.state.editing && /*#__PURE__*/_react["default"].createElement("div", {
        className: 'row-wrapper' + (!valid ? ' invalid' : ''),
        "data-testid": "list-item"
      }, type === 'span' && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("span", {
        className: "structure-title",
        "data-testid": "timespan-label"
      }, !valid && /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
        icon: _freeSolidSvgIcons.faExclamationTriangle,
        className: "icon-invalid"
      }), ' ', label, " (", begin, " - ", end, ")")), (type === 'div' || type === 'root') && /*#__PURE__*/_react["default"].createElement("div", {
        className: "structure-title heading",
        "data-testid": "heading-label"
      }, label), /*#__PURE__*/_react["default"].createElement(_ListItemControls["default"], {
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
    smData: state.structuralMetadata.smData,
    smDataIsValid: state.structuralMetadata.smDataIsValid
  };
};

var ConnectedDropTarget = (0, _reactDnd.DropTarget)(_Constants.ItemTypes.SPAN, spanTarget, collectDrop);
var ConnectedDragSource = (0, _reactDnd.DragSource)(_Constants.ItemTypes.SPAN, spanSource, collectDrag);
var DragConnected = ConnectedDropTarget(ConnectedDragSource(ListItem));

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DragConnected);

exports["default"] = _default;