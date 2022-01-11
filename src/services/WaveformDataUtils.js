import StructuralMetadataUtils from './StructuralMetadataUtils';
import Peaks from 'peaks.js';

// Colors for segments from Avalon branding pallette
const COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];

const smu = new StructuralMetadataUtils();

export default class WaveformDataUtils {
  /**
   * Initialize Peaks instance for the app
   * @param {Array} smData - current structured metadata from the server masterfile
   * @param {Number} duration - duration of the media file in milliseconds
   */
  initSegments(smData, duration) {
    let segments = [];
    let count = 0;
    const durationInSeconds = duration / 1000;

    // Recursively build segments for timespans in the structure
    let createSegment = (items) => {
      for (let item of items) {
        if (item.type === 'span') {
          count = count > 1 ? 0 : count;

          const segment = item.valid
            ? this.convertTimespanToSegment(item)
            : null;
          segments.push({
            ...segment,
            color: COLOR_PALETTE[count],
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
    const validSegments = segments.filter(
      (s) => s.startTime < s.endTime && s.startTime < durationInSeconds
    );

    return validSegments;
  }

  /**
   * Convert timespan to segment to be consumed within peaks instance
   * @param {Object} timespan
   */
  convertTimespanToSegment(timespan) {
    const { begin, end, label, id } = timespan;
    return {
      startTime: this.timeToS(begin),
      endTime: this.timeToS(end),
      labelText: label,
      id: id,
    };
  }

  /**
   * Add a temporary segment to be edited when adding a new timespan to structure
   * @param {Object} peaksInstance - peaks instance for the current waveform
   * @param {Integer} duration - duration of the file in milliseconds
   * @returns {Object} updated peaksInstance
   */
  insertTempSegment(peaksInstance, duration) {
    // Current time of the playhead
    const currentTime = this.roundOff(peaksInstance.player.getCurrentTime());
    // Convert from milliseconds to seconds
    const durationInSeconds = duration / 1000;

    let rangeEndTime,
      rangeBeginTime = currentTime;

    const currentSegments = this.sortSegments(peaksInstance, 'startTime');

    // Validate start time of the temporary segment
    currentSegments.map((segment) => {
      if (
        rangeBeginTime >= segment.startTime &&
        rangeBeginTime <= segment.endTime
      ) {
        // rounds upto 3 decimal points for accuracy
        rangeBeginTime = this.roundOff(segment.endTime);
      }
      return rangeBeginTime;
    });

    // Set the default end time of the temporary segment
    if (currentSegments.length === 0) {
      rangeEndTime =
        durationInSeconds < 60
          ? durationInSeconds
          : Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
    } else {
      rangeEndTime = Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
    }

    // Validate end time of the temporary segment
    currentSegments.map((segment) => {
      if (rangeBeginTime < segment.startTime) {
        const segmentLength = segment.endTime - segment.startTime;
        if (durationInSeconds < 60) {
          rangeEndTime = durationInSeconds;
        }
        if (segmentLength < 60 && rangeEndTime >= segment.startTime) {
          rangeEndTime = segment.startTime;
        }
        if (
          rangeEndTime >= segment.startTime &&
          rangeEndTime < segment.endTime
        ) {
          rangeEndTime = segment.startTime;
        }
      }
      if (rangeEndTime > durationInSeconds) {
        rangeEndTime = durationInSeconds;
      }
      return rangeEndTime;
    });

    if (rangeBeginTime < durationInSeconds && rangeEndTime > rangeBeginTime) {
      const tempSegmentLength = rangeEndTime - rangeBeginTime;
      // Continue if temporary segment has a length greater than 1ms
      if (tempSegmentLength > 0.1) {
        // Move playhead to start of the temporary segment
        peaksInstance.player.seek(rangeBeginTime);

        peaksInstance.segments.add({
          startTime: rangeBeginTime,
          endTime: rangeEndTime,
          editable: true,
          color: COLOR_PALETTE[2],
          id: 'temp-segment',
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
  deleteSegments(item, peaksInstance) {
    let deleteChildren = (item) => {
      let children = item.items;
      for (let child of children) {
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
  }

  /**
   * Update the colors of the segment to alternate between colors in Avalon color pallette
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */
  rebuildPeaks(peaksInstance) {
    let sortedSegments = this.sortSegments(peaksInstance, 'startTime');
    sortedSegments.forEach((segment, index) => {
      segment.update({
        color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0],
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
  activateSegment(id, peaksInstance, duration) {
    this.initialSegmentValidation(id, peaksInstance, duration);
    const segment = peaksInstance.segments.getSegment(id);
    // Setting editable: true -> enables handles
    segment.update({
      editable: true,
      color: COLOR_PALETTE[2],
    });
    let startTime = segment.startTime;
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
   * @param {Number} duration - duration of the file in milliseconds
   * @returns peaks instance with an added segment for the invalid timespan
   */
  addTempInvalidSegment(item, wrapperSpans, peaksInstance, duration) {
    const { id, labelText } = this.convertTimespanToSegment(item);
    const { prevSpan, nextSpan } = wrapperSpans;
    const durationInSeconds = duration / 1000;
    let tempSegment = {
      id,
      labelText,
      editable: true,
      color: COLOR_PALETTE[2],
    };

    if (prevSpan && nextSpan) {
      tempSegment = {
        ...tempSegment,
        startTime: this.timeToS(prevSpan.end),
        endTime: this.timeToS(nextSpan.begin),
      };
    } else if (!prevSpan) {
      tempSegment = {
        ...tempSegment,
        startTime: 0,
        endTime: this.timeToS(nextSpan.begin),
      };
    } else if (!nextSpan) {
      tempSegment = {
        ...tempSegment,
        startTime: this.timeToS(prevSpan.end),
        endTime: durationInSeconds,
      };
    }

    let segment = peaksInstance.segments.getSegment(id);
    if (segment) {
      segment.update({ ...tempSegment });
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
   * @param {Number} duration - file length in milliseconds
   */
  initialSegmentValidation(id, peaksInstance, duration) {
    const durationInSeconds = duration / 1000;

    let segment = peaksInstance.segments.getSegment(id);

    if (!segment) {
      let newPeaksInstance = this.insertTempSegment(peaksInstance, duration);
      segment = newPeaksInstance.segments.getSegment('temp-segment');
      segment.id = id;
    }
    // Segments before and after the current segment
    const { before, after } = this.findWrapperSegments(segment, peaksInstance);

    // Check for margin of +/- 0.02 milliseconds to be considered
    let isDuration = (time) => {
      return (
        time <= durationInSeconds + 0.02 && time >= durationInSeconds - 0.02
      );
    };
    if (
      before &&
      segment.startTime < before.endTime &&
      !isDuration(before.endTime)
    ) {
      segment.update({ startTime: before.endTime });
    }
    if (
      after &&
      segment.endTime > after.startTime &&
      after.startTime != segment.startTime
    ) {
      segment.update({ endTime: after.startTime });
    }
    if (isDuration(segment.endTime)) {
      const allSegments = this.sortSegments(peaksInstance, 'startTime');
      let afterSegments = allSegments.filter(
        (seg) => seg.startTime > segment.startTime
      );
      if (afterSegments.length > 0) {
        segment.update({ endTime: afterSegments[0].startTime });
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
  deactivateSegment(clonedSegment, isSaved, peaksInstance) {
    const { id, valid } = clonedSegment;
    // Sorted segments by start time
    let segments = this.sortSegments(peaksInstance, 'startTime');

    let index = segments.map((seg) => seg.id).indexOf(id);

    // Setting editable: false -> disables the handles
    const segment = peaksInstance.segments.getSegment(id);
    if (valid || isSaved) {
      segment.update({
        editable: false,
        color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0],
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
  saveSegment(currentState, peaksInstance) {
    const { beginTime, endTime, clonedSegment } = currentState;
    clonedSegment.update({
      startTime: this.timeToS(beginTime),
      endTime: this.timeToS(endTime),
    });
    return peaksInstance;
  }

  /**
   * Reverse the changes made in peaks waveform when changes are cancelled
   * @param {Object} clonedSegment - cloned segment before changing peaks waveform
   * @param {Object} peaksInstance - current peaks instance for wavefrom
   */
  revertSegment(clonedSegment, peaksInstance) {
    const { startTime, endTime, labelText, id, color, editable, valid } =
      clonedSegment;
    let segment = peaksInstance.segments.getSegment(id);
    if (valid) {
      segment.update({
        startTime: startTime,
        endTime: endTime,
        labelText: labelText,
        id: id,
        color: color,
        editable: editable,
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
  updateSegment(segment, currentState, peaksInstance) {
    const { beginTime, endTime } = currentState;
    // Convert time from hh:mm:ss(.ss) format to Number
    let beginSeconds = this.timeToS(beginTime);
    let endSeconds = this.timeToS(endTime);
    let changeSegment = peaksInstance.segments.getSegment(segment.id);

    // Update segment only when the entered times are valid
    if (beginSeconds < segment.endTime && segment.startTime !== beginSeconds) {
      changeSegment.update({ startTime: beginSeconds });
      return peaksInstance;
    }
    if (endSeconds > segment.startTime && segment.endTime !== endSeconds) {
      changeSegment.update({ endTime: endSeconds });
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
   * @param {Number} duration - file length in milliseconds
   */
  validateSegment(segment, startTimeChanged, peaksInstance, duration) {
    const durationInSeconds = duration / 1000;

    const { startTime, endTime } = segment;

    // Segments before and after the editing segment
    const { before, after } = this.findWrapperSegments(segment, peaksInstance);

    // Check for margin of +/- 0.02 milliseconds to be considered
    let isDuration = (time) => {
      return (
        time <= durationInSeconds + 0.02 && time >= durationInSeconds - 0.02
      );
    };

    if (startTimeChanged) {
      if (before && startTime < before.endTime && !isDuration(before.endTime)) {
        // when start handle is dragged over the segment before
        segment.update({ startTime: before.endTime });
      } else if (startTime > endTime) {
        // when start handle is dragged over the end time of the segment
        segment.update({ startTime: segment.endTime - 0.001 });
      }
    } else {
      if (after && endTime > after.startTime) {
        // when end handle is dragged over the segment after
        segment.update({ endTime: after.startTime });
      } else if (endTime < startTime) {
        // when end handle is dragged over the start time of the segment
        segment.update({ endTime: segment.startTime + 0.001 });
      } else if (endTime > durationInSeconds) {
        // when end handle is dragged beyond the duration of file
        segment.update({ endTime: durationInSeconds });
      }
    }
    return segment;
  }

  /**
   * Find the before and after segments of a given segment
   * @param {Object} currentSegment - current segment being added/edited
   * @param {Object} peaksInstance - current peaks instance
   */
  findWrapperSegments(currentSegment, peaksInstance) {
    let wrapperSegments = {
      before: null,
      after: null,
    };

    // All segments sorted by start time
    const allSegments = this.sortSegments(peaksInstance, 'startTime');
    const otherSegments = allSegments.filter(
      (seg) => seg.id !== currentSegment.id
    );
    const { startTime } = currentSegment;
    const timeFixedSegments = otherSegments.map((seg) => {
      return {
        ...seg,
        startTime: this.roundOff(seg.startTime),
        endTime: this.roundOff(seg.endTime),
      };
    });

    wrapperSegments.after = timeFixedSegments.filter(
      (seg) => seg.startTime > startTime
    )[0];
    wrapperSegments.before = timeFixedSegments
      .filter((seg) => seg.startTime < startTime)
      .reverse()[0];
    return wrapperSegments;
  }

  /**
   * Check a given number is odd
   * @param {Number} num
   */
  isOdd(num) {
    return num % 2;
  }

  /**
   * Sort segments in ascending order by the the given property
   * @param {Object} peaksInstance - current peaks instance
   * @param {String} sortBy - name of the property to sort the segments
   */
  sortSegments(peaksInstance, sortBy) {
    let segments = peaksInstance.segments.getSegments();
    segments.sort((x, y) => x[sortBy] - y[sortBy]);
    return segments;
  }

  /**
   * Round off time in seconds to 3 decimal places
   * @param {Number} value - time value in seconds
   */
  roundOff(value) {
    var valueString = '';
    var [intVal, decVal] = value.toString().split('.');
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
  timeToS(time) {
    return smu.toMs(time) / 1000;
  }
}
