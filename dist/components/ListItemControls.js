"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _ButtonToolbar = _interopRequireDefault(require("react-bootstrap/ButtonToolbar"));
var _OverlayTrigger = _interopRequireDefault(require("react-bootstrap/OverlayTrigger"));
var _Popover = _interopRequireDefault(require("react-bootstrap/Popover"));
var _PopoverBody = _interopRequireDefault(require("react-bootstrap/PopoverBody"));
var _PopoverHeader = _interopRequireDefault(require("react-bootstrap/PopoverHeader"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _reactRedux = require("react-redux");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var _smeHooks = require("../services/sme-hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var styles = {
  buttonToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  popover: {
    width: '250px',
    height: 'auto'
  }
};
var ListItemControls = function ListItemControls(_ref) {
  var handleDelete = _ref.handleDelete,
    handleEditClick = _ref.handleEditClick,
    handleShowDropTargetsClick = _ref.handleShowDropTargetsClick,
    item = _ref.item;
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateEditingTimespans = _useStructureUpdate.updateEditingTimespans;

  // Get state variables from Redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.forms;
    }),
    editingDisabled = _useSelector.editingDisabled;
  var _useState = (0, _react.useState)(''),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    deleteMessage = _useState2[0],
    setDeleteMessage = _useState2[1];
  var _useState3 = (0, _react.useState)(false),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    showDeleteConfirm = _useState4[0],
    setShowDeleteConfirm = _useState4[1];
  var enableEditing = function enableEditing() {
    // Enable editing of other list items
    updateEditingTimespans(0);
  };
  var handleConfirmDelete = function handleConfirmDelete() {
    handleDelete();
    enableEditing();
    setDeleteMessage('');
    setShowDeleteConfirm(false);
  };
  var handleDeleteClick = function handleDeleteClick(e) {
    var childrenCount = item.childrenCount,
      label = item.label;
    var deleteMessage = "Are you sure you'd like to delete <strong>".concat(label, "</strong>");
    if (childrenCount > 0) {
      var puralizedItem = childrenCount > 1 ? 'items' : 'item';
      deleteMessage += " and it's <strong>".concat(childrenCount, "</strong> child ").concat(puralizedItem);
    }
    deleteMessage += "?";

    // Disable editing of other list items
    updateEditingTimespans(1);
    setDeleteMessage(deleteMessage);
    setShowDeleteConfirm(true);
  };
  var cancelDeleteClick = function cancelDeleteClick(e) {
    enableEditing();
    setShowDeleteConfirm(false);
  };
  var popover = /*#__PURE__*/_react["default"].createElement(_Popover["default"], {
    "data-testid": "delete-confirmation-popup"
  }, /*#__PURE__*/_react["default"].createElement(_PopoverHeader["default"], {
    as: "h3"
  }, "Confirm delete?"), /*#__PURE__*/_react["default"].createElement(_PopoverBody["default"], null, /*#__PURE__*/_react["default"].createElement("p", {
    dangerouslySetInnerHTML: {
      __html: deleteMessage
    },
    "data-testid": "delete-confirmation-message"
  }), /*#__PURE__*/_react["default"].createElement(_ButtonToolbar["default"], {
    style: styles.buttonToolbar
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "danger",
    size: "sm",
    onClick: handleConfirmDelete,
    "data-testid": "delete-confirmation-confirm-btn",
    className: "me-1"
  }, "Delete"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    size: "sm",
    variant: "outline-secondary",
    onClick: cancelDeleteClick,
    "data-testid": "delete-confirmation-cancel-btn"
  }, "Cancel"))));
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "edit-controls-wrapper",
    "data-testid": "list-item-controls"
  }, item.type === 'span' && /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "link",
    disabled: editingDisabled && !item.active,
    onClick: handleShowDropTargetsClick,
    "data-testid": "list-item-dnd-btn"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faDotCircle
  })), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "link",
    onClick: handleEditClick,
    disabled: editingDisabled,
    "data-testid": "list-item-edit-btn"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faPen
  })), item.type !== 'root' && /*#__PURE__*/_react["default"].createElement(_OverlayTrigger["default"], {
    trigger: "click",
    placement: "left",
    show: showDeleteConfirm,
    overlay: popover
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "link",
    onClick: handleDeleteClick,
    disabled: editingDisabled,
    "data-testid": "list-item-delete-btn"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faTrash
  }))));
};
ListItemControls.propTypes = {
  handleDelete: _propTypes["default"].func,
  handleEditClick: _propTypes["default"].func,
  handleShowDropTargetsClick: _propTypes["default"].func,
  item: _propTypes["default"].shape({
    childrenCount: _propTypes["default"].number,
    label: _propTypes["default"].string.isRequired,
    type: _propTypes["default"].string
  })
};
var _default = exports["default"] = ListItemControls;