"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactDnd = require("react-dnd");
var _reactRedux = require("react-redux");
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var _ListItemEditForm = _interopRequireDefault(require("./ListItemEditForm"));
var _ListItemControls = _interopRequireDefault(require("./ListItemControls"));
var _Constants = require("../services/Constants");
var actions = _interopRequireWildcard(require("../actions/sm-data"));
var _smeHooks = require("../services/sme-hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var ListItem = function ListItem(_ref) {
  var item = _ref.item,
    children = _ref.children;
  // Dispatch actions to Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var addDropTargets = function addDropTargets(item) {
    return dispatch(actions.addDropTargets(item));
  };
  var removeDropTargets = function removeDropTargets() {
    return dispatch(actions.removeDropTargets());
  };
  var removeActiveDragSources = function removeActiveDragSources() {
    return dispatch(actions.removeActiveDragSources());
  };
  var setActiveDragSource = function setActiveDragSource(id) {
    return dispatch(actions.setActiveDragSource(id));
  };
  var handleListItemDrop = function handleListItemDrop(item, dropItem) {
    return dispatch(actions.handleListItemDrop(item, dropItem));
  };
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    deleteStructItem = _useStructureUpdate.deleteStructItem,
    updateEditingTimespans = _useStructureUpdate.updateEditingTimespans;
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    editing = _useState2[0],
    setEditing = _useState2[1];
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  var nodeRef = (0, _react.useRef)(null);

  // Wire the component into DnD system as a drag source
  var _useDrag = (0, _reactDnd.useDrag)(function () {
      return {
        type: _Constants.ItemTypes.SPAN,
        item: {
          id: item.id
        },
        // Call this function when the item is dropped
        end: function end(item, monitor) {
          try {
            // Get the dropItem saved in PlaceholderItem
            var dropResult = monitor.getDropResult();
            if (dropResult && item && dropResult !== null && dropResult !== void 0 && dropResult.dropItem) {
              handleListItemDrop(item, dropResult.dropItem);
            }
          } catch (error) {
            showBoundary(error);
          }
        }
      };
    }, [item.id]),
    _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 2),
    isDragging = _useDrag2[0].isDragging,
    drag = _useDrag2[1];
  var handleDelete = function handleDelete() {
    try {
      deleteStructItem(item);
    } catch (error) {
      showBoundary(error);
    }
  };
  var handleEditClick = function handleEditClick() {
    updateEditingTimespans(1);
    setEditing(true);
  };
  var handleEditFormCancel = function handleEditFormCancel() {
    setEditing(false);
    updateEditingTimespans(0);
  };
  var handleShowDropTargetsClick = function handleShowDropTargetsClick() {
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
  var begin = item.begin,
    end = item.end,
    nestedSpan = item.nestedSpan,
    items = item.items,
    label = item.label,
    type = item.type,
    active = item.active,
    valid = item.valid;
  var itemProp = {
    childrenCount: items ? items.length : 0,
    label: label,
    type: type,
    active: active,
    nestedSpan: nestedSpan
  };

  /**
   * Add drag source ref to nodeRef
   * @param {Object} el 
   */
  var dragRef = function dragRef(el) {
    nodeRef.current = el;
    drag(el);
  };
  return /*#__PURE__*/_react["default"].createElement("li", {
    key: item.id,
    ref: dragRef,
    className: active ? 'active' : '',
    style: {
      opacity: isDragging ? 0.5 : 1
    }
  }, editing && /*#__PURE__*/_react["default"].createElement(_ListItemEditForm["default"], {
    item: item,
    handleEditFormCancel: handleEditFormCancel
  }), !editing && /*#__PURE__*/_react["default"].createElement("div", {
    className: "d-flex justify-content-between row-wrapper ".concat(!valid ? ' invalid' : ''),
    "data-testid": "list-item"
  }, type === 'span' && /*#__PURE__*/_react["default"].createElement("span", {
    className: "structure-title",
    "data-testid": "timespan-label"
  }, !valid && /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faExclamationTriangle,
    className: "icon-invalid"
  }), ' ', label, " (", begin, " - ", end, ")"), (type === 'div' || type === 'root') && /*#__PURE__*/_react["default"].createElement("div", {
    className: "structure-title heading",
    "data-testid": "heading-label"
  }, !valid && type !== 'root' && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faExclamationTriangle,
    className: "icon-invalid",
    title: "Please add at least one timespan or remove this heading."
  }), ' '), label), /*#__PURE__*/_react["default"].createElement(_ListItemControls["default"], {
    handleDelete: handleDelete,
    handleEditClick: handleEditClick,
    item: itemProp,
    handleShowDropTargetsClick: handleShowDropTargetsClick
  })), children);
};
ListItem.propTypes = {
  item: _propTypes["default"].shape({
    active: _propTypes["default"].bool,
    begin: _propTypes["default"].string,
    end: _propTypes["default"].string,
    items: _propTypes["default"].array,
    id: _propTypes["default"].string,
    type: _propTypes["default"].string,
    editing: _propTypes["default"].bool,
    valid: _propTypes["default"].bool
  }),
  children: _propTypes["default"].node
};
var _default = exports["default"] = ListItem;