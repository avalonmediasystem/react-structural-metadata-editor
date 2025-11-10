"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExistingFormValues = getExistingFormValues;
exports.getValidationBeginState = getValidationBeginState;
exports.getValidationEndState = getValidationEndState;
exports.isTitleValid = isTitleValid;
exports.validTimespans = validTimespans;
var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

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
    var parentDiv = structuralMetadataUtils.getParentItem(item, smData);
    var segment = peaks.segments.getSegment(id);
    segment.valid = true;
    return {
      beginTime: item.begin,
      endTime: item.end,
      timespanChildOf: parentDiv ? parentDiv.id : '',
      timespanTitle: item.label,
      clonedSegment: segment
    };
  }
}

/**
 * Validate the begin time of a given time range
 * @param {String} beginTime range begin time in hh:mm:ss.ms format
 * @param {String} endTime range end time in hh:mm:ss.ms format
 * @returns {Boolean}
 */
function getValidationBeginState(beginTime, endTime) {
  if (!beginTime || beginTime.indexOf(':') === -1) {
    return false;
  }
  var validFormat = validTimeFormat(beginTime);
  var validOrdering = structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime);
  return validFormat && validOrdering;
}

/**
 * Validate the end time of a givent time range
 * @param {String} beginTime range begin time in hh:mm:ss.ms format
 * @param {String} endTime range end time in hh:mm:ss.ms format
 * @param {Number} duration duration of the media
 * @returns {Boolean}
 */
function getValidationEndState(beginTime, endTime, duration) {
  if (!endTime || endTime.indexOf(':') === -1) {
    return false;
  }
  var validFormat = validTimeFormat(endTime);
  var validEndTime = structuralMetadataUtils.toMs(endTime) / 1000 > duration ? false : true;
  var validOrdering = structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime);
  return validFormat && validEndTime && validOrdering;
}

/**
 * Validate the title of a structure item
 * @param {String} title new or editing structure item's title
 * @returns {Boolean}
 */
function isTitleValid(title) {
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
function validTimespans(beginTime, endTime, duration, allSpans) {
  // Valid formats?
  if (!validTimeFormat(beginTime)) {
    return {
      valid: false,
      message: 'Invalid begin time format'
    };
  }
  if (!validTimeFormat(endTime)) {
    return {
      valid: false,
      message: 'Invalid end time format'
    };
  }
  // Begin comes before end?
  if (!structuralMetadataUtils.validateBeforeEndTimeOrder(beginTime, endTime)) {
    return {
      valid: false,
      message: 'Begin time must start before end time'
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
  return {
    valid: true
  };
}
function validTimeFormat(value) {
  // Check if value contains only numbers, ':', '.', and ','
  if (typeof value !== 'string' || /[^0-9:.,]/.test(value)) {
    return false;
  }
  // Check if value has the correct format with colons and dots/commas
  if (value.indexOf(':') === -1 && (value.indexOf('.') === -1 || value.indexOf(',') === -1)) {
    return false;
  }
  // Split by colons and check if it has exactly three parts with valid numbers
  var parts = value.split(':').filter(function (part) {
    return Number(part.replace(/,/g, '.')) >= 0;
  });
  return (parts === null || parts === void 0 ? void 0 : parts.length) === 3;
}