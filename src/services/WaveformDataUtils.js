import StructuralMetadataUtils from './StructuralMetadataUtils';

// Colors for segments from Avalon branding pallette
const COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];

const smu = new StructuralMetadataUtils();

export default class WaveformDataUtils {
  /**
   * Initialize Peaks instance for the app
   * @param {Array} smData - current structured metadata from the server masterfile
   */
  initSegments(smData) {
    let initSegments = [];
    let count = 0;

    // Recursively build segments for timespans in the structure
    let createSegment = (items) => {
      for (let item of items) {
        if (item.type === 'span') {
          count = count > 1 ? 0 : count;
          const segment = this.convertTimespanToSegment(item);
          initSegments.push({
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

    return initSegments;
  }

  /**
   * Add a temporary segment to be edited when adding a new timespan to structure
   * @param {Object} peaksInstance - peaks instance for the current waveform
   * @param {Integer} fileDuration - duration of the file
   */
  insertTempSegment(peaksInstance, fileDuration) {
    // Current time of the playhead
    const currentTime = this.roundOff(peaksInstance.player.getCurrentTime());
    // Convert from milliseconds to seconds
    const fileEndTime = fileDuration / 1000;

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
        fileEndTime < 60
          ? fileEndTime
          : Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
    } else {
      rangeEndTime = Math.round((rangeBeginTime + 60.0) * 1000) / 1000;
    }

    // Validate end time of the temporary segment
    currentSegments.map((segment) => {
      if (rangeBeginTime < segment.startTime) {
        const segmentLength = segment.endTime - segment.startTime;
        if (fileEndTime < 60) {
          rangeEndTime = fileEndTime;
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
      if (rangeEndTime > fileEndTime) {
        rangeEndTime = fileEndTime;
      }
      return rangeEndTime;
    });

    if (rangeBeginTime < fileEndTime && rangeEndTime > rangeBeginTime) {
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
   */
  activateSegment(id, peaksInstance) {
    this.initialSegmentValidation(id, peaksInstance);
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
   * When an invalid segment is being edited, adjust segment's end time to depict the
   * valid time range it can be spread before editing starts
   * @param {String} id - ID of the segment being edited
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */
  initialSegmentValidation(id, peaksInstance) {
    const segment = peaksInstance.segments.getSegment(id);
    const duration = Math.round(peaksInstance.player.getDuration() * 100) / 100;
    // Segments before and after the current segment
    const { before, after } = this.findWrapperSegments(segment, peaksInstance);

    // Check for margin of +/- 0.02 milliseconds to be considered
    let isDuration = (time) => {
      return time <= duration + 0.02 && time >= duration - 0.02;
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
   * @param {String} id - ID of the segment being saved
   * @param {Object} peaksInstance - current peaks instance for the waveform
   */
  deactivateSegment(id, peaksInstance) {
    // Sorted segments by start time
    let segments = this.sortSegments(peaksInstance, 'startTime');

    let index = segments.map((seg) => seg.id).indexOf(id);

    // Setting editable: false -> disables the handles
    const segment = peaksInstance.segments.getSegment(id);
    segment.update({
      editable: false,
      color: this.isOdd(index) ? COLOR_PALETTE[1] : COLOR_PALETTE[0],
    });

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
      startTime: smu.toMs(beginTime) / 1000,
      endTime: smu.toMs(endTime) / 1000,
    });
    return peaksInstance;
  }

  /**
   * Reverse the changes made in peaks waveform when changes are cancelled
   * @param {Object} clonedSegment - cloned segment before changing peaks waveform
   * @param {Object} peaksInstance - current peaks instance for wavefrom
   */
  revertSegment(clonedSegment, peaksInstance) {
    let segment = peaksInstance.segments.getSegment(clonedSegment.id);
    const {
      startTime,
      endTime,
      labelText,
      id,
      color,
      editable,
    } = clonedSegment;
    segment.update({
      startTime: startTime,
      endTime: endTime,
      labelText: labelText,
      id: id,
      color: color,
      editable: editable,
    });
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
    let beginSeconds = smu.toMs(beginTime) / 1000;
    let endSeconds = smu.toMs(endTime) / 1000;
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
   */
  validateSegment(segment, startTimeChanged, peaksInstance) {
    const duration = this.roundOff(peaksInstance.player.getDuration());

    const { startTime, endTime } = segment;

    // Segments before and after the editing segment
    const { before, after } = this.findWrapperSegments(segment, peaksInstance);

    // Check for margin of +/- 0.02 milliseconds to be considered
    let isDuration = (time) => {
      return time <= duration + 0.02 && time >= duration - 0.02;
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
      } else if (endTime > duration) {
        // when end handle is dragged beyond the duration of file
        segment.update({ endTime: duration });
      }
    }
    return segment;
  }

  /**
   * Convert timespan to segment to be consumed within peaks instance
   * @param {Object} timespan
   */
  convertTimespanToSegment(timespan) {
    const { begin, end, label, id } = timespan;
    return {
      startTime: smu.toMs(begin) / 1000,
      endTime: smu.toMs(end) / 1000,
      labelText: label,
      id: id,
    };
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
}
