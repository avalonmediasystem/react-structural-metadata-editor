import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from './StructuralMetadataUtils';
import { getValidationBeginState, getValidationEndState, isTitleValid } from './form-helper';
import { updateSMUI } from '../actions/sm-data';
import { clearExistingAlerts, handleEditingTimespans, updateStructureStatus } from '../actions/forms';
import { deleteSegment, insertNewSegment, saveSegment } from '../actions/peaks-instance';
import { isEmpty } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const structuralMetadataUtils = new StructuralMetadataUtils();

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
  const { duration, readyPeaks } = useSelector((state) => state.peaksInstance);
  const { smData } = useSelector((state) => state.structuralMetadata);

  // React refs to hold parent timespan, previous and next siblings
  const parentTimespanRef = useRef(null);
  const prevSiblingRef = useRef(null);
  const nextSiblingRef = useRef(null);

  const allSpans = useMemo(() => {
    return structuralMetadataUtils.getItemsOfType(['span'], smData);
  }, [smData]);

  useEffect(() => {
    if (readyPeaks && !isEmpty(segment)) {
      let item;
      if (segment._id === 'temp-segment') {
        // Construct a span object from segment when handling timespan creation
        const { _id, _startTime, _endTime, parentId } = segment;
        item = {
          type: 'span', label: '', id: _id,
          begin: structuralMetadataUtils.toHHmmss(_startTime),
          end: structuralMetadataUtils.toHHmmss(_endTime),
          valid: _startTime < _endTime && _endTime <= duration,
          timeRange: { start: _startTime, end: _endTime },
          parentId,
        };
      } else {
        // Find the existing span object from smData
        item = allSpans.filter((span) => span.id === segment._id)[0];
      }

      const { possibleParent, possiblePrevSibling, possibleNextSibling }
        = structuralMetadataUtils.calculateAdjacentTimespans(smData, item);
      parentTimespanRef.current = possibleParent;
      prevSiblingRef.current = possiblePrevSibling;
      nextSiblingRef.current = possibleNextSibling;
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

  useEffect(() => {
    const { possibleParent, possiblePrevSibling, possibleNextSibling }
      = structuralMetadataUtils.calculateAdjacentTimespans(smData, item);

    parentTimespanRef.current = possibleParent;
    prevSiblingRef.current = possiblePrevSibling;
    nextSiblingRef.current = possibleNextSibling;
  }, [item, smData]);
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
    let prevSiblingEnd, parentBegin;
    if (prevSiblingRef.current) {
      prevSiblingEnd = structuralMetadataUtils.toMs(prevSiblingRef.current.end);
    }
    if (parentTimespanRef.current) {
      parentBegin = structuralMetadataUtils.toMs(parentTimespanRef.current.begin);
    }
    if ((!prevSiblingEnd && parentBegin) || (prevSiblingEnd < parentBegin)) {
      return parentBegin;
    } else {
      return prevSiblingEnd;
    }
  };

  const getEndTimeConstraint = () => {
    let nextSiblingStart, parentEnd;
    if (nextSiblingRef.current) {
      nextSiblingStart = structuralMetadataUtils.toMs(nextSiblingRef.current.begin);
    }
    if (parentTimespanRef.current) {
      parentEnd = structuralMetadataUtils.toMs(parentTimespanRef.current.end);
    }
    if ((!nextSiblingStart && parentEnd) || (nextSiblingStart > parentEnd)) {
      return parentEnd;
    } else {
      return nextSiblingStart;
    }
  };

  const isBeginValid = useMemo(() => {
    // First check for format and ordering validation
    const standardValid = getValidationBeginState(beginTime, endTime);
    if (!standardValid) return false;

    const constraint = getBeginTimeConstraint();
    if (constraint) {
      // Begin time must be >= constraint time
      return structuralMetadataUtils.toMs(beginTime) >= constraint;
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
      return structuralMetadataUtils.toMs(endTime) <= constraint;
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
    /**
     * Remove dismissible alerts when a CRUD action has been initiated
     * given editing is starting (code = 1) and structure is validated.
     */
    if (code == 1 && smDataIsValid) {
      dispatch(clearExistingAlerts());
    }
  };


  return { deleteStructItem, updateEditingTimespans, updateStructure };
};

/**
 * Manage TextEditor related operations to clean, format, update and restore
 * JSON structure
 * @returns {
 *   formatJson,
 *   injectTemplate,
 *   restoreRemovedProps,
 *   sanitizeDisplayedText
 * }
 */
export const useTextEditor = () => {
  // Dispatch actions to Redux store
  const dispatch = useDispatch();
  const createNewSegment = (span) => dispatch(insertNewSegment(span));
  const updateSegment = (state) => dispatch(saveSegment(state));
  const removeSegment = (item) => dispatch(deleteSegment(item));

  const { peaks } = useSelector((state) => state.peaksInstance);

  /**
   * Format JSON with 2-space indentation for displaying in the text editor.
   * Re-arrange properties so that, 'items' property comes last in each 'div'.
   */
  const formatJson = useCallback((data) => {
    try {
      return JSON.stringify(data, (_key, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Re-order properties to set 'items' last
          const { items, ...rest } = value;
          return items !== undefined ? { ...rest, items } : value;
        }
        return value;
      }, 2);
    } catch (error) {
      return 'Error formatting JSON structure..';
    }
  }, []);

  /**
   * Remove extra properties in the JSON structure for the text editor display
   */
  const sanitizeDisplayedText = useCallback((data) => {
    if (!data) return data;

    const removeProps = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(removeProps);
      } else if (obj && typeof obj === 'object') {
        const { active, timeRange, nestedSpan, valid, ...rest } = obj;
        if (rest.items?.length === 0) delete rest.items;
        const filtered = {};
        for (const key in rest) {
          filtered[key] = removeProps(rest[key]);
        }
        return filtered;
      }
      return obj;
    };

    return removeProps(data);
  }, []);

  /**
   * Restore removed properties onto edited data before saving it back to Redux store
   */
  const restoreRemovedProps = (editedData) => {
    const textTimespanIds = [];
    const restore = (obj, path = []) => {
      if (Array.isArray(obj)) {
        return obj.map((item, index) => restore(item, [...path, index]));
      } else if (obj && typeof obj === 'object') {
        const restored = { ...obj };

        // Generate a new ID if one doesn't exists
        if (!restored.id) {
          restored.id = uuidv4();
        }

        // If the item is a timespan, verify a corresponding Peaks segment exists
        if (restored.type === 'span') {
          const segment = peaks.segments.getSegment(restored.id);
          if (!segment) {
            // Create a new segment in Peaks instance if not found
            createNewSegment(restored);
          } else {
            // Update existing segment with the changes in the text editor
            const { begin, end, label } = restored;
            updateSegment({ beginTime: begin, endTime: end, clonedSegment: segment, timespanTitle: label });
          }

          textTimespanIds.push(restored.id);
        }

        if (restored.items) {
          restored.items = restore(restored.items, [...path, 'items']);
        }
        return restored;
      }
      return obj;
    };

    const restoredData = restore(editedData);

    // Delete segments from Peaks instance that were removed in text editor
    const allSegments = peaks.segments.getSegments().map(seg => ({ id: seg._id, segment: seg }));
    if (textTimespanIds?.length > 0) {
      allSegments.forEach((seg) => {
        const { id, segment } = seg;
        if (!textTimespanIds.includes(id)) {
          removeSegment({ id, label: segment._labelText, type: 'span' });
        }
      });
    }

    return restoredData;
  };

  /**
   * Insert a given template object to text editor and move the cursor inside the empty label
   * value field
   * @param {React.RefObject} editorViewRef React ref for CodeMirror text editor
   * @param {Object} template injected template object
   */
  const injectTemplate = (editorViewRef, template) => {
    // Create a new id for the template item
    template.id = uuidv4();
    const templateString = JSON.stringify(template, null, 2) + ',';
    const view = editorViewRef.current;
    const cursor = view.state.selection.main.head;

    // Insert the template at cursor position
    view.dispatch({ changes: { from: cursor, insert: templateString } });

    // Find the position of the label value
    const labelPattern = '"label": "';
    const labelIndex = templateString.indexOf(labelPattern);

    if (labelIndex !== -1) {
      // Position cursor inside empty quotes for label property in the new item
      const labelValuePos = cursor + labelIndex + labelPattern.length;
      view.dispatch({ selection: { anchor: labelValuePos } });
    }

    // Focus the editor
    view.focus();
  };

  return { formatJson, injectTemplate, restoreRemovedProps, sanitizeDisplayedText };
};
