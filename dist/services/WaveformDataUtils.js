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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Colors for segments from Avalon branding pallette
var COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];
var smu = new _StructuralMetadataUtils["default"]();

var WaveformDataUtils =
/*#__PURE__*/
function () {
  function WaveformDataUtils() {
    (0, _classCallCheck2["default"])(this, WaveformDataUtils);
  }

  (0, _createClass2["default"])(WaveformDataUtils, [{
    key: "initSegments",

    /**
     * Initialize Peaks instance for the app
     * @param {Array} smData - current structured metadata from the server masterfile
     */
    value: function initSegments(smData) {
      var _this = this;

      var initSegments = [];
      var count = 0; // Recursively build segments for timespans in the structure

      var createSegment = function createSegment(items) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item.type === 'span') {
              count = count > 1 ? 0 : count;

              var segment = _this.convertTimespanToSegment(item);

              initSegments.push(_objectSpread({}, segment, {
                color: COLOR_PALETTE[count]
              }));
              count++;
            }

            if (item.items && item.items.length > 0) {
              createSegment(item.items);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }; // Build segments from initial metadata structure


      createSegment(smData);
      return initSegments;
    }
    /**
     * Add a temporary segment to be edited when adding a new timespan to structure
     * @param {Object} peaksInstance - peaks instance for the current waveform
     */

  }, {
    key: "insertTempSegment",
    value: function insertTempSegment(peaksInstance) {
      var _this2 = this;

      // Current time of the playhead
      var currentTime = this.roundOff(peaksInstance.player.getCurrentTime()); // End time of the media file

      var fileEndTime = this.roundOff(peaksInstance.player.getDuration());
      var rangeEndTime,
          rangeBeginTime = currentTime;
      var currentSegments = this.sortSegments(peaksInstance, 'startTime'); // Validate start time of the temporary segment

      currentSegments.map(function (segment) {
        if (rangeBeginTime >= segment.startTime && rangeBeginTime <= segment.endTime) {
          // rounds upto 3 decimal points for accuracy
          rangeBeginTime = _this2.roundOff(segment.endTime);
        }

        return rangeBeginTime;
      }); // Set the default end time of the temporary segment

      if (currentSegments.length === 0) {
        rangeEndTime = fileEndTime < 60 ? fileEndTime : Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
      } else {
        rangeEndTime = Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
      } // Validate end time of the temporary segment


      currentSegments.map(function (segment) {
        if (rangeBeginTime < segment.startTime) {
          var segmentLength = segment.endTime - segment.startTime;

          if (fileEndTime < 60) {
            rangeEndTime = fileEndTime;
          }

          if (segmentLength < 60 && rangeEndTime >= segment.startTime) {
            rangeEndTime = segment.startTime;
          }

          if (rangeEndTime >= segment.startTime && rangeEndTime < segment.endTime) {
            rangeEndTime = segment.startTime;
          }
        }

        if (rangeEndTime > fileEndTime) {
          rangeEndTime = fileEndTime;
        }

        return rangeEndTime;
      });

      if (rangeBeginTime < fileEndTime && rangeEndTime > rangeBeginTime) {
        var tempSegmentLength = rangeEndTime - rangeBeginTime; // Continue if temp segment has a length greater than 1ms

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
      var deleteChildren = function deleteChildren(item) {
        var children = item.items;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;

            if (child.type === 'span') {
              peaksInstance.segments.removeById(child.id);
            }

            if (child.items && child.items.length > 0) {
              deleteChildren(child);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      };

      if (item.type === 'div') {
        deleteChildren(item);
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
     * Change color and add handles for editing the segment in the waveform
     * @param {String} id - ID of the segment to be edited
     * @param {Object} peaksInstance - current peaks instance for the waveform
     */

  }, {
    key: "activateSegment",
    value: function activateSegment(id, peaksInstance) {
      var validatedPeaks = this.initialSegmentValidation(id, peaksInstance);
      var segment = validatedPeaks.segments.getSegment(id);
      segment.update({
        editable: true,
        color: COLOR_PALETTE[2]
      });
      var startTime = segment.startTime; // Move play head to the start time of the selected segment

      validatedPeaks.player.seek(startTime);
      return validatedPeaks;
    }
    /**
     * Adjust segment's end time to depict the valid time range for it to be spanned
     * At initial load of the editor for all segments with invalid end times,
     * segment.endTime is set to duration by default
     * @param {String} id - ID of the segment being edited
     * @param {Object} peaksInstance - current peaks instance for the waveform
     */

  }, {
    key: "initialSegmentValidation",
    value: function initialSegmentValidation(id, peaksInstance) {
      var segment = peaksInstance.segments.getSegment(id);
      var duration = Math.round(peaksInstance.player.getDuration() * 100) / 100; // Segments before and after the current segment

      var _this$findWrapperSegm = this.findWrapperSegments(segment, peaksInstance),
          before = _this$findWrapperSegm.before,
          after = _this$findWrapperSegm.after; // Check for margin of +/- 0.02 milliseconds to be considered


      var isDuration = function isDuration(time) {
        return time <= duration + 0.02 && time >= duration - 0.02;
      };

      if (before && segment.startTime < before.endTime && !isDuration(before.endTime)) {
        segment.update({
          startTime: before.endTime
        });
      } else if (isDuration(segment.endTime)) {
        var allSegments = this.sortSegments(peaksInstance, 'startTime');
        segment.update({
          endTime: allSegments.filter(function (seg) {
            return seg.startTime > segment.startTime;
          })[0].startTime
        });
      } else if (after && segment.endTime > after.startTime && !isDuration(after.endTime)) {
        segment.update({
          endTime: after.startTime
        });
      }

      return peaksInstance;
    }
    /**
     * Revert color and remove handles for editing of the segment
     * @param {String} id - ID of the segment being saved
     * @param {Object} peaksInstance - current peaks instance for the waveform
     */

  }, {
    key: "deactivateSegment",
    value: function deactivateSegment(id, peaksInstance) {
      // Sorted segments by start time
      var segments = this.sortSegments(peaksInstance, 'startTime');
      var index = segments.map(function (seg) {
        return seg.id;
      }).indexOf(id);
      var segment = peaksInstance.segments.getSegment(id);
      segment.update({
        editable: false,
        color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0]
      });
      return peaksInstance;
    }
    /**
     * Save the segment into the Peaks
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
        startTime: smu.toMs(beginTime) / 1000,
        endTime: smu.toMs(endTime) / 1000
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
      var segment = peaksInstance.segments.getSegment(clonedSegment.id);
      var startTime = clonedSegment.startTime,
          endTime = clonedSegment.endTime,
          labelText = clonedSegment.labelText,
          id = clonedSegment.id,
          color = clonedSegment.color,
          editable = clonedSegment.editable;
      segment.update({
        startTime: startTime,
        endTime: endTime,
        labelText: labelText,
        id: id,
        color: color,
        editable: editable
      });
      return peaksInstance;
    }
    /**
     * Update Peaks instance when user changes the start and end times from the edit forms
     * @param {Object} segment - segment related to timespan
     * @param {Object} currentState - current begin and end times from the input form
     * @param {Object} peaksInstance - current peaks instance for waveform
     */

  }, {
    key: "updateSegment",
    value: function updateSegment(segment, currentState, peaksInstance) {
      var beginTime = currentState.beginTime,
          endTime = currentState.endTime;
      var beginSeconds = smu.toMs(beginTime) / 1000;
      var endSeconds = smu.toMs(endTime) / 1000;
      var changeSegment = peaksInstance.segments.getSegment(segment.id);

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
     * Prevent the times of segment being edited overlapping with the existing segments
     * @param {Object} segment - segement being edited in the waveform
     * @param {Boolean} inMarker - true -> start time changed, false -> end time changed
     * @param {Object} peaksInstance - current peaks instance for waveform
     */

  }, {
    key: "validateSegment",
    value: function validateSegment(segment, inMarker, peaksInstance) {
      var duration = this.roundOff(peaksInstance.player.getDuration());
      var startTime = segment.startTime,
          endTime = segment.endTime; // segments before and after the editing segment

      var _this$findWrapperSegm2 = this.findWrapperSegments(segment, peaksInstance),
          before = _this$findWrapperSegm2.before,
          after = _this$findWrapperSegm2.after;

      if (inMarker) {
        if (before && startTime < before.endTime) {
          segment.update({
            startTime: before.endTime
          });
        } else if (startTime > endTime) {
          segment.update({
            startTime: segment.endTime - 0.001
          });
        }
      } else {
        if (after && endTime > after.startTime) {
          segment.update({
            endTime: after.startTime
          });
        } else if (endTime < startTime) {
          segment.update({
            endTime: segment.startTime + 0.001
          });
        } else if (endTime > duration) {
          segment.update({
            endTime: duration
          });
        }
      }

      return segment;
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
        startTime: smu.toMs(begin) / 1000,
        endTime: smu.toMs(end) / 1000,
        labelText: label,
        id: id
      };
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
      }; // All segments sorted by start time

      var allSegments = this.sortSegments(peaksInstance, 'startTime');
      var otherSegments = allSegments.filter(function (seg) {
        return seg.id !== currentSegment.id;
      });
      var startTime = currentSegment.startTime;
      var timeFixedSegments = otherSegments.map(function (seg) {
        return _objectSpread({}, seg, {
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
  }]);
  return WaveformDataUtils;
}();

exports["default"] = WaveformDataUtils;