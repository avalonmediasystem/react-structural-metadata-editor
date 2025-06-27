"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Colors for segments from Avalon branding pallette
var COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];
var smu = new _StructuralMetadataUtils["default"]();
var WaveformDataUtils = exports["default"] = /*#__PURE__*/function () {
  function WaveformDataUtils() {
    (0, _classCallCheck2["default"])(this, WaveformDataUtils);
  }
  return (0, _createClass2["default"])(WaveformDataUtils, [{
    key: "initSegments",
    value:
    /**
     * Initialize Peaks instance for the app
     * @param {Array} smData - current structured metadata from the server masterfile
     * @param {Number} duration - duration of the media file in seconds
     */
    function initSegments(smData, duration) {
      var _this = this;
      var segments = [];
      var count = 0;

      // Recursively build segments for timespans in the structure
      var _createSegment = function createSegment(items) {
        var _iterator = _createForOfIteratorHelper(items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;
            if (item.type === 'span') {
              count = count > 1 ? 0 : count;
              var segment = item.valid ? _this.convertTimespanToSegment(item) : null;
              segments.push(_objectSpread(_objectSpread({}, segment), {}, {
                color: COLOR_PALETTE[count]
              }));
              count++;
            }
            if (item.items && item.items.length > 0) {
              _createSegment(item.items);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      // Build segments from initial metadata structure
      _createSegment(smData);
      var validSegments = segments.filter(function (s) {
        return s.startTime < s.endTime && s.startTime < duration;
      });
      return validSegments;
    }

    /**
     * Convert timespan to segment to be consumed within peaks instance
     * @param {Object} timespan
     */
  }, {
    key: "convertTimespanToSegment",
    value: function convertTimespanToSegment(timespan) {
      var begin = timespan.begin,
        end = timespan.end,
        label = timespan.label,
        id = timespan.id;
      return {
        startTime: this.timeToS(begin),
        endTime: this.timeToS(end),
        labelText: label,
        id: id
      };
    }

    /**
     * Add a temporary segment to be edited when adding a new timespan to structure
     * @param {Object} peaksInstance - peaks instance for the current waveform
     * @param {Integer} duration - duration of the file in seconds
     * @returns {Object} updated peaksInstance
     */
  }, {
    key: "insertTempSegment",
    value: function insertTempSegment(peaksInstance, duration) {
      var _this2 = this;
      // Current time of the playhead
      var currentTime = this.roundOff(peaksInstance.player.getCurrentTime());
      var rangeEndTime,
        rangeBeginTime = currentTime;
      var currentSegments = this.sortSegments(peaksInstance, 'startTime');

      // Validate start time of the temporary segment
      currentSegments.map(function (segment) {
        if (rangeBeginTime >= segment.startTime && rangeBeginTime <= segment.endTime) {
          // rounds upto 3 decimal points for accuracy
          rangeBeginTime = _this2.roundOff(segment.endTime);
        }
        return rangeBeginTime;
      });

      // Set the default end time of the temporary segment
      if (currentSegments.length === 0) {
        rangeEndTime = duration < 60 ? duration : Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
      } else {
        rangeEndTime = Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
      }

      // Validate end time of the temporary segment
      currentSegments.map(function (segment) {
        if (rangeBeginTime < segment.startTime) {
          var segmentLength = segment.endTime - segment.startTime;
          if (duration < 60) {
            rangeEndTime = duration;
          }
          if (segmentLength < 60 && rangeEndTime >= segment.startTime) {
            rangeEndTime = segment.startTime;
          }
          if (rangeEndTime >= segment.startTime && rangeEndTime < segment.endTime) {
            rangeEndTime = segment.startTime;
          }
        }
        if (rangeEndTime > duration) {
          rangeEndTime = duration;
        }
        return rangeEndTime;
      });
      if (rangeBeginTime < duration && rangeEndTime > rangeBeginTime) {
        var tempSegmentLength = rangeEndTime - rangeBeginTime;
        // Continue if temporary segment has a length greater than 1ms
        if (tempSegmentLength > 0.1) {
          // Move playhead to start of the temporary segment
          peaksInstance.player.seek(rangeBeginTime);
          peaksInstance.segments.add({
            startTime: rangeBeginTime,
            endTime: rangeEndTime,
            editable: true,
            color: COLOR_PALETTE[2],
            id: 'temp-segment'
          });
        }
      }
      return peaksInstance;
    }

    /**
     * Delete the corresponding segment when a timespan is deleted
     * @param {Object} item - item to be deleted
     * @param {Object} peaksInstance - peaks instance for the current waveform
     */
  }, {
    key: "deleteSegments",
    value: function deleteSegments(item, peaksInstance) {
      var _deleteChildren = function deleteChildren(item) {
        var children = item.items;
        var _iterator2 = _createForOfIteratorHelper(children),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var child = _step2.value;
            if (child.type === 'span') {
              peaksInstance.segments.removeById(child.id);
            }
            if (child.items && child.items.length > 0) {
              _deleteChildren(child);
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      };
      if (item.type === 'div') {
        _deleteChildren(item);
      }
      peaksInstance.segments.removeById(item.id);
      return peaksInstance;
    }

    /**
     * Update the colors of the segment to alternate between colors in Avalon color pallette
     * @param {Object} peaksInstance - current peaks instance for the waveform
     */
  }, {
    key: "rebuildPeaks",
    value: function rebuildPeaks(peaksInstance) {
      var _this3 = this;
      var sortedSegments = this.sortSegments(peaksInstance, 'startTime');
      sortedSegments.forEach(function (segment, index) {
        segment.update({
          color: _this3.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0]
        });
      });
      return peaksInstance;
    }

    /**
     * Change color and enable handles for editing the segment in the waveform
     * @param {String} id - ID of the segment to be edited
     * @param {Object} peaksInstance - current peaks instance for the waveform
     * @param {Number} duration - file length in milliseconds
     */
  }, {
    key: "activateSegment",
    value: function activateSegment(id, peaksInstance, duration) {
      this.initialSegmentValidation(id, peaksInstance, duration);
      var segment = peaksInstance.segments.getSegment(id);
      // Setting editable: true -> enables handles
      segment.update({
        editable: true,
        color: COLOR_PALETTE[2]
      });
      var startTime = segment.startTime;
      // Move play head to the start time of the selected segment
      peaksInstance.player.seek(startTime);
      return peaksInstance;
    }

    /**
     * Add a temporary segment to the Peaks instance when editing invalid timespans.
     * Segmetns equivalent to these timespans are not added to the Peaks instance at
     * the time of Peaks initialization.
     * @param {Object} item - invalid item in structure
     * @param {Object} wrapperSpans - timespans before and after the item in structure
     * @param {Object} peaksInstance - current peaks instance
     * @param {Number} duration - duration of the file in seconds
     * @returns peaks instance with an added segment for the invalid timespan
     */
  }, {
    key: "addTempInvalidSegment",
    value: function addTempInvalidSegment(item, wrapperSpans, peaksInstance, duration) {
      var _this$convertTimespan = this.convertTimespanToSegment(item),
        id = _this$convertTimespan.id,
        labelText = _this$convertTimespan.labelText;
      var prevSpan = wrapperSpans.prevSpan,
        nextSpan = wrapperSpans.nextSpan;
      var tempSegment = {
        id: id,
        labelText: labelText,
        editable: true,
        color: COLOR_PALETTE[2]
      };
      if (prevSpan && nextSpan) {
        tempSegment = _objectSpread(_objectSpread({}, tempSegment), {}, {
          startTime: this.timeToS(prevSpan.end),
          endTime: this.timeToS(nextSpan.begin)
        });
      } else if (!prevSpan) {
        tempSegment = _objectSpread(_objectSpread({}, tempSegment), {}, {
          startTime: 0,
          endTime: this.timeToS(nextSpan.begin)
        });
      } else if (!nextSpan) {
        tempSegment = _objectSpread(_objectSpread({}, tempSegment), {}, {
          startTime: this.timeToS(prevSpan.end),
          endTime: duration
        });
      }
      var segment = peaksInstance.segments.getSegment(id);
      if (segment) {
        segment.update(_objectSpread({}, tempSegment));
      } else {
        peaksInstance.segments.add(tempSegment);
      }
      peaksInstance.player.seek(tempSegment.startTime);
      return peaksInstance;
    }

    /**
     * When an invalid segment is being edited, adjust segment's end time to depict the
     * valid time range it can be spread before editing starts
     * @param {String} id - ID of the segment being edited
     * @param {Object} peaksInstance - current peaks instance for the waveform
     * @param {Number} duration - file length in seconds
     */
  }, {
    key: "initialSegmentValidation",
    value: function initialSegmentValidation(id, peaksInstance, duration) {
      var segment = peaksInstance.segments.getSegment(id);
      if (!segment) {
        var newPeaksInstance = this.insertTempSegment(peaksInstance, duration);
        segment = newPeaksInstance.segments.getSegment('temp-segment');
        segment.id = id;
      }
      // Segments before and after the current segment
      var _this$findWrapperSegm = this.findWrapperSegments(segment, peaksInstance),
        before = _this$findWrapperSegm.before,
        after = _this$findWrapperSegm.after;

      // Check for margin of +/- 0.02 seconds to be considered
      var isDuration = function isDuration(time) {
        return time <= duration + 0.02 && time >= duration - 0.02;
      };
      if (before && segment.startTime < before.endTime && !isDuration(before.endTime)) {
        segment.update({
          startTime: before.endTime
        });
      }
      if (after && segment.endTime > after.startTime && after.startTime != segment.startTime) {
        segment.update({
          endTime: after.startTime
        });
      }
      if (isDuration(segment.endTime)) {
        var allSegments = this.sortSegments(peaksInstance, 'startTime');
        var afterSegments = allSegments.filter(function (seg) {
          return seg.startTime > segment.startTime;
        });
        if (afterSegments.length > 0) {
          segment.update({
            endTime: afterSegments[0].startTime
          });
        }
      }
      return peaksInstance;
    }

    /**
     * Revert color and disable handles for editing of the segment
     * @param {Object} clonedSegment - the segment being saved
     * @param {Boolean} isSaved - flag indicating segment is saved or not
     * @param {Object} peaksInstance - current peaks instance for the waveform
     */
  }, {
    key: "deactivateSegment",
    value: function deactivateSegment(clonedSegment, isSaved, peaksInstance) {
      var id = clonedSegment.id,
        valid = clonedSegment.valid;
      // Sorted segments by start time
      var segments = this.sortSegments(peaksInstance, 'startTime');
      var index = segments.map(function (seg) {
        return seg.id;
      }).indexOf(id);

      // Setting editable: false -> disables the handles
      var segment = peaksInstance.segments.getSegment(id);
      if (valid || isSaved) {
        segment.update({
          editable: false,
          color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0]
        });
      } else {
        peaksInstance.segments.removeById(id);
      }
      return peaksInstance;
    }

    /**
     * Save the segment into Peaks instance
     * @param {Object} currentState - current values for the timespan to be saved
     * @param {Object} peaksInstance - current peaks instance for waveform
     */
  }, {
    key: "saveSegment",
    value: function saveSegment(currentState, peaksInstance) {
      var beginTime = currentState.beginTime,
        endTime = currentState.endTime,
        clonedSegment = currentState.clonedSegment;
      clonedSegment.update({
        startTime: this.timeToS(beginTime),
        endTime: this.timeToS(endTime)
      });
      return peaksInstance;
    }

    /**
     * Reverse the changes made in peaks waveform when changes are cancelled
     * @param {Object} clonedSegment - cloned segment before changing peaks waveform
     * @param {Object} peaksInstance - current peaks instance for wavefrom
     */
  }, {
    key: "revertSegment",
    value: function revertSegment(clonedSegment, peaksInstance) {
      var startTime = clonedSegment.startTime,
        endTime = clonedSegment.endTime,
        labelText = clonedSegment.labelText,
        id = clonedSegment.id,
        color = clonedSegment.color,
        editable = clonedSegment.editable,
        valid = clonedSegment.valid;
      var segment = peaksInstance.segments.getSegment(id);
      if (valid) {
        segment.update({
          startTime: startTime,
          endTime: endTime,
          labelText: labelText,
          color: color,
          editable: editable
        });
      } else {
        peaksInstance.segments.removeById(id);
      }
      return peaksInstance;
    }

    /**
     * Update waveform segment when start and end times are changed from the edit forms
     * @param {Object} segment - segment related to timespan
     * @param {Object} currentState - current begin and end times from the input form
     * @param {Object} peaksInstance - current peaks instance for waveform
     */
  }, {
    key: "updateSegment",
    value: function updateSegment(segment, currentState, peaksInstance) {
      var beginTime = currentState.beginTime,
        endTime = currentState.endTime;
      // Convert time from hh:mm:ss(.ss) format to Number
      var beginSeconds = this.timeToS(beginTime);
      var endSeconds = this.timeToS(endTime);
      var changeSegment = peaksInstance.segments.getSegment(segment.id);

      // Update segment only when the entered times are valid
      if (beginSeconds < segment.endTime && segment.startTime !== beginSeconds) {
        changeSegment.update({
          startTime: beginSeconds
        });
        return peaksInstance;
      }
      if (endSeconds > segment.startTime && segment.endTime !== endSeconds) {
        changeSegment.update({
          endTime: endSeconds
        });
        return peaksInstance;
      }
      return peaksInstance;
    }

    /**
     * Validate segment in the waveform everytime the handles on either side are dragged
     * to change the start and end times
     * @param {Object} segment - segement being edited in the waveform
     * @param {Boolean} startTimeChanged - true -> start time changed, false -> end time changed
     * @param {Object} peaksInstance - current peaks instance for waveform
     * @param {Number} duration - file length in seconds
     */
  }, {
    key: "validateSegment",
    value: function validateSegment(segment, startTimeChanged, peaksInstance, duration) {
      var startTime = segment.startTime,
        endTime = segment.endTime;

      // Segments before and after the editing segment
      var _this$findWrapperSegm2 = this.findWrapperSegments(segment, peaksInstance),
        before = _this$findWrapperSegm2.before,
        after = _this$findWrapperSegm2.after;

      // Check for margin of +/- 0.02 seconds to be considered
      var isDuration = function isDuration(time) {
        return time <= duration + 0.02 && time >= duration - 0.02;
      };
      if (startTimeChanged) {
        if (before && startTime < before.endTime && !isDuration(before.endTime)) {
          // when start handle is dragged over the segment before
          segment.update({
            startTime: before.endTime
          });
        } else if (startTime > endTime) {
          // when start handle is dragged over the end time of the segment
          segment.update({
            startTime: segment.endTime - 0.001
          });
        }
      } else {
        if (after && endTime > after.startTime) {
          // when end handle is dragged over the segment after
          segment.update({
            endTime: after.startTime
          });
        } else if (endTime < startTime) {
          // when end handle is dragged over the start time of the segment
          segment.update({
            endTime: segment.startTime + 0.001
          });
        } else if (endTime > duration) {
          // when end handle is dragged beyond the duration of file
          segment.update({
            endTime: duration
          });
        }
      }
      return segment;
    }

    /**
     * Find the before and after segments of a given segment
     * @param {Object} currentSegment - current segment being added/edited
     * @param {Object} peaksInstance - current peaks instance
     */
  }, {
    key: "findWrapperSegments",
    value: function findWrapperSegments(currentSegment, peaksInstance) {
      var _this4 = this;
      var wrapperSegments = {
        before: null,
        after: null
      };

      // All segments sorted by start time
      var allSegments = this.sortSegments(peaksInstance, 'startTime');
      var otherSegments = allSegments.filter(function (seg) {
        return seg.id !== currentSegment.id;
      });
      var startTime = currentSegment.startTime;
      var timeFixedSegments = otherSegments.map(function (seg) {
        return _objectSpread(_objectSpread({}, seg), {}, {
          startTime: _this4.roundOff(seg.startTime),
          endTime: _this4.roundOff(seg.endTime)
        });
      });
      wrapperSegments.after = timeFixedSegments.filter(function (seg) {
        return seg.startTime > startTime;
      })[0];
      wrapperSegments.before = timeFixedSegments.filter(function (seg) {
        return seg.startTime < startTime;
      }).reverse()[0];
      return wrapperSegments;
    }

    /**
     * Check a given number is odd
     * @param {Number} num
     */
  }, {
    key: "isOdd",
    value: function isOdd(num) {
      return num % 2;
    }

    /**
     * Sort segments in ascending order by the the given property
     * @param {Object} peaksInstance - current peaks instance
     * @param {String} sortBy - name of the property to sort the segments
     */
  }, {
    key: "sortSegments",
    value: function sortSegments(peaksInstance, sortBy) {
      var segments = peaksInstance.segments.getSegments();
      segments.sort(function (x, y) {
        return x[sortBy] - y[sortBy];
      });
      return segments;
    }

    /**
     * Round off time in seconds to 3 decimal places
     * @param {Number} value - time value in seconds
     */
  }, {
    key: "roundOff",
    value: function roundOff(value) {
      var valueString = '';
      var _value$toString$split = value.toString().split('.'),
        _value$toString$split2 = (0, _slicedToArray2["default"])(_value$toString$split, 2),
        intVal = _value$toString$split2[0],
        decVal = _value$toString$split2[1];
      if (!decVal) {
        valueString = intVal;
      } else {
        valueString = intVal + '.' + decVal.substring(0, 3);
      }
      return parseFloat(valueString);
    }

    /**
     * Convert time in hh:mm:ss.ms format to seconds
     * @param {String} time time in hh:mm:ss.ms format
     * @returns {Number} time in seconds
     */
  }, {
    key: "timeToS",
    value: function timeToS(time) {
      return smu.toMs(time) / 1000;
    }
  }]);
}();