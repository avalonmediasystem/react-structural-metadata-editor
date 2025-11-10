"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTimespanFormValidation = exports.useFindNeighborTimespans = exports.useFindNeighborSegments = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));
var _WaveformDataUtils = _interopRequireDefault(require("./WaveformDataUtils"));
var _formHelper = require("./form-helper");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var waveformDataUtils = new _WaveformDataUtils["default"]();

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
    peaks = _useSelector.peaks,
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
    if (readyPeaks && segment) {
      // All segments sorted by start time
      var allSegments = waveformDataUtils.sortSegments(peaks, 'startTime');
      var otherSegments = allSegments.filter(function (seg) {
        return seg.id !== segment.id;
      });
      var startTime = segment.startTime,
        endTime = segment.endTime;

      // Find potential parent segments
      var potentialParents = otherSegments.filter(function (seg) {
        return seg.startTime <= startTime && seg.endTime >= endTime;
      });
      var potentialParentIds = (potentialParents === null || potentialParents === void 0 ? void 0 : potentialParents.length) > 0 ? potentialParents.map(function (p) {
        return p._id;
      }) : [];

      // Get the most immediate parent
      var parent = potentialParents.reduce(function (closest, seg) {
        if (!closest) return seg;
        var currentRange = seg.endTime - seg.startTime;
        var closestRange = closest.endTime - closest.startTime;
        return currentRange < closestRange ? seg : closest;
      }, null);
      parentTimespanRef.current = parent ? allSpans.find(function (span) {
        return span.id === parent._id;
      }) : null;
      // When calculating the previous sibling omit potential parent timespans, as their startTimes are
      // less than or equal to the current segment's startTime
      var siblingsBefore = otherSegments.filter(function (seg) {
        return seg.startTime <= startTime && !(potentialParentIds !== null && potentialParentIds !== void 0 && potentialParentIds.includes(seg._id));
      });
      if ((siblingsBefore === null || siblingsBefore === void 0 ? void 0 : siblingsBefore.length) > 0) {
        prevSiblingRef.current = allSpans.find(function (span) {
          return span.id === siblingsBefore.at(-1)._id;
        });
      }
      ;
      var siblingsAfter = otherSegments.filter(function (seg) {
        return seg.startTime >= endTime;
      });
      if ((siblingsAfter === null || siblingsAfter === void 0 ? void 0 : siblingsAfter.length) > 0) {
        nextSiblingRef.current = allSpans.find(function (span) {
          return span.id === siblingsAfter[0]._id;
        });
      }
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

  // Find the parent timespan if it exists
  var parentDiv = (0, _react.useMemo)(function () {
    if (item) {
      return structuralMetadataUtils.getParentItem(item, smData);
    }
  }, [item, smData]);
  (0, _react.useEffect)(function () {
    if (parentDiv && parentDiv.type === 'span') {
      parentTimespanRef.current = parentDiv;
    } else {
      parentTimespanRef.current = null;
    }

    // Find previous and next siblings in the hierarchy
    if (parentDiv && parentDiv.items) {
      var siblings = parentDiv.items.filter(function (sibling) {
        return sibling.type === 'span';
      });
      var currentIndex = siblings.findIndex(function (sibling) {
        return sibling.id === item.id;
      });
      prevSiblingRef.current = currentIndex > 0 ? siblings[currentIndex - 1] : null;
      nextSiblingRef.current = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
    } else if (item) {
      var _siblings = structuralMetadataUtils.getItemsOfType(['span'], smData);
      var _currentIndex = _siblings.findIndex(function (sibling) {
        return sibling.id === item.id;
      });
      prevSiblingRef.current = _currentIndex > 0 ? _siblings[_currentIndex - 1] : null;
      nextSiblingRef.current = _currentIndex < _siblings.length - 1 ? _siblings[_currentIndex + 1] : null;
    }
  }, [parentDiv, item]);
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
    // Sibling's end time takes precedence over parent's start time
    if (prevSiblingRef.current) {
      return prevSiblingRef.current.end;
    }
    if (parentTimespanRef.current) {
      return parentTimespanRef.current.begin;
    }
    return null;
  };
  var getEndTimeConstraint = function getEndTimeConstraint() {
    // Sibling's start time takes precedence over parent's end time
    if (nextSiblingRef.current) {
      return nextSiblingRef.current.begin;
    }
    if (parentTimespanRef.current) {
      return parentTimespanRef.current.end;
    }
    return null;
  };
  var isBeginValid = (0, _react.useMemo)(function () {
    // First check for format and ordering validation
    var standardValid = (0, _formHelper.getValidationBeginState)(beginTime, endTime);
    if (!standardValid) return false;
    var constraint = getBeginTimeConstraint();
    if (constraint) {
      // Begin time must be >= constraint time
      return structuralMetadataUtils.toMs(beginTime) >= structuralMetadataUtils.toMs(constraint);
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
      return structuralMetadataUtils.toMs(endTime) <= structuralMetadataUtils.toMs(constraint);
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