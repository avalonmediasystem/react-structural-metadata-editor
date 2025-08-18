import StructuralMetadataUtils from './StructuralMetadataUtils';

// Colors for segments from Avalon branding pallette
const COLOR_PALETTE = ['#80A590', '#2A5459', '#FBB040'];

const smu = new StructuralMetadataUtils();

export default class WaveformDataUtils {
  /**
   * Initialize Peaks instance for the app
   * @param {Array} smData - current structured metadata from the server masterfile
   * @param {Number} duration - duration of the media file in seconds
   */
  initSegments(smData, duration) {
    let segments = [];
    let count = 0;

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
      (s) => s.startTime < s.endTime && s.startTime < duration
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
   * Add a temporary segment to be edited into Peaks when adding a new timespan to structure
   * @param {Object} peaksInstance - peaks instance for the current waveform
   * @param {Integer} duration - duration of the file in seconds
   * @returns {Object} updated peaksInstance
   */
  insertTempSegment(peaksInstance, duration) {
    // Current time of the playhead
    const currentTime = this.roundOff(peaksInstance.player.getCurrentTime());

    let rangeBeginTime = currentTime;
    // Initially set rangeEndTime to 60 seconds from the current time
    let rangeEndTime = Math.round((currentTime + 60.0) * 1000) / 1000;

    // Get all segments in Peaks
    const currentSegments = this.sortSegments(peaksInstance, 'startTime');

    // Find segments that contain a given time
    const findContainingSegments = (time, isBegin = false) => {
      let closestToTime = [];
      let diff = Infinity;
      currentSegments.map((segment) => {
        if (isBegin) {
          /**
           * Consider equality for startTime only when using rangeBeginTime
           * to create child segments, since this needs to be considered when creating
           * child timespans.
           */
          if (time >= segment.startTime && time < segment.endTime) {
            /**
             * When filtering the segments that overlap at the beginning, get the segment that is
             * closest to the rangeBeginTime. This yeilds an accurate rangeEndTime when filtering
             * through segments with children, where rangeBeginTime falls inside a child segment.
             */
            let current_diff = time - segment.startTime;
            if (current_diff < diff) {
              diff = current_diff;
              closestToTime = [segment];
            }
          }
        } else {
          if (time > segment.startTime && time < segment.endTime) {
            closestToTime.push(segment);
          }
        }
      });
      return closestToTime;
    };

    // Get children segments within a parent segment
    const getChildSegments = (parentSegment) => {
      const { startTime, endTime } = parentSegment;

      return currentSegments.filter((segment) => {
        if (segment.id === parentSegment.id) return false;
        return segment.startTime >= startTime && segment.endTime <= endTime;
      });
    };

    // Find next available end time that doesn't overlap with children
    const findNonOverlappingEndTime = (parentSegment, suggestedEndTime) => {
      const children = getChildSegments(parentSegment);

      if (children.length === 0) {
        return Math.min(suggestedEndTime, parentSegment.endTime);
      }
      // Find the first child that would conflict with the suggested range
      for (const child of children) {
        if (rangeBeginTime < child.startTime && suggestedEndTime > child.startTime) {
          return child.startTime;
        }
      }

      return Math.min(suggestedEndTime, parentSegment.endTime);
    };

    if (currentSegments.length > 0) {
      const allBeginTimes = currentSegments.map(span => span.startTime);
      const allEndTimes = currentSegments.map(span => span.endTime);
      const earliestBegin = Math.min(...allBeginTimes);
      const latestEnd = Math.max(...allEndTimes);

      // Recursively validate and adjust rangeEndTime until no more conflicts exist
      let maxIterations = 20;
      let currentIteration = 0;
      let rangeChanged = true;

      while (rangeChanged && currentIteration < maxIterations) {
        const previousRangeEndTime = rangeEndTime;
        rangeChanged = false;
        currentIteration++;

        // Find containing segments for begin and end times
        const beginContainers = findContainingSegments(rangeBeginTime, true);
        const endContainers = findContainingSegments(rangeEndTime);

        // Suggested range for new segment is either before/after all existing segments
        if (rangeEndTime <= earliestBegin || rangeBeginTime >= latestEnd) {
          // Do nothing, as the suggested range is already outside existing segments
        }
        // Suggested range is partially overlapping the first segment
        else if (rangeBeginTime < earliestBegin && rangeEndTime > earliestBegin) {
          // Adjust rangeEndTime to not overlap the first segment
          rangeEndTime = earliestBegin;
        }
        // Suggested range is fully enclosed within an existing segment
        else if (beginContainers.length > 0 && endContainers.length > 0) {
          const commonContainer = beginContainers.find(beginContainer =>
            endContainers.some(endContainer => endContainer.id === beginContainer.id)
          );

          if (commonContainer) {
            // Adjust rangeEndTime to not overlap with the children of the common parent segment
            rangeEndTime = findNonOverlappingEndTime(commonContainer, rangeEndTime);
          } else {
            // Adjust rangeEndTime when they don't share a common parent segment
            rangeEndTime = Math.min(rangeEndTime, beginContainers[0].endTime);
          }
        }
        // Suggested range is not overlapping existing segments at the start/end
        else if (beginContainers.length === 0 && endContainers.length === 0) {
          // Find all segments that are fully enclosed within the suggested range
          const containedSegments = currentSegments
            .filter((seg) => seg.startTime >= rangeBeginTime && seg.endTime <= rangeEndTime);

          if (containedSegments?.length > 0) {
            // Sort contained segments by start time to process them in order
            const sortedContainedSegments = containedSegments.sort((a, b) => a.startTime - b.startTime);
            // Find the best non-overlapping range before the first contained segment
            // This ensures the new temp segment doesn't overlap any fully enclosed segments
            rangeEndTime = sortedContainedSegments[0].startTime;
          }
        }
        // Suggested range is overlapping with an existing segment at the end
        else if (beginContainers.length === 0 && endContainers.length > 0) {
          // Adjust rangeEndTime to the start of the segment it falls within
          rangeEndTime = endContainers[0].startTime;
        }
        // Suggested range is overlapping with an existing segment at the beginning
        else if (beginContainers.length > 0 && endContainers.length === 0) {
          const containingSegment = beginContainers[0];
          rangeEndTime = findNonOverlappingEndTime(containingSegment, rangeEndTime);
        }

        // Check if the rangeEndTime is changed in this iteration
        if (rangeEndTime !== previousRangeEndTime) {
          rangeChanged = true;
        }
      }
    }

    // Ensure rangeEndTime doesn't exceed duration
    rangeEndTime = Math.min(rangeEndTime, duration);

    // Only create segment if there's a valid time range
    if (rangeBeginTime < duration && rangeEndTime > rangeBeginTime) {
      const tempSegmentLength = rangeEndTime - rangeBeginTime;
      // Continue if temporary segment has a length greater than 0.1s
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
   * @param {Number} duration - duration of the file in seconds
   * @returns peaks instance with an added segment for the invalid timespan
   */
  addTempInvalidSegment(item, wrapperSpans, peaksInstance, duration) {
    const { id, labelText } = this.convertTimespanToSegment(item);
    const { prevSpan, nextSpan } = wrapperSpans;
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
        endTime: duration,
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
   * @param {Number} duration - file length in seconds
   */
  initialSegmentValidation(id, peaksInstance, duration) {
    let segment = peaksInstance.segments.getSegment(id);

    if (!segment) {
      let newPeaksInstance = this.insertTempSegment(peaksInstance, duration);
      segment = newPeaksInstance.segments.getSegment('temp-segment');
      segment.id = id;
    }
    // Segments before and after the current segment
    const { before, after } = this.findWrapperSegments(segment, peaksInstance);

    // Check for margin of +/- 0.02 seconds to be considered
    let isDuration = (time) => {
      return (
        time <= duration + 0.02 && time >= duration - 0.02
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
   * Save the changes to the segment in Peaks instance
   * @param {Object} currentState - current values for the timespan to be saved
   * @param {Object} peaksInstance - current peaks instance for waveform
   */
  saveSegment(currentState, peaksInstance) {
    const { beginTime, endTime, clonedSegment, timespanTitle } = currentState;
    const { color, id, labelText } = clonedSegment;
    /**
     * If the timespanTitle has changed, the segment needs to be removed and re-added,
     * because Peaks.js' segment.update() doesn't reflect the updated labelText in the
     * view.
     */
    if (labelText != timespanTitle) {
      // Remove the old segment and add a new one with the updated labelText
      peaksInstance.segments.removeById(id);
      peaksInstance.segments.add({
        startTime: this.timeToS(beginTime),
        endTime: this.timeToS(endTime),
        labelText: timespanTitle,
        color,
        id
      });
    } else {
      // Update the start and end times when labelText has not changed
      clonedSegment.update({
        startTime: this.timeToS(beginTime),
        endTime: this.timeToS(endTime),
      });
    }
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
   * @param {Number} duration - file length in seconds
   */
  validateSegment(segment, startTimeChanged, peaksInstance, duration) {
    const { startTime, endTime } = segment;
    if (startTimeChanged) {
      if (startTime > endTime) {
        // when start handle is dragged over the end time of the segment
        segment.update({ startTime: segment.endTime - 0.001 });
      }
    } else {
      if (endTime < startTime) {
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
    let segments = peaksInstance.segments?.getSegments() ?? [];
    if (segments?.length > 0) {
      segments.sort((x, y) => x[sortBy] - y[sortBy]);
    }
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
