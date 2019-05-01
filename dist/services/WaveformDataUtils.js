"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Colors for segments from Avalon branding pallette
var COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];

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
              var begin = item.begin,
                  end = item.end,
                  label = item.label,
                  id = item.id;
              initSegments.push({
                startTime: _this.toMs(begin),
                endTime: _this.toMs(end),
                labelText: label,
                id: id,
                color: COLOR_PALETTE[count]
              });
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
     * Add a new segment to Peaks when a new timespan is created
     * @param {Object} newSpan - new span created for the user input
     * @param {Object} peaksInstance - peaks instance for the waveform
     */

  }, {
    key: "insertNewSegment",
    value: function insertNewSegment(newSpan, peaksInstance) {
      var begin = newSpan.begin,
          end = newSpan.end,
          label = newSpan.label,
          id = newSpan.id;
      peaksInstance.segments.add({
        startTime: this.toMs(begin),
        endTime: this.toMs(end),
        labelText: label,
        id: id
      });
      return peaksInstance;
    }
    /**
     * Add a temporary segment to be edited when adding a new timespan to structure
     * @param {Object} peaksInstance - peaks instance for the current waveform
     */

  }, {
    key: "insertTempSegment",
    value: function insertTempSegment(peaksInstance) {
      // Current time of the playhead
      var currentTime = this.roundOff(peaksInstance.player.getCurrentTime()); // End time of the media file

      var fileEndTime = this.roundOff(peaksInstance.player.getDuration());
      var rangeEndTime,
          rangeBeginTime = currentTime;
      var currentSegments = this.sortSegments(peaksInstance, 'startTime'); // Validate start time of the temporary segment

      currentSegments.map(function (segment) {
        if (rangeBeginTime >= segment.startTime && rangeBeginTime <= segment.endTime) {
          // adds 0.01 to check consecutive segments with only a 0.01s difference
          rangeBeginTime = segment.endTime + 0.01;
        }

        return rangeBeginTime;
      }); // Set the default end time of the temporary segment

      if (currentSegments.length === 0) {
        rangeEndTime = fileEndTime < 60 ? fileEndTime : rangeBeginTime + 60;
      } else {
        rangeEndTime = rangeBeginTime + 60;
      } // Validate end time of the temporary segment


      currentSegments.map(function (segment) {
        if (rangeBeginTime < segment.startTime) {
          var segmentLength = segment.endTime - segment.startTime;

          if (fileEndTime < 60) {
            rangeEndTime = fileEndTime;
          }

          if (segmentLength < 60 && rangeEndTime >= segment.endTime) {
            rangeEndTime = segment.startTime - 0.01;
          }

          if (rangeEndTime >= segment.startTime && rangeEndTime < segment.endTime) {
            rangeEndTime = segment.startTime - 0.01;
          }
        }

        if (rangeEndTime > fileEndTime) {
          rangeEndTime = fileEndTime;
        }

        return rangeEndTime;
      });

      if (rangeBeginTime < fileEndTime && rangeEndTime > rangeBeginTime) {
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
      var _this2 = this;

      var clonedSegments = this.sortSegments(peaksInstance, 'startTime');
      peaksInstance.segments.removeAll();
      clonedSegments.forEach(function (segment, index) {
        segment.color = _this2.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0];
        peaksInstance.segments.add(segment);
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
      // Remove the current segment
      var _peaksInstance$segmen = peaksInstance.segments.removeById(id),
          _peaksInstance$segmen2 = (0, _slicedToArray2["default"])(_peaksInstance$segmen, 1),
          removedSegment = _peaksInstance$segmen2[0]; // Create a new segment with the same properties and set editable to true


      peaksInstance.segments.add((0, _objectSpread2["default"])({}, removedSegment, {
        editable: true,
        color: COLOR_PALETTE[2]
      }));
      var startTime = peaksInstance.segments.getSegment(id).startTime; // Move play head to the start time of the selected segment

      peaksInstance.player.seek(startTime);
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
      }).indexOf(id); // Remove the current segment

      var _peaksInstance$segmen3 = peaksInstance.segments.removeById(id),
          _peaksInstance$segmen4 = (0, _slicedToArray2["default"])(_peaksInstance$segmen3, 1),
          removedSegment = _peaksInstance$segmen4[0]; // Create a new segment and revert to its original color


      peaksInstance.segments.add((0, _objectSpread2["default"])({}, removedSegment, {
        editable: false,
        color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0]
      }));
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
      peaksInstance.segments.removeById(clonedSegment.id);
      peaksInstance.segments.add((0, _objectSpread2["default"])({}, clonedSegment, {
        startTime: this.toMs(beginTime),
        endTime: this.toMs(endTime)
      }));
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
      peaksInstance.segments.removeById(clonedSegment.id);
      peaksInstance.segments.add(clonedSegment);
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
      var beginSeconds = this.toMs(beginTime);
      var endSeconds = this.toMs(endTime);

      if (beginSeconds < segment.endTime && segment.startTime !== beginSeconds) {
        var _peaksInstance$segmen5 = peaksInstance.segments.removeById(segment.id),
            _peaksInstance$segmen6 = (0, _slicedToArray2["default"])(_peaksInstance$segmen5, 1),
            removed = _peaksInstance$segmen6[0];

        peaksInstance.segments.add((0, _objectSpread2["default"])({}, removed, {
          startTime: beginSeconds
        }));
        return peaksInstance;
      }

      if (endSeconds > segment.startTime && segment.endTime !== endSeconds) {
        var _peaksInstance$segmen7 = peaksInstance.segments.removeById(segment.id),
            _peaksInstance$segmen8 = (0, _slicedToArray2["default"])(_peaksInstance$segmen7, 1),
            _removed = _peaksInstance$segmen8[0];

        peaksInstance.segments.add((0, _objectSpread2["default"])({}, _removed, {
          endTime: endSeconds
        }));
        return peaksInstance;
      }

      return peaksInstance;
    }
    /**
     * Prevent the times of segment being edited overlapping with the existing segments
     * @param {Object} segment - segement being edited in the waveform
     * @param {Object} peaksInstance - current peaks instance for waveform
     */

  }, {
    key: "validateSegment",
    value: function validateSegment(segment, peaksInstance) {
      var allSegments = this.sortSegments(peaksInstance, 'startTime');
      var wrapperSegments = this.findWrapperSegments(segment, allSegments);
      var duration = this.roundOff(peaksInstance.player.getDuration());
      var startTime = this.roundOff(segment.startTime);
      var endTime = this.roundOff(segment.endTime);

      if (wrapperSegments.before !== null && startTime <= wrapperSegments.before.endTime) {
        segment.startTime = wrapperSegments.before.endTime + 0.01;
      }

      if (wrapperSegments.after !== null && endTime >= wrapperSegments.after.startTime) {
        segment.endTime = wrapperSegments.after.startTime - 0.01;
      }

      if (wrapperSegments.after === null && endTime > duration) {
        segment.endTime = duration;
      }

      return segment;
    }
    /**
     * Find the before and after segments of a given segment
     * @param {Object} currentSegment - current segment being added/edited
     * @param {Array} allSegments - segments in the current peaks instance
     */

  }, {
    key: "findWrapperSegments",
    value: function findWrapperSegments(currentSegment, allSegments) {
      var wrapperSegments = {
        before: null,
        after: null
      };
      var currentIndex = allSegments.map(function (segment) {
        return segment.id;
      }).indexOf(currentSegment.id);
      wrapperSegments.before = currentIndex > 0 ? allSegments[currentIndex - 1] : null;
      wrapperSegments.after = currentIndex < allSegments.length - 1 ? allSegments[currentIndex + 1] : null;
      return wrapperSegments;
    }
  }, {
    key: "isOdd",
    value: function isOdd(num) {
      return num % 2;
    }
  }, {
    key: "toMs",
    value: function toMs(strTime) {
      var _strTime$split = strTime.split(':'),
          _strTime$split2 = (0, _slicedToArray2["default"])(_strTime$split, 3),
          hours = _strTime$split2[0],
          minutes = _strTime$split2[1],
          seconds = _strTime$split2[2];

      var hoursAndMins = parseInt(hours) * 3600 + parseInt(minutes) * 60;
      var secondsIn = seconds === '' ? 0.0 : parseFloat(seconds);
      return hoursAndMins + secondsIn;
    }
  }, {
    key: "sortSegments",
    value: function sortSegments(peaksInstance, sortBy) {
      var allSegments = peaksInstance.segments.getSegments();
      return allSegments.sort(function (x, y) {
        return x[sortBy] - y[sortBy];
      });
    }
  }, {
    key: "roundOff",
    value: function roundOff(value) {
      return Math.round(value * 100) / 100;
    }
  }]);
  return WaveformDataUtils;
}();

exports["default"] = WaveformDataUtils;