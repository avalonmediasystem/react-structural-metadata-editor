'use strict';

exports.__esModule = true;
exports.getExistingFormValues = getExistingFormValues;
exports.getValidationBeginState = getValidationBeginState;
exports.getValidationEndState = getValidationEndState;
exports.getValidationTitleState = getValidationTitleState;
exports.isTitleValid = isTitleValid;
exports.validTimespans = validTimespans;

var _StructuralMetadataUtils = require('./StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();

/**
 * Load existing form values to state, if in 'EDIT' mode
 */
function getExistingFormValues(id, smData) {
  var peaks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var item = structuralMetadataUtils.findItem(id, smData);

  // Heading
  if (item.type === 'div' || item.type === 'root') {
    return {
      headingTitle: item.label
    };
  }

  // Timespan
  if (item.type === 'span') {
    var parentDiv = structuralMetadataUtils.getParentDiv(item, smData);

    return {
      beginTime: item.begin,
      endTime: item.end,
      timespanChildOf: parentDiv ? parentDiv.id : '',
      timespanTitle: item.label,
      clonedSegment: peaks.segments.getSegment(id)
    };
  }
}

function getValidationBeginState(beginTime, allSpans) {
  if (!beginTime || beginTime.indexOf(':') === -1) {
    return null;
  }

  var validFormat = structuralMetadataUtils.validTimeFormat(beginTime);
  var validBeginTime = structuralMetadataUtils.doesTimeOverlap(beginTime, allSpans);

  if (validFormat && validBeginTime) {
    return 'success';
  }
  if (!validFormat || !validBeginTime) {
    return 'error';
  }
  return null;
}

function getValidationEndState(beginTime, endTime, allSpans, peaksInstance) {
  var duration = void 0;
  if (peaksInstance !== undefined) {
    if (peaksInstance.player !== undefined) {
      duration = Math.round(peaksInstance.player.getDuration() * 100) / 100;
    }
  }

  if (!endTime || endTime.indexOf(':') === -1) {
    return null;
  }

  var validFormat = structuralMetadataUtils.validTimeFormat(endTime);
  var validEndTime = structuralMetadataUtils.doesTimeOverlap(endTime, allSpans, duration);
  var validOrdering = structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime);
  var doesTimespanOverlap = structuralMetadataUtils.doesTimespanOverlap(beginTime, endTime, allSpans);

  if (validFormat && validEndTime && validOrdering && !doesTimespanOverlap) {
    return 'success';
  }
  if (!validFormat || !validEndTime || !validOrdering || doesTimespanOverlap) {
    return 'error';
  }
  return null;
}

function getValidationTitleState(title) {
  if (title.length > 2) {
    return 'success';
  }
  if (title.length > 0) {
    return 'error';
  }
  return null;
}

/**
 * Validation logic for a valid title here
 * @param {String} title
 */
function isTitleValid(title) {
  return title.length > 2;
}

/**
 * Validates that the begin and end time span values are valid separately, and together
 * in the region which they will create.
 *
 * This function also preps handy feedback messages we might want to display to the user
 */
function validTimespans(beginTime, endTime, allSpans, peaksInstance) {
  var duration = void 0;
  if (peaksInstance !== undefined) {
    if (peaksInstance.player !== undefined) {
      duration = Math.round(peaksInstance.player.getDuration() * 100) / 100;
    }
  }
  // Valid formats?
  if (!structuralMetadataUtils.validTimeFormat(beginTime)) {
    return {
      valid: false,
      message: 'Invalid begin time format'
    };
  }
  if (!structuralMetadataUtils.validTimeFormat(endTime)) {
    return {
      valid: false,
      message: 'Invalid end time format'
    };
  }
  // Any individual overlapping?
  if (!structuralMetadataUtils.doesTimeOverlap(beginTime, allSpans)) {
    return {
      valid: false,
      message: 'Begin time overlaps an existing timespan region'
    };
  }
  if (!structuralMetadataUtils.doesTimeOverlap(endTime, allSpans)) {
    return {
      valid: false,
      message: 'End time overlaps an existing timespan region'
    };
  }
  // Begin comes before end?
  if (!structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime)) {
    return {
      valid: false,
      message: 'Begin time must start before end time'
    };
  }
  // Timespan range overlaps an existing timespan?
  if (structuralMetadataUtils.doesTimespanOverlap(beginTime, endTime, allSpans)) {
    return {
      valid: false,
      message: 'New timespan region overlaps an existing timespan region'
    };
  }
  // Timespan end time is greater than end time of the media file
  if (duration < structuralMetadataUtils.toMs(endTime) / 1000) {
    return {
      valid: false,
      message: 'End time overlaps duration of the media file'
    };
  }

  // Success!
  return { valid: true };
}