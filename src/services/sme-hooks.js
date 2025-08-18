import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import StructuralMetadataUtils from './StructuralMetadataUtils';
import WaveformDataUtils from './WaveformDataUtils';
import { getValidationBeginState, getValidationEndState, isTitleValid } from './form-helper';

const structuralMetadataUtils = new StructuralMetadataUtils();
const waveformDataUtils = new WaveformDataUtils();

/**
 * Find sibling and parent timespans of the given Peaks segment. The respective timespans
 * for the calculated peaks segments for siblings and parent are returned. 
 * This makes it easier to use these values in further calculations for validation.
 * @param {Object} obj
 * @param {Object} obj.segment Peaks segment
 * @returns {
 *  prevSiblingRef,
 *  nextSiblingRef,
 *  parentTimespanRef
 * } React refs for siblings and parent timespans
 */
export const useFindNeighborSegments = ({ segment }) => {
  const { peaks, readyPeaks } = useSelector((state) => state.peaksInstance);
  const { smData } = useSelector((state) => state.structuralMetadata);

  // React refs to hold parent timespan, previous and next siblings
  const parentTimespanRef = useRef(null);
  const prevSiblingRef = useRef(null);
  const nextSiblingRef = useRef(null);

  const allSpans = useMemo(() => {
    return structuralMetadataUtils.getItemsOfType('span', smData);
  }, [smData]);

  useEffect(() => {
    if (readyPeaks && segment) {
      // All segments sorted by start time
      const allSegments = waveformDataUtils.sortSegments(peaks, 'startTime');
      const otherSegments = allSegments.filter(
        (seg) => seg.id !== segment.id
      );

      const { startTime, endTime } = segment;

      // Find potential parent segments
      const potentialParents = otherSegments.filter(seg =>
        seg.startTime <= startTime && seg.endTime >= endTime
      );
      const potentialParentIds = potentialParents?.length > 0
        ? potentialParents.map((p) => p._id) : [];

      // Get the most immediate parent
      const parent = potentialParents.reduce((closest, seg) => {
        if (!closest) return seg;
        const currentRange = seg.endTime - seg.startTime;
        const closestRange = closest.endTime - closest.startTime;
        return currentRange < closestRange ? seg : closest;
      }, null);

      parentTimespanRef.current = parent ? allSpans.find((span) => span.id === parent._id) : null;
      // When calculating the previous sibling omit potential parent timespans, as their startTimes are
      // less than or equal to the current segment's startTime
      const siblingsBefore = otherSegments
        .filter(seg => seg.startTime <= startTime && !potentialParentIds?.includes(seg._id));
      if (siblingsBefore?.length > 0) {
        prevSiblingRef.current = allSpans.find((span) => span.id === siblingsBefore.at(-1)._id);
      };

      const siblingsAfter = otherSegments.filter((seg) => seg.startTime >= endTime);
      if (siblingsAfter?.length > 0) {
        nextSiblingRef.current = allSpans.find((span) => span.id === siblingsAfter[0]._id);
      }
    }
  }, [segment, readyPeaks]);

  return { prevSiblingRef, nextSiblingRef, parentTimespanRef };
};

/**
 * Validate a given timespan based on its start/end times with respect to its sibling
 * and parent timespans, and its title.
 * @param {Object} obj 
 * @param {String} obj.beginTime
 * @param {String} obj.endTime
 * @param {Object} obj.neighbors sibling and parent timespans of the current timespan
 * @param {String} obj.timespanTitle
 * @returns {
 *  formIsValid,
 *  beginIsValid,
 *  endIsValid
 * }
 */
export const useTimespanFormValidation = ({ beginTime, endTime, neighbors, timespanTitle }) => {
  const { duration } = useSelector((state) => state.peaksInstance);

  const { prevSiblingRef, nextSiblingRef, parentTimespanRef } = neighbors;

  const getBeginTimeConstraint = () => {
    // Sibling's end time takes precedence over parent's start time
    if (prevSiblingRef.current) {
      return prevSiblingRef.current.end;
    }
    if (parentTimespanRef.current) {
      return parentTimespanRef.current.begin;
    }
    return null;
  };

  const getEndTimeConstraint = () => {
    // Sibling's start time takes precedence over parent's end time
    if (nextSiblingRef.current) {
      return nextSiblingRef.current.begin;
    }
    if (parentTimespanRef.current) {
      return parentTimespanRef.current.end;
    }
    return null;
  };

  const isBeginValid = useMemo(() => {
    // First check for format and ordering validation
    const standardValid = getValidationBeginState(beginTime, endTime);
    if (!standardValid) return false;

    const constraint = getBeginTimeConstraint();
    if (constraint) {
      // Begin time must be >= constraint time
      return structuralMetadataUtils.toMs(beginTime) >= structuralMetadataUtils.toMs(constraint);
    }
    return true;
  }, [beginTime, endTime]);

  const isEndValid = useMemo(() => {
    // First check for format and ordering validation
    const standardValid = getValidationEndState(beginTime, endTime, duration);
    if (!standardValid) return false;

    const constraint = getEndTimeConstraint();
    if (constraint) {
      // End time must be <= constraint time
      return structuralMetadataUtils.toMs(endTime) <= structuralMetadataUtils.toMs(constraint);
    }
    return true;
  }, [beginTime, endTime]);

  const formIsValid = useMemo(() => {
    const titleValid = isTitleValid(timespanTitle);
    return titleValid && isBeginValid && isEndValid;
  }, [timespanTitle, isBeginValid, isEndValid]);

  return { formIsValid, isBeginValid, isEndValid };
};
