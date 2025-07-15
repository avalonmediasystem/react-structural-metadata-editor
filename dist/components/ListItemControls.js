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
var _forms = require("../actions/forms");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
  // Dispatch actions to Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var updateEditingTimespans = function updateEditingTimespans(value) {
    return dispatch((0, _forms.handleEditingTimespans)(value));
  };
  var updateStructStatus = function updateStructStatus(value) {
    return dispatch((0, _forms.updateStructureStatus)(value));
  };

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
    // Change structureIsSaved to false
    updateStructStatus(0);
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