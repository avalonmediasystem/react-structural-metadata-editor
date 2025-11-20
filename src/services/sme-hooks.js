import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from './StructuralMetadataUtils';
import WaveformDataUtils from './WaveformDataUtils';
import { getValidationBeginState, getValidationEndState, isTitleValid } from './form-helper';
import { updateSMUI } from '../actions/sm-data';
import { clearExistingAlerts, handleEditingTimespans, updateStructureStatus } from '../actions/forms';
import { deleteSegment } from '../actions/peaks-instance';

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
    return structuralMetadataUtils.getItemsOfType(['span'], smData);
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
 * Calculate parent and sibling timespans in the structure for the given timespan.
 * @param {Object} obj 
 * @param {Object} obj.item currently editing timespan item from structure
 * @returns {
 *  prevSiblingRef,
 *  nextSiblingRef,
 *  parentTimespanRef
 * } React refs for sibling and parent timespans
 */
export const useFindNeighborTimespans = ({ item }) => {
  const { smData } = useSelector((state) => state.structuralMetadata);

  // React refs to hold parent timespan, previous and next siblings
  const parentTimespanRef = useRef(null);
  const prevSiblingRef = useRef(null);
  const nextSiblingRef = useRef(null);

  // Find the parent timespan if it exists
  const parentDiv = useMemo(() => {
    if (item) {
      return structuralMetadataUtils.getParentItem(item, smData);
    }
  }, [item, smData]);

  useEffect(() => {
    if (parentDiv && parentDiv.type === 'span') {
      parentTimespanRef.current = parentDiv;
    } else {
      parentTimespanRef.current = null;
    }

    let siblings = [];
    if (parentDiv && parentDiv.items?.length > 1) {
      /**
       * Get sibling timespans from the parent has children.
       * items?.length > 1 check excludes the current item.
       */
      siblings = parentDiv.items.filter(sibling => sibling.type === 'span');
    } else {
      // When there's no parent, get all timespans in structure
      siblings = structuralMetadataUtils.getItemsOfType(['span'], smData);
    }

    // Get possible previous/next siblings from the siblings array
    const currentIndex = siblings.findIndex(sibling => sibling.id === item.id);
    let possiblePrevSibling = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    let possibleNextSibling = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    /**
     * Iterate through the siblings array, and re-calculate the correct previous/next combo
     * as needed because, the sibling calculation above based on indexes disregards the nested
     * nature of the timespans.
     */
    siblings.map(sibling => {
      const siblingParent = structuralMetadataUtils.getParentItem(sibling, smData);
      if (possiblePrevSibling) {
        const prevSiblingParent = structuralMetadataUtils.getParentItem(possiblePrevSibling, smData);
        if (siblingParent.id === prevSiblingParent?.id) {
          possiblePrevSibling = prevSiblingParent;
        }
      }

      if (possibleNextSibling) {
        const nextSiblingParent = structuralMetadataUtils.getParentItem(possibleNextSibling, smData);
        if (siblingParent.id === nextSiblingParent?.id) {
          possibleNextSibling = nextSiblingParent;
        }
      }
    });

    prevSiblingRef.current = possiblePrevSibling;
    nextSiblingRef.current = possibleNextSibling;

  }, [parentDiv, item, smData]);
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

/**
 * Perform Redux state updates during CRUD operations performed on structure
 * @returns {
 *  deleteStructItem,
 *  updateEditingTimespans,
 *  updateStructure,
 * }
 */
export const useStructureUpdate = () => {
  const dispatch = useDispatch();
  const { smData, smDataIsValid } = useSelector(state => state.structuralMetadata);
  const { duration } = useSelector(state => state.peaksInstance);

  const updateStructure = (items = smData) => {
    const { newSmData, newSmDataStatus } = structuralMetadataUtils.buildSMUI(items, duration);

    dispatch(updateSMUI(newSmData, newSmDataStatus));
    // Remove invalid structure alert when data is corrected
    if (newSmDataStatus) {
      dispatch(clearExistingAlerts());
      dispatch(updateStructureStatus(0));
    }
  };

  const deleteStructItem = (item) => {
    // Clone smData and remove the item manually
    const clonedItems = structuralMetadataUtils.deleteListItem(item.id, smData);

    // Update structure with the item removed
    updateStructure(clonedItems);

    // Remove the Peaks segment from the peaks instance
    dispatch(deleteSegment(item));
  };

  const updateEditingTimespans = (code) => {
    handleEditingTimespans(code);
    // Remove dismissible alerts when a CRUD action has been initiated
    // given editing is starting (code = 1) and structure is validated.
    if (code == 1 && smDataIsValid) {
      dispatch(clearExistingAlerts());
    }
  };

  return { deleteStructItem, updateEditingTimespans, updateStructure };
};
