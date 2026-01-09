"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactRedux = require("react-redux");
var _TimespanInlineForm = _interopRequireDefault(require("./TimespanInlineForm"));
var _HeadingInlineForm = _interopRequireDefault(require("./HeadingInlineForm"));
var _lodash = require("lodash");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _smeHooks = require("../services/sme-hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var ListItemEditForm = function ListItemEditForm(_ref) {
  var item = _ref.item,
    handleEditFormCancel = _ref.handleEditFormCancel;
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateStructure = _useStructureUpdate.updateStructure;

  // Get state variables from Redux store
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    isTyping = _useState2[0],
    _setIsTyping = _useState2[1];
  var _useState3 = (0, _react.useState)(true),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    isInitializing = _useState4[0],
    _setIsInitializing = _useState4[1];
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  (0, _react.useEffect)(function () {
    return function () {
      setIsTyping(false);
      setIsInitializing(true);
    };
  });

  // Toggle isTyping flag on and off from events in TimespanInlinForm
  var setIsTyping = function setIsTyping(value) {
    if (value === 1) {
      _setIsTyping(true);
    } else {
      _setIsTyping(false);
    }
  };

  // Toggle isInitializing flag on and off from events in TimespanInlinForm
  var setIsInitializing = function setIsInitializing(value) {
    if (value === 1) {
      _setIsInitializing(true);
    } else {
      _setIsInitializing(false);
    }
  };
  var addUpdatedValues = function addUpdatedValues(item, payload) {
    if (item.type === 'div' || item.type === 'root') {
      item.label = payload.headingTitle;
    } else if (item.type === 'span') {
      item.label = payload.timespanTitle;
      item.begin = payload.beginTime;
      item.end = payload.endTime;
    }
    return item;
  };
  var handleCancelClick = function handleCancelClick(e) {
    handleEditFormCancel();
  };
  var handleSaveClick = function handleSaveClick(id, payload) {
    try {
      // Clone smData
      var clonedItems = (0, _lodash.cloneDeep)(smData);

      // Get the original item
      /* eslint-disable */
      var _item = structuralMetadataUtils.findItem(id, clonedItems);
      /* eslint-enable */

      // Update item values
      _item = addUpdatedValues(_item, payload);

      // Send updated smData back to redux via custom hook
      updateStructure(clonedItems);

      // Turn off editing state
      handleEditFormCancel();
    } catch (error) {
      showBoundary(error);
    }
  };
  if (item.type === 'span') {
    return /*#__PURE__*/_react["default"].createElement(_TimespanInlineForm["default"], {
      item: item,
      cancelFn: handleCancelClick,
      saveFn: handleSaveClick,
      setIsTyping: setIsTyping,
      isTyping: isTyping,
      isInitializing: isInitializing,
      setIsInitializing: setIsInitializing
    });
  }
  if (item.type === 'div' || item.type === 'root') {
    return /*#__PURE__*/_react["default"].createElement(_HeadingInlineForm["default"], {
      itemId: item.id,
      cancelFn: handleCancelClick,
      saveFn: handleSaveClick
    });
  }
};
ListItemEditForm.propTypes = {
  item: _propTypes["default"].object.isRequired,
  handleEditFormCancel: _propTypes["default"].func
};
var _default = exports["default"] = ListItemEditForm;