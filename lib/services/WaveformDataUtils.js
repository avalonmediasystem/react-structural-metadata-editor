'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Colors for segments from Avalon branding pallette
var COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];

var WaveformDataUtils = function () {
  function WaveformDataUtils() {
    _classCallCheck(this, WaveformDataUtils);
  }

  /**
   * Initialize Peaks instance for the app
   * @param {Array} smData - current structured metadata from the server masterfile
   */
  WaveformDataUtils.prototype.initSegments = function initSegments(smData) {
    var _this = this;

    var initSegments = [];
    var count = 0;

    // Recursively build segments for timespans in the structure
    var createSegment = function createSegment(items) {
      for (var _iterator = items, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var item = _ref;

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
    };

    // Build segments from initial metadata structure
    createSegment(smData);

    return initSegments;
  };

  /**
   * Add a new segment to Peaks when a new timespan is created
   * @param {Object} newSpan - new span created for the user input
   * @param {Object} peaksInstance - peaks instance for the waveform
   */


  WaveformDataUtils.prototype.insertNewSegment = function insertNewSegment(newSpan, peaksInstance) {
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
  };

  /**
   * Add a temporary segment to be edited when adding a new timespan to structure
   * @param {Object} peaksInstance - peaks instance for the current waveform
   */


  WaveformDataUtils.prototype.insertTempSegment = function insertTempSegment(peaksInstance) {
    // Current time of the playhead
    var currentTime = this.roundOff(peaksInstance.player.getCurrentTime());
    // End time of the media file
    var fileEndTime = this.roundOff(peaksInstance.player.getDuration());

    var rangeEndTime = void 0,
        rangeBeginTime = currentTime;

    var currentSegments = this.sortSegments(peaksInstance, 'startTime');

    // Validate start time of the temporary segment
    currentSegments.map(function (segment) {
      if (rangeBeginTime >= segment.startTime && rangeBeginTime <= segment.endTime) {
        // adds 0.01 to check consecutive segments with only a 0.01s difference
        rangeBeginTime = segment.endTime + 0.01;
      }
      return rangeBeginTime;
    });

    // Set the default end time of the temporary segment
    rangeEndTime = rangeBeginTime + 60;

    // Validate end time of the temporary segment
    currentSegments.map(function (segment) {
      if (rangeBeginTime < segment.startTime) {
        var segmentLength = segment.endTime - segment.startTime;
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
  };

  /**
   * Delete the corresponding segment when a timespan is deleted
   * @param {Object} item - item to be deleted
   * @param {Object} peaksInstance - peaks instance for the current waveform
   */


  WaveformDataUtils.prototype.deleteSegments = function deleteSegments(item, peaksInstance) {
    var deleteChildren = function deleteChildren(item) {
      var children = item.items;
      for (var _iterator2 = children, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var child = _ref2;

        if (child.type === 'span') {
          peaksInstance.segments.removeById(child.id);
        }
        if (child.items && child.items.length > 0) {
          deleteChildren(child);
        }
      }
    };

    if (item.type === 'div') {
      deleteChildren(item);
    }

    peaksInstance.segments.removeById(item.id);
    return peaksInstance;
  };

  /**
   * Update the colors of the segment to alternate between colors in Avalon color pallette
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */


  WaveformDataUtils.prototype.rebuildPeaks = function rebuildPeaks(peaksInstance) {
    var _this2 = this;

    var clonedSegments = this.sortSegments(peaksInstance, 'startTime');
    peaksInstance.segments.removeAll();
    clonedSegments.forEach(function (segment, index) {
      segment.color = _this2.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0];
      peaksInstance.segments.add(segment);
    });

    return peaksInstance;
  };

  /**
   * Change color and add handles for editing the segment in the waveform
   * @param {String} id - ID of the segment to be edited
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */


  WaveformDataUtils.prototype.activateSegment = function activateSegment(id, peaksInstance) {
    // Remove the current segment
    var _peaksInstance$segmen = peaksInstance.segments.removeById(id),
        removedSegment = _peaksInstance$segmen[0];

    // Create a new segment with the same properties and set editable to true


    peaksInstance.segments.add(_extends({}, removedSegment, {
      editable: true,
      color: COLOR_PALETTE[2]
    }));

    var startTime = peaksInstance.segments.getSegment(id).startTime;
    // Move play head to the start time of the selected segment
    peaksInstance.player.seek(startTime);

    return peaksInstance;
  };

  /**
   * Revert color and remove handles for editing of the segment
   * @param {String} id - ID of the segment being saved
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */


  WaveformDataUtils.prototype.deactivateSegment = function deactivateSegment(id, peaksInstance) {
    // Sorted segments by start time
    var segments = this.sortSegments(peaksInstance, 'startTime');

    var index = segments.map(function (seg) {
      return seg.id;
    }).indexOf(id);

    // Remove the current segment

    var _peaksInstance$segmen2 = peaksInstance.segments.removeById(id),
        removedSegment = _peaksInstance$segmen2[0];

    // Create a new segment and revert to its original color


    peaksInstance.segments.add(_extends({}, removedSegment, {
      editable: false,
      color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0]
    }));

    return peaksInstance;
  };

  /**
   * Save the segment into the Peaks
   * @param {Object} currentState - current values for the timespan to be saved
   * @param {Object} peaksInstance - current peaks instance for waveform
   */


  WaveformDataUtils.prototype.saveSegment = function saveSegment(currentState, peaksInstance) {
    var beginTime = currentState.beginTime,
        endTime = currentState.endTime,
        clonedSegment = currentState.clonedSegment;

    peaksInstance.segments.removeById(clonedSegment.id);
    peaksInstance.segments.add(_extends({}, clonedSegment, {
      startTime: this.toMs(beginTime),
      endTime: this.toMs(endTime)
    }));
    return peaksInstance;
  };

  /**
   * Reverse the changes made in peaks waveform when changes are cancelled
   * @param {Object} clonedSegment - cloned segment before changing peaks waveform
   * @param {Object} peaksInstance - current peaks instance for wavefrom
   */


  WaveformDataUtils.prototype.revertSegment = function revertSegment(clonedSegment, peaksInstance) {
    peaksInstance.segments.removeById(clonedSegment.id);
    peaksInstance.segments.add(clonedSegment);
    return peaksInstance;
  };

  /**
   * Update Peaks instance when user changes the start and end times from the edit forms
   * @param {Object} segment - segment related to timespan
   * @param {Object} currentState - current begin and end times from the input form
   * @param {Object} peaksInstance - current peaks instance for waveform
   */


  WaveformDataUtils.prototype.updateSegment = function updateSegment(segment, currentState, peaksInstance) {
    var beginTime = currentState.beginTime,
        endTime = currentState.endTime;

    var beginSeconds = this.toMs(beginTime);
    var endSeconds = this.toMs(endTime);

    if (beginSeconds < segment.endTime && segment.startTime !== beginSeconds) {
      var _peaksInstance$segmen3 = peaksInstance.segments.removeById(segment.id),
          removed = _peaksInstance$segmen3[0];

      peaksInstance.segments.add(_extends({}, removed, {
        startTime: beginSeconds
      }));
      return peaksInstance;
    }
    if (endSeconds > segment.startTime && segment.endTime !== endSeconds) {
      var _peaksInstance$segmen4 = peaksInstance.segments.removeById(segment.id),
          _removed = _peaksInstance$segmen4[0];

      peaksInstance.segments.add(_extends({}, _removed, {
        endTime: endSeconds
      }));
      return peaksInstance;
    }
    return peaksInstance;
  };

  /**
   * Prevent the times of segment being edited overlapping with the existing segments
   * @param {Object} segment - segement being edited in the waveform
   * @param {Object} peaksInstance - current peaks instance for waveform
   */


  WaveformDataUtils.prototype.validateSegment = function validateSegment(segment, peaksInstance) {
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
  };

  /**
   * Find the before and after segments of a given segment
   * @param {Object} currentSegment - current segment being added/edited
   * @param {Array} allSegments - segments in the current peaks instance
   */


  WaveformDataUtils.prototype.findWrapperSegments = function findWrapperSegments(currentSegment, allSegments) {
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
  };

  WaveformDataUtils.prototype.isOdd = function isOdd(num) {
    return num % 2;
  };

  WaveformDataUtils.prototype.toMs = function toMs(strTime) {
    var _strTime$split = strTime.split(':'),
        hours = _strTime$split[0],
        minutes = _strTime$split[1],
        seconds = _strTime$split[2];

    var hoursAndMins = parseInt(hours) * 3600 + parseInt(minutes) * 60;
    var secondsIn = seconds === '' ? 0.0 : parseFloat(seconds);
    return hoursAndMins + secondsIn;
  };

  WaveformDataUtils.prototype.sortSegments = function sortSegments(peaksInstance, sortBy) {
    var allSegments = peaksInstance.segments.getSegments();
    return allSegments.sort(function (x, y) {
      return x[sortBy] - y[sortBy];
    });
  };

  WaveformDataUtils.prototype.roundOff = function roundOff(value) {
    return Math.round(value * 100) / 100;
  };

  return WaveformDataUtils;
}();

exports.default = WaveformDataUtils;
module.exports = exports['default'];