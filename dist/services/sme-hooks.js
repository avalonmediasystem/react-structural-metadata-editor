"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof3 = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTimespanFormValidation = exports.useTextEditor = exports.useStructureUpdate = exports.useFindNeighborTimespans = exports.useFindNeighborSegments = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));
var _formHelper = require("./form-helper");
var _smData = require("../actions/sm-data");
var _forms = require("../actions/forms");
var _peaksInstance = require("../actions/peaks-instance");
var _lodash = require("lodash");
var _uuid = require("uuid");
var _excluded = ["items"],
  _excluded2 = ["active", "timeRange", "nestedSpan", "valid"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof3(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

/**
 * Find sibling and parent timespans of the given Peaks segment. The respective timespans
 * for the calculated peaks segments for siblings and parent are returned. 
 * This makes it easier to use these values in further calculations for validation.
 * @param {Object} obj
 * @param {Object} obj.segment Peaks segment
 * @returns {
 *  prevSiblingRef,
 *  nextSiblingRef,
 *  parentTimespanRef
 * } React refs for siblings and parent timespans
 */
var useFindNeighborSegments = exports.useFindNeighborSegments = function useFindNeighborSegments(_ref) {
  var segment = _ref.segment;
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    duration = _useSelector.duration,
    readyPeaks = _useSelector.readyPeaks;
  var _useSelector2 = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector2.smData;

  // React refs to hold parent timespan, previous and next siblings
  var parentTimespanRef = (0, _react.useRef)(null);
  var prevSiblingRef = (0, _react.useRef)(null);
  var nextSiblingRef = (0, _react.useRef)(null);
  var allSpans = (0, _react.useMemo)(function () {
    return structuralMetadataUtils.getItemsOfType(['span'], smData);
  }, [smData]);
  (0, _react.useEffect)(function () {
    if (readyPeaks && !(0, _lodash.isEmpty)(segment)) {
      var item;
      if (segment._id === 'temp-segment') {
        // Construct a span object from segment when handling timespan creation
        var _id = segment._id,
          _startTime = segment._startTime,
          _endTime = segment._endTime,
          parentId = segment.parentId;
        item = {
          type: 'span',
          label: '',
          id: _id,
          begin: structuralMetadataUtils.toHHmmss(_startTime),
          end: structuralMetadataUtils.toHHmmss(_endTime),
          valid: _startTime < _endTime && _endTime <= duration,
          timeRange: {
            start: _startTime,
            end: _endTime
          },
          parentId: parentId
        };
      } else {
        // Find the existing span object from smData
        item = allSpans.filter(function (span) {
          return span.id === segment._id;
        })[0];
      }
      var _structuralMetadataUt = structuralMetadataUtils.calculateAdjacentTimespans(smData, item),
        possibleParent = _structuralMetadataUt.possibleParent,
        possiblePrevSibling = _structuralMetadataUt.possiblePrevSibling,
        possibleNextSibling = _structuralMetadataUt.possibleNextSibling;
      parentTimespanRef.current = possibleParent;
      prevSiblingRef.current = possiblePrevSibling;
      nextSiblingRef.current = possibleNextSibling;
    }
  }, [segment, readyPeaks]);
  return {
    prevSiblingRef: prevSiblingRef,
    nextSiblingRef: nextSiblingRef,
    parentTimespanRef: parentTimespanRef
  };
};

/**
 * Calculate parent and sibling timespans in the structure for the given timespan.
 * @param {Object} obj 
 * @param {Object} obj.item currently editing timespan item from structure
 * @returns {
 *  prevSiblingRef,
 *  nextSiblingRef,
 *  parentTimespanRef
 * } React refs for sibling and parent timespans
 */
var useFindNeighborTimespans = exports.useFindNeighborTimespans = function useFindNeighborTimespans(_ref2) {
  var item = _ref2.item;
  var _useSelector3 = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector3.smData;

  // React refs to hold parent timespan, previous and next siblings
  var parentTimespanRef = (0, _react.useRef)(null);
  var prevSiblingRef = (0, _react.useRef)(null);
  var nextSiblingRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    var _structuralMetadataUt2 = structuralMetadataUtils.calculateAdjacentTimespans(smData, item),
      possibleParent = _structuralMetadataUt2.possibleParent,
      possiblePrevSibling = _structuralMetadataUt2.possiblePrevSibling,
      possibleNextSibling = _structuralMetadataUt2.possibleNextSibling;
    parentTimespanRef.current = possibleParent;
    prevSiblingRef.current = possiblePrevSibling;
    nextSiblingRef.current = possibleNextSibling;
  }, [item, smData]);
  return {
    prevSiblingRef: prevSiblingRef,
    nextSiblingRef: nextSiblingRef,
    parentTimespanRef: parentTimespanRef
  };
};

/**
 * Validate a given timespan based on its start/end times with respect to its sibling
 * and parent timespans, and its title.
 * @param {Object} obj 
 * @param {String} obj.beginTime
 * @param {String} obj.endTime
 * @param {Object} obj.neighbors sibling and parent timespans of the current timespan
 * @param {String} obj.timespanTitle
 * @returns {
 *  formIsValid,
 *  beginIsValid,
 *  endIsValid
 * }
 */
var useTimespanFormValidation = exports.useTimespanFormValidation = function useTimespanFormValidation(_ref3) {
  var beginTime = _ref3.beginTime,
    endTime = _ref3.endTime,
    neighbors = _ref3.neighbors,
    timespanTitle = _ref3.timespanTitle;
  var _useSelector4 = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    duration = _useSelector4.duration;
  var prevSiblingRef = neighbors.prevSiblingRef,
    nextSiblingRef = neighbors.nextSiblingRef,
    parentTimespanRef = neighbors.parentTimespanRef;
  var getBeginTimeConstraint = function getBeginTimeConstraint() {
    var prevSiblingEnd, parentBegin;
    if (prevSiblingRef.current) {
      prevSiblingEnd = structuralMetadataUtils.toMs(prevSiblingRef.current.end);
    }
    if (parentTimespanRef.current) {
      parentBegin = structuralMetadataUtils.toMs(parentTimespanRef.current.begin);
    }
    if (!prevSiblingEnd && parentBegin || prevSiblingEnd < parentBegin) {
      return parentBegin;
    } else {
      return prevSiblingEnd;
    }
  };
  var getEndTimeConstraint = function getEndTimeConstraint() {
    var nextSiblingStart, parentEnd;
    if (nextSiblingRef.current) {
      nextSiblingStart = structuralMetadataUtils.toMs(nextSiblingRef.current.begin);
    }
    if (parentTimespanRef.current) {
      parentEnd = structuralMetadataUtils.toMs(parentTimespanRef.current.end);
    }
    if (!nextSiblingStart && parentEnd || nextSiblingStart > parentEnd) {
      return parentEnd;
    } else {
      return nextSiblingStart;
    }
  };
  var isBeginValid = (0, _react.useMemo)(function () {
    // First check for format and ordering validation
    var standardValid = (0, _formHelper.getValidationBeginState)(beginTime, endTime);
    if (!standardValid) return false;
    var constraint = getBeginTimeConstraint();
    if (constraint) {
      // Begin time must be >= constraint time
      return structuralMetadataUtils.toMs(beginTime) >= constraint;
    }
    return true;
  }, [beginTime, endTime]);
  var isEndValid = (0, _react.useMemo)(function () {
    // First check for format and ordering validation
    var standardValid = (0, _formHelper.getValidationEndState)(beginTime, endTime, duration);
    if (!standardValid) return false;
    var constraint = getEndTimeConstraint();
    if (constraint) {
      // End time must be <= constraint time
      return structuralMetadataUtils.toMs(endTime) <= constraint;
    }
    return true;
  }, [beginTime, endTime]);
  var formIsValid = (0, _react.useMemo)(function () {
    var titleValid = (0, _formHelper.isTitleValid)(timespanTitle);
    return titleValid && isBeginValid && isEndValid;
  }, [timespanTitle, isBeginValid, isEndValid]);
  return {
    formIsValid: formIsValid,
    isBeginValid: isBeginValid,
    isEndValid: isEndValid
  };
};

/**
 * Perform Redux state updates during CRUD operations performed on structure
 * @returns {
 *  deleteStructItem,
 *  updateEditingTimespans,
 *  updateStructure,
 * }
 */
var useStructureUpdate = exports.useStructureUpdate = function useStructureUpdate() {
  var dispatch = (0, _reactRedux.useDispatch)();
  var _useSelector5 = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector5.smData,
    smDataIsValid = _useSelector5.smDataIsValid;
  var _useSelector6 = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    duration = _useSelector6.duration;
  var updateStructure = function updateStructure() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : smData;
    var _structuralMetadataUt3 = structuralMetadataUtils.buildSMUI(items, duration),
      newSmData = _structuralMetadataUt3.newSmData,
      newSmDataStatus = _structuralMetadataUt3.newSmDataStatus;
    dispatch((0, _smData.updateSMUI)(newSmData, newSmDataStatus));
    // Remove invalid structure alert when data is corrected
    if (newSmDataStatus) {
      dispatch((0, _forms.clearExistingAlerts)());
      dispatch((0, _forms.updateStructureStatus)(0));
    }
  };
  var deleteStructItem = function deleteStructItem(item) {
    // Clone smData and remove the item manually
    var clonedItems = structuralMetadataUtils.deleteListItem(item.id, smData);

    // Update structure with the item removed
    updateStructure(clonedItems);

    // Remove the Peaks segment from the peaks instance
    dispatch((0, _peaksInstance.deleteSegment)(item));
  };
  var updateEditingTimespans = function updateEditingTimespans(code) {
    (0, _forms.handleEditingTimespans)(code);
    /**
     * Remove dismissible alerts when a CRUD action has been initiated
     * given editing is starting (code = 1) and structure is validated.
     */
    if (code == 1 && smDataIsValid) {
      dispatch((0, _forms.clearExistingAlerts)());
    }
  };
  return {
    deleteStructItem: deleteStructItem,
    updateEditingTimespans: updateEditingTimespans,
    updateStructure: updateStructure
  };
};

/**
 * Manage TextEditor related operations to clean, format, update and restore
 * JSON structure
 * @returns {
 *   formatJson,
 *   injectTemplate,
 *   restoreRemovedProps,
 *   sanitizeDisplayedText
 * }
 */
var useTextEditor = exports.useTextEditor = function useTextEditor() {
  // Dispatch actions to Redux store
  var dispatch = (0, _reactRedux.useDispatch)();
  var createNewSegment = function createNewSegment(span) {
    return dispatch((0, _peaksInstance.insertNewSegment)(span));
  };
  var updateSegment = function updateSegment(state) {
    return dispatch((0, _peaksInstance.saveSegment)(state));
  };
  var removeSegment = function removeSegment(item) {
    return dispatch((0, _peaksInstance.deleteSegment)(item));
  };
  var _useSelector7 = (0, _reactRedux.useSelector)(function (state) {
      return state.peaksInstance;
    }),
    peaks = _useSelector7.peaks;

  /**
   * Format JSON with 2-space indentation for displaying in the text editor.
   * Re-arrange properties so that, 'items' property comes last in each 'div'.
   */
  var formatJson = (0, _react.useCallback)(function (data) {
    try {
      return JSON.stringify(data, function (_key, value) {
        if (value && (0, _typeof2["default"])(value) === 'object' && !Array.isArray(value)) {
          // Re-order properties to set 'items' last
          var items = value.items,
            rest = (0, _objectWithoutProperties2["default"])(value, _excluded);
          return items !== undefined ? _objectSpread(_objectSpread({}, rest), {}, {
            items: items
          }) : value;
        }
        return value;
      }, 2);
    } catch (error) {
      return 'Error formatting JSON structure..';
    }
  }, []);

  /**
   * Remove extra properties in the JSON structure for the text editor display
   */
  var sanitizeDisplayedText = (0, _react.useCallback)(function (data) {
    if (!data) return data;
    var _removeProps = function removeProps(obj) {
      if (Array.isArray(obj)) {
        return obj.map(_removeProps);
      } else if (obj && (0, _typeof2["default"])(obj) === 'object') {
        var _rest$items;
        var active = obj.active,
          timeRange = obj.timeRange,
          nestedSpan = obj.nestedSpan,
          valid = obj.valid,
          rest = (0, _objectWithoutProperties2["default"])(obj, _excluded2);
        if (((_rest$items = rest.items) === null || _rest$items === void 0 ? void 0 : _rest$items.length) === 0) delete rest.items;
        var filtered = {};
        for (var key in rest) {
          filtered[key] = _removeProps(rest[key]);
        }
        return filtered;
      }
      return obj;
    };
    return _removeProps(data);
  }, []);

  /**
   * Restore removed properties onto edited data before saving it back to Redux store
   */
  var restoreRemovedProps = function restoreRemovedProps(editedData) {
    var textTimespanIds = [];
    var _restore = function restore(obj) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      if (Array.isArray(obj)) {
        return obj.map(function (item, index) {
          return _restore(item, [].concat((0, _toConsumableArray2["default"])(path), [index]));
        });
      } else if (obj && (0, _typeof2["default"])(obj) === 'object') {
        var restored = _objectSpread({}, obj);

        // Generate a new ID if one doesn't exists
        if (!restored.id) {
          restored.id = (0, _uuid.v4)();
        }

        // If the item is a timespan, verify a corresponding Peaks segment exists
        if (restored.type === 'span') {
          var segment = peaks.segments.getSegment(restored.id);
          if (!segment) {
            // Create a new segment in Peaks instance if not found
            createNewSegment(restored);
          } else {
            // Update existing segment with the changes in the text editor
            var begin = restored.begin,
              end = restored.end,
              label = restored.label;
            updateSegment({
              beginTime: begin,
              endTime: end,
              clonedSegment: segment,
              timespanTitle: label
            });
          }
          textTimespanIds.push(restored.id);
        }
        if (restored.items) {
          restored.items = _restore(restored.items, [].concat((0, _toConsumableArray2["default"])(path), ['items']));
        }
        return restored;
      }
      return obj;
    };
    var restoredData = _restore(editedData);

    // Delete segments from Peaks instance that were removed in text editor
    var allSegments = peaks.segments.getSegments().map(function (seg) {
      return {
        id: seg._id,
        segment: seg
      };
    });
    if ((textTimespanIds === null || textTimespanIds === void 0 ? void 0 : textTimespanIds.length) > 0) {
      allSegments.forEach(function (seg) {
        var id = seg.id,
          segment = seg.segment;
        if (!textTimespanIds.includes(id)) {
          removeSegment({
            id: id,
            label: segment._labelText,
            type: 'span'
          });
        }
      });
    }
    return restoredData;
  };

  /**
   * Insert a given template object to text editor and move the cursor inside the empty label
   * value field
   * @param {React.RefObject} editorViewRef React ref for CodeMirror text editor
   * @param {Object} template injected template object
   */
  var injectTemplate = function injectTemplate(editorViewRef, template) {
    // Create a new id for the template item
    template.id = (0, _uuid.v4)();
    var templateString = JSON.stringify(template, null, 2) + ',';
    var view = editorViewRef.current;
    var cursor = view.state.selection.main.head;

    // Insert the template at cursor position
    view.dispatch({
      changes: {
        from: cursor,
        insert: templateString
      }
    });

    // Find the position of the label value
    var labelPattern = '"label": "';
    var labelIndex = templateString.indexOf(labelPattern);
    if (labelIndex !== -1) {
      // Position cursor inside empty quotes for label property in the new item
      var labelValuePos = cursor + labelIndex + labelPattern.length;
      view.dispatch({
        selection: {
          anchor: labelValuePos
        }
      });
    }

    // Focus the editor
    view.focus();
  };
  return {
    formatJson: formatJson,
    injectTemplate: injectTemplate,
    restoreRemovedProps: restoreRemovedProps,
    sanitizeDisplayedText: sanitizeDisplayedText
  };
};