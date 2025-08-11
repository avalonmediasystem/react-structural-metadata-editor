import StructuralMetadataUtils from './StructuralMetadataUtils';
const structuralMetadataUtils = new StructuralMetadataUtils();

/**
 * Load existing form values to state, if in 'EDIT' mode
 */
export function getExistingFormValues(id, smData, peaks = {}) {
  let item = structuralMetadataUtils.findItem(id, smData);

  // Heading
  if (item.type === 'div' || item.type === 'root') {
    return {
      headingTitle: item.label,
    };
  }

  // Timespan
  if (item.type === 'span') {
    let parentDiv = structuralMetadataUtils.getParentDiv(item, smData);
    let segment = peaks.segments.getSegment(id);
    segment.valid = true;
    return {
      beginTime: item.begin,
      endTime: item.end,
      timespanChildOf: parentDiv ? parentDiv.id : '',
      timespanTitle: item.label,
      clonedSegment: segment,
    };
  }
}

export function getTimeValidation(time) {
  if (!time || time.indexOf(':') === -1) {
    return false;
  }
  return validTimeFormat(time);
}

export function getValidationBeginState(beginTime, allSpans) {
  if (!beginTime || beginTime.indexOf(':') === -1) {
    return false;
  }

  const validFormat = validTimeFormat(beginTime);
  const validBeginTime = structuralMetadataUtils.doesTimeOverlap(
    beginTime,
    allSpans
  );
  return !!(validFormat && validBeginTime);
}

export function getValidationEndState(beginTime, endTime, duration) {
  if (!endTime || endTime.indexOf(':') === -1) {
    return false;
  }

  const validFormat = validTimeFormat(endTime);
  const validEndTime = (structuralMetadataUtils.toMs(endTime) / 1000 > duration)
    ? false : true;
  const validOrdering = structuralMetadataUtils.validateBeforeEndTimeOrder(
    beginTime,
    endTime
  );
  return (validFormat && validEndTime && validOrdering);
}

export function getValidationTitleState(title) {
  if (title.length > 2) {
    return true;
  }
  if (title.length > 0) {
    return false;
  }
  return false;
}

/**
 * Validation logic for a valid title here
 * @param {String} title
 */
export function isTitleValid(title) {
  return title.length > 2;
}

/**
 * Validates that the begin and end time span values are valid separately, and together
 * in the region which they will create.
 *
 * This function also preps handy feedback messages we might want to display to the user * 
 * @param {Number} beginTime 
 * @param {Number} endTime 
 * @param {Number} duration duration saved in central state
 * @param {Array} allSpans list of all timespans in peaks
 * @returns {Object} { valid: <Boolean>, message: <String> }
 */
export function validTimespans(beginTime, endTime, duration, allSpans) {
  // Valid formats?
  if (!validTimeFormat(beginTime)) {
    return {
      valid: false,
      message: 'Invalid begin time format',
    };
  }
  if (!validTimeFormat(endTime)) {
    return {
      valid: false,
      message: 'Invalid end time format',
    };
  }
  // Begin comes before end?
  if (!structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime)) {
    return {
      valid: false,
      message: 'Begin time must start before end time',
    };
  }
  // Timespan end time is greater than end time of the media file
  if (duration < structuralMetadataUtils.toMs(endTime) / 1000) {
    return {
      valid: false,
      message: 'End time overlaps duration of the media file',
    };
  }

  // Success!
  return { valid: true };
}

function validTimeFormat(value) {
  // Check if value contains only numbers, ':', '.', and ','
  if (typeof value !== 'string' || /[^0-9:.,]/.test(value)) {
    return false;
  }
  // Check if value has the correct format with colons and dots/commas
  if (value.indexOf(':') === -1 &&
    (value.indexOf('.') === -1 || value.indexOf(',') === -1)
  ) {
    return false;
  }
  // Split by colons and check if it has exactly three parts with valid numbers
  const parts = value.split(':')
    .filter(part => Number(part.replace(/,/g, '.')) >= 0);
  return parts?.length === 3;
}
