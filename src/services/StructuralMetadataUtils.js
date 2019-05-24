import { findIndex, cloneDeep } from 'lodash';
import moment from 'moment';
import uuidv1 from 'uuid/v1';

/**
 * Rules - https://github.com/avalonmediasystem/avalon/issues/3022
 *
 * a timespan does not allow overlap.
 * a timepan can not be out of order.
 * a timespan can not be demoted from a parent unless it is the last item in the relationship (last child), as it would create an out of order item.
 * Timespans can only be moved ONE parent- level up or down.
 * Use an arrow and handle click.
 * Only first and last time-spans can be moved. Middle Children are stuck.
 * Headings are ordered by the children they have.
 * If when creating a timespan, you butt against the start or end of another timespan, you have to change the other timepan first.
 * Labels can be edited at will.
 */

export default class StructuralMetadataUtils {
  /**
   * Helper function to create a dropZone object for drag and drop
   * @returns {Object}
   */
  createDropZoneObject() {
    return {
      type: 'optional',
      id: uuidv1()
    };
  }

  /**
   * Helper function which creates an object with the shape our data structure requires
   * @param {Object} obj
   * @return {Object}
   */
  createSpanObject(obj) {
    return {
      id: uuidv1(),
      type: 'span',
      label: obj.timespanTitle,
      begin: obj.beginTime,
      end: obj.endTime
    };
  }

  /**
   * Remove a targeted list item object from data structure
   * @param {String} id - list item id
   * @param {Array} allItems array of items, usually all current items in the data structure
   * @return {Array}
   */
  deleteListItem(id, allItems) {
    let clonedItems = cloneDeep(allItems);
    let item = this.findItem(id, allItems);
    let parentDiv = this.getParentDiv(item, clonedItems);
    let indexToDelete = findIndex(parentDiv.items, { id: item.id });

    parentDiv.items.splice(indexToDelete, 1);

    return clonedItems;
  }

  /**
   * Format the time of the timespans in the structured metadata fetched from the server,
   * so that they can be used in the validation logic and Peaks instance
   * @param {Array} allItems - array of all the items in structured metadata
   * @param {Float} duration - end time of the media file in Milliseconds
   */
  buildSMUI(allItems, duration) {
    // Regex to match mm:ss OR single number
    const regexMMSS = /^([0-9]*:[0-9]*.[0-9]*)$/i;
    const regexSS = /^([0-9]*.[0-9]*)$/i;

    // Round duration to 2 decimal places
    const fileLength = Math.round(duration / 10) / 100;

    // Convert time to HH:mm:ss.ms format to use in validation logic
    let convertToHHmmss = time => {
      if (regexMMSS.test(time)) {
        let [minutes, seconds] = time.split(':');
        let minutesIn = parseInt(minutes) * 60;
        let secondsIn = seconds === '' ? 0.0 : parseFloat(seconds);
        return minutesIn + secondsIn;
      }
      if (regexSS.test(time)) {
        return parseFloat(time);
      } else {
        return this.toMs(time) / 1000;
      }
    };
    // Recursive function to traverse whole data structure
    let formatTime = items => {
      for (let item of items) {
        if (item.type === 'span') {
          const { begin, end } = item;
          let beginTime = convertToHHmmss(begin);
          let endTime = convertToHHmmss(end);
          item.begin = this.toHHmmss(beginTime);
          if (beginTime > endTime) {
            item.end = this.toHHmmss(fileLength);
          } else {
            item.end = this.toHHmmss(endTime);
          }
        }
        if (item.items) {
          formatTime(item.items);
        }
      }
    };

    formatTime(allItems);
    return allItems;
  }

  /**
   * Update the data structure to represent all possible dropTargets for the provided dragSource
   * @param {Object} dragSource
   * @param {Object} allItems
   * @returns {Array} - new computed items
   */
  determineDropTargets(dragSource, allItems) {
    const clonedItems = cloneDeep(allItems);

    if (dragSource.type === 'span') {
      let wrapperSpans = this.findWrapperSpans(
        dragSource,
        this.getItemsOfType('span', clonedItems)
      );
      let parentDiv = this.getParentDiv(dragSource, clonedItems);
      let siblings = parentDiv ? parentDiv.items : [];
      let spanIndex = siblings
        .map(sibling => sibling.id)
        .indexOf(dragSource.id);
      let stuckInMiddle = this.dndHelper.stuckInMiddle(
        spanIndex,
        siblings,
        parentDiv
      );

      // If span falls in the middle of other spans, it can't be moved
      if (stuckInMiddle) {
        return clonedItems;
      }

      // Sibling before is a div?
      if (spanIndex !== 0 && siblings[spanIndex - 1].type === 'div') {
        let sibling = siblings[spanIndex - 1];
        if (sibling.items) {
          sibling.items.push(this.createDropZoneObject());
        } else {
          sibling.items = [this.createDropZoneObject()];
        }
      }

      // Sibling after is a div?
      if (
        spanIndex !== siblings.length - 1 &&
        siblings[spanIndex + 1].type === 'div'
      ) {
        let sibling = siblings[spanIndex + 1];
        if (sibling.items) {
          sibling.items.unshift(this.createDropZoneObject());
        } else {
          sibling.items = [this.createDropZoneObject()];
        }
      }

      let grandParentDiv = this.getParentDiv(parentDiv, clonedItems);

      // A first/last child of siblings, or an only child
      if (grandParentDiv !== null) {
        let siblingTimespans = this.getItemsOfType('span', siblings);
        let timespanIndex = siblingTimespans
          .map(sibling => sibling.id)
          .indexOf(dragSource.id);

        let parentIndex = grandParentDiv.items
          .map(item => item.id)
          .indexOf(parentDiv.id);
        if (timespanIndex === 0) {
          grandParentDiv.items.splice(
            parentIndex,
            0,
            this.createDropZoneObject()
          );
        }
        if (timespanIndex === siblingTimespans.length - 1) {
          let newPI = grandParentDiv.items
            .map(item => item.id)
            .indexOf(parentDiv.id);
          grandParentDiv.items.splice(
            newPI + 1,
            0,
            this.createDropZoneObject()
          );
        }
      }

      // Insert after the "before" wrapper span (if one exists)
      if (wrapperSpans.before) {
        this.dndHelper.addSpanBefore(
          parentDiv,
          clonedItems,
          wrapperSpans.before
        );
      }
      // Insert relative to the span after the active span
      if (wrapperSpans.after) {
        this.dndHelper.addSpanAfter(parentDiv, clonedItems, wrapperSpans.after);
      }
      // Insert when there is no wrapper span after active span, but empty headers
      if (!wrapperSpans.after) {
        this.dndHelper.addSpanToEmptyHeader(parentDiv, clonedItems);
      }
    }

    return clonedItems;
  }

  /**
   * Helper object for drag and drop data structure manipulations
   * This mutates the state of the data structure
   */
  dndHelper = {
    addSpanBefore: (parentDiv, allItems, wrapperSpanBefore) => {
      let beforeParent = this.getParentDiv(wrapperSpanBefore, allItems);
      let beforeSiblings = beforeParent.items;
      let beforeIndex = beforeSiblings
        .map(item => item.id)
        .indexOf(wrapperSpanBefore.id);
      // Before the insert, check that the dropTarget index doesn't already exist
      if (
        beforeSiblings[beforeIndex + 1] &&
        beforeSiblings[beforeIndex + 1].type !== 'optional' &&
        parentDiv.id !== beforeParent.id
      ) {
        beforeSiblings.splice(beforeIndex + 1, 0, this.createDropZoneObject());
      }
    },
    addSpanAfter: (parentDiv, allItems, wrapperSpanAfter) => {
      let afterParent = this.getParentDiv(wrapperSpanAfter, allItems);
      let afterSiblings = afterParent.items;
      let afterIndex = afterSiblings
        .map(item => item.id)
        .indexOf(wrapperSpanAfter.id);
      if (
        afterSiblings[afterIndex - 1] &&
        afterSiblings[afterIndex - 1].type !== 'optional' &&
        parentDiv.id !== afterParent.id
      ) {
        afterSiblings.splice(afterIndex, 0, this.createDropZoneObject());
      }
      if (afterIndex === 0 && parentDiv.id !== afterParent.id) {
        afterSiblings.splice(afterIndex, 0, this.createDropZoneObject());
      }
    },
    stuckInMiddle: (spanIndex, siblings, parentDiv) => {
      return (
        spanIndex !== 0 &&
        spanIndex !== siblings.length - 1 &&
        parentDiv.items[spanIndex - 1].type === 'span' &&
        parentDiv.items[spanIndex + 1].type === 'span'
      );
    },
    addSpanToEmptyHeader: (parentDiv, allItems) => {
      let wrapperParents = this.findWrapperHeaders(parentDiv, allItems);
      if (wrapperParents.after) {
        if (wrapperParents.after.items) {
          wrapperParents.after.items.splice(0, 0, this.createDropZoneObject());
        } else {
          wrapperParents.after.items = [this.createDropZoneObject()];
        }
      }
    }
  };

  /**
   * Determine whether a time overlaps (or falls between), an existing timespan's range
   * @param {String} time - form input value
   * @param {*} allSpans - all timespans in the data structure
   * @return {Boolean}
   */
  doesTimeOverlap(time, allSpans, duration = Number.MAX_SAFE_INTEGER) {
    const { toMs } = this;
    let valid = true;
    time = toMs(time);

    // Loop through all spans
    for (let i in allSpans) {
      let spanBegin = toMs(allSpans[i].begin);
      let spanEnd = toMs(allSpans[i].end);

      // Illegal time (falls between existing start/end times)
      if (time > spanBegin && time < spanEnd) {
        valid = false;
        break;
      }
      // Time exceeds the end time of the media file
      if (time / 1000 > duration) {
        valid = false;
        break;
      }
    }
    return valid;
  }

  doesTimespanOverlap(beginTime, endTime, allSpans) {
    const { toMs } = this;
    // Filter out only spans where new begin time is before an existing begin time
    let filteredSpans = allSpans.filter(span => {
      return toMs(beginTime) < toMs(span.begin);
    });
    // Return whether new end time overlaps the next begin time, if there are timespans after the current timespan
    if (filteredSpans.length !== 0) {
      return toMs(endTime) > toMs(filteredSpans[0].begin);
    }
    return false;
  }

  /**
   * Find an item by it's id
   * @param {String} id - string value to match against
   * @param {Array} items - Array of nested structured metadata objects containing headings and time spans
   * @return {Object} - Object found, or null if none
   */
  findItem(id, items) {
    let foundItem = null;
    let fn = items => {
      for (let item of items) {
        if (item.id === id) {
          foundItem = item;
        }
        if (item.items && item.items.length > 0) {
          fn(item.items);
        }
      }
    };
    fn(items);

    return foundItem;
  }

  /**
   * Find the <span>s which come before and after new span
   * @param {Object} newSpan - new span object
   * @param {Array} allSpans - all type <span> objects in current structured metadata
   * @returns {Object} - wrapper <span>s object: { before: spanObject, after: spanObject }
   */
  findWrapperSpans(newSpan, allSpans) {
    const { toMs } = this;
    let wrapperSpans = {
      before: null,
      after: null
    };
    let spansBefore = allSpans.filter(
      span => toMs(newSpan.begin) >= toMs(span.end)
    );
    let spansAfter = allSpans.filter(
      span => toMs(newSpan.end) <= toMs(span.begin)
    );

    wrapperSpans.before =
      spansBefore.length > 0 ? spansBefore[spansBefore.length - 1] : null;
    wrapperSpans.after = spansAfter.length > 0 ? spansAfter[0] : null;

    return wrapperSpans;
  }

  /**
   * Find the <div>s wrapping the current active timespan (either in editing or in drag-n-drop)
   * @param {Object} parentDiv - parent header of the active timespan
   * @param {Array} allItems - all the items in the structured metadata
   */
  findWrapperHeaders(parentDiv, allItems) {
    const wrapperHeadings = {
      before: null,
      after: null
    };
    let grandParentDiv = this.getParentDiv(parentDiv, allItems);
    if (grandParentDiv != null) {
      let grandParentItems = grandParentDiv.items.filter(
        item => item.type !== 'optional'
      );

      let parentIndex = grandParentItems
        .map(item => item.label)
        .indexOf(parentDiv.label);

      wrapperHeadings.before =
        grandParentItems[parentIndex - 1] !== undefined
          ? grandParentItems[parentIndex - 1]
          : null;
      wrapperHeadings.after =
        grandParentItems[parentIndex + 1] !== undefined
          ? grandParentItems[parentIndex + 1]
          : null;
    }
    return wrapperHeadings;
  }

  /**
   * Get all items in data structure of type 'div' or 'span'
   * @param {Array} json
   * @returns {Array} - all stripped down objects of type in the entire structured metadata collection
   */
  getItemsOfType(type = 'div', items = []) {
    let options = [];

    // Recursive function to search the whole data structure
    let getItems = items => {
      for (let item of items) {
        if (item.type === type) {
          let currentObj = { ...item };
          delete currentObj.items;
          options.push(currentObj);
        }
        if (item.items) {
          getItems(item.items);
        }
      }
    };
    getItems(items);

    return options;
  }

  getParentDiv(child, allItems) {
    let foundDiv = null;

    let findItem = (child, items) => {
      for (let item of items) {
        if (item.items) {
          let childItem = item.items.filter(
            currentChild => child.id === currentChild.id
          );
          // Found it
          if (childItem.length > 0) {
            foundDiv = item;
            break;
          }
          findItem(child, item.items);
        }
      }
    };
    findItem(child, allItems);
    return foundDiv;
  }

  /**
   * Overall logic is to find existing before and after spans for the new object (time flow), and then
   * their parent 'divs' would be valid headings.
   * @param {Object} wrapperSpans Object representing before and after spans of newSpan (if they exist)
   * @param {Array} allItems - All structural metadata items in tree
   * @return {Array} - of valid <div> objects in structural metadata tree
   */
  getValidHeadings(wrapperSpans, allItems) {
    let validHeadings = [];
    let sortedHeadings = [];

    let findSpanItem = (targetSpan, items) => {
      for (let item of items) {
        // Children items exist
        if (item.items) {
          // Check for a target span match
          let targetSpanMatch = item.items.filter(
            childItem => childItem.id === targetSpan.id
          );
          // Match found
          if (targetSpanMatch.length > 0) {
            let { items, ...cloneWOItems } = item;
            // Add parent div to valid array
            validHeadings.push(cloneWOItems);
          }
          // Try deeper in list
          findSpanItem(targetSpan, item.items);
        }
      }
    };

    // Get all headings in the metada structure
    let allHeadings = this.getItemsOfType('div', allItems).concat(
      this.getItemsOfType('root', allItems)
    );

    // There are currently no spans, ALL headings are valid
    if (!wrapperSpans.before && !wrapperSpans.after) {
      validHeadings = allHeadings;
    }

    if (wrapperSpans.before) {
      findSpanItem(wrapperSpans.before, allItems);
    }
    if (wrapperSpans.after) {
      findSpanItem(wrapperSpans.after, allItems);
    }
    // Get valid headings when either of wrapping timespan is null
    if (
      (!wrapperSpans.before && wrapperSpans.after) ||
      (wrapperSpans.before && !wrapperSpans.after)
    ) {
      let validDivHeading = this.getValidHeadingForEmptySpans(
        wrapperSpans,
        allItems
      );
      validHeadings = validHeadings.concat(validDivHeading);
    }

    // Sort valid headings to comply with the order in the metadata structure
    allHeadings.forEach(key => {
      let found = false;
      validHeadings = validHeadings.filter(heading => {
        if (!found && heading.label === key.label) {
          sortedHeadings.push(heading);
          found = true;
          return false;
        } else {
          return true;
        }
      });
    });

    return sortedHeadings;
  }

  /**
   * Find valid headings when either wrapping timespan before or after is null
   * @param {Object} wrapperSpans - spans wrapping the current active timespan
   * @param {Array} allItems - all the items in structured metadata
   */
  getValidHeadingForEmptySpans(wrapperSpans, allItems) {
    let adjacentDiv = null;

    let getWrapperDiv = (currentParent, position) => {
      let wrapperParents = this.findWrapperHeaders(currentParent, allItems);
      switch (position) {
        case 'before':
          return !wrapperParents.before ? currentParent : wrapperParents.before;
        case 'after':
          return !wrapperParents.after ? currentParent : wrapperParents.after;
        default:
          return currentParent;
      }
    };

    let nestedHeadings = [];
    let getNestedDivs = (currentHeader, currentParent) => {
      if (currentHeader !== currentParent) {
        let items = currentHeader.items;
        if (items) {
          for (let item of items) {
            if (item.type === 'div') {
              let { items, ...cloneWOItems } = item;
              nestedHeadings.push(cloneWOItems);
            }
            getNestedDivs(item, currentParent);
          }
        }
      }
    };
    if (!wrapperSpans.after && wrapperSpans.before) {
      let currentParent = this.getParentDiv(wrapperSpans.before, allItems);
      adjacentDiv = getWrapperDiv(currentParent, 'after');
      getNestedDivs(adjacentDiv, currentParent);
    }
    if (!wrapperSpans.before && wrapperSpans.after) {
      let currentParent = this.getParentDiv(wrapperSpans.after, allItems);
      adjacentDiv = getWrapperDiv(currentParent, 'before');
      getNestedDivs(adjacentDiv, currentParent);
    }
    let { items, ...woItems } = adjacentDiv;
    nestedHeadings.push(woItems);
    return nestedHeadings;
  }

  /**
   * Helper function which handles React Dnd's dropping of a dragSource onto a dropTarget
   * It needs to re-arrange the data structure to reflect the new positions
   * @param {Object} dragSource - a minimal object React DnD uses with only the id value
   * @param {Object} dropTarget
   * @param {Array} allItems
   * @returns {Array}
   */
  handleListItemDrop(dragSource, dropTarget, allItems) {
    let clonedItems = cloneDeep(allItems);
    let itemToMove = this.findItem(dragSource.id, clonedItems);

    // Slice out previous position of itemToMove
    let itemToMoveParent = this.getParentDiv(itemToMove, clonedItems);
    let itemToMoveItemIndex = itemToMoveParent.items
      .map(item => item.id)
      .indexOf(itemToMove.id);
    itemToMoveParent.items.splice(itemToMoveItemIndex, 1);

    // Place itemToMove right after the placeholder array position
    let dropTargetParent = this.getParentDiv(dropTarget, clonedItems);
    let dropTargetItemIndex = dropTargetParent.items
      .map(item => item.id)
      .indexOf(dropTarget.id);
    dropTargetParent.items.splice(dropTargetItemIndex, 0, itemToMove);

    // Get rid of all placeholder elements
    return this.removeDropTargets(clonedItems);
  }

  /**
   * Insert a new heading as child of an existing heading
   * @param {Object} obj - new heading object to insert
   * @param {Array} allItems - The entire structured metadata collection
   * @returns {Array} - The updated structured metadata collection, with new object inserted
   */
  insertNewHeader(obj, allItems) {
    let clonedItems = cloneDeep(allItems);
    let foundDiv =
      this.findItem(obj.headingChildOf, clonedItems) || clonedItems[0];

    // If children exist, add to list
    if (foundDiv) {
      foundDiv.items.push({
        id: uuidv1(),
        type: 'div',
        label: obj.headingTitle,
        items: []
      });
    }

    return clonedItems;
  }

  /**
   * Insert a new timespan as child of an existing heading
   * @param {Object} obj - object of form values submitted
   * @param {Array} allItems - The entire structured metadata collection
   * @returns ({Object}, {Array}) - (New span, The updated structured metadata collection, with new object inserted)
   */
  insertNewTimespan(obj, allItems) {
    const { toMs } = this;
    let clonedItems = cloneDeep(allItems);
    let foundDiv = this.findItem(obj.timespanChildOf, clonedItems);
    const spanObj = this.createSpanObject(obj);
    let insertIndex = 0;
    let nestedTimespans = [];

    let findNestedTimespans = header => {
      const items = header.items;
      for (let item of items) {
        if (item.type === 'span' && toMs(spanObj.begin) > toMs(item.end)) {
          nestedTimespans.push(item);
        }
      }
    };

    // If children exist, add to list
    if (foundDiv) {
      let childSpans = foundDiv.items.filter(item => item.type === 'span');

      const nestedHeaders = foundDiv.items.filter(item => item.type === 'div');
      for (let header of nestedHeaders) {
        findNestedTimespans(header);
      }
      // Add nested timespans from child items and sort by begin time
      childSpans = childSpans
        .concat(nestedTimespans)
        .sort((x, y) => this.toMs(x['begin']) - this.toMs(y['begin']));

      // Get before and after sibling spans
      let wrapperSpans = this.findWrapperSpans(spanObj, childSpans);

      if (wrapperSpans.before) {
        let wrapperSpanParent = this.getParentDiv(
          wrapperSpans.before,
          allItems
        );
        if (wrapperSpanParent.id !== foundDiv.id) {
          insertIndex =
            findIndex(foundDiv.items, { id: wrapperSpanParent.id }) + 1;
        } else {
          insertIndex =
            findIndex(foundDiv.items, { id: wrapperSpans.before.id }) + 1;
        }
      }
      // Insert new span at appropriate index
      foundDiv.items.splice(insertIndex, 0, spanObj);
    }

    return { newSpan: spanObj, updatedData: clonedItems };
  }

  /**
   * Recursive function to clean out any 'active' drag item property in the data structure
   * @param {Array} allItems
   * @returns {Array}
   */
  removeActiveDragSources(allItems) {
    let removeActive = parent => {
      if (!parent.items) {
        if (parent.active) {
          parent.active = false;
        }
        return parent;
      }
      parent.items = parent.items.map(child => removeActive(child));

      return parent;
    };
    let cleanItems = removeActive(allItems[0]);

    return [cleanItems];
  }

  /**
   * Recursive function to remove all temporary Drop Target objects from the structured metadata items
   * @param {Array} allItems
   */
  removeDropTargets(allItems) {
    const clonedItems = cloneDeep(allItems);
    let removeFromTree = (parent, childTypeToRemove) => {
      if (!parent.items) {
        return parent;
      }

      parent.items = parent.items
        .filter(child => child.type !== childTypeToRemove)
        .map(child => removeFromTree(child, childTypeToRemove));

      return parent;
    };
    let cleanItems = removeFromTree(clonedItems[0], 'optional');

    return [cleanItems];
  }

  /**
   * Does 'before' time start prior to 'end' time?
   * @param {String} begin form intput value
   * @param {String} end form input value
   * @return {Boolean}
   */
  validateBeforeEndTimeOrder(begin, end) {
    if (!begin || !end) {
      return true;
    }
    if (this.toMs(begin) >= this.toMs(end)) {
      return false;
    }
    return true;
  }

  validTimeFormat(value) {
    return value && value.split(':').length === 3;
  }

  /**
   * This function adds a unique, front-end only id, to every object in the data structure
   * @param {Array} structureJS
   * @returns {Array}
   */
  addUUIds(structureJS) {
    let structureWithIds = cloneDeep(structureJS);

    // Recursively loop through data structure
    let fn = items => {
      for (let item of items) {
        // Create and add an id
        item.id = uuidv1();

        // Send child items back into the function
        if (item.items && item.items.length > 0) {
          fn(item.items);
        }
      }
    };

    fn(structureWithIds);

    return structureWithIds;
  }

  /**
   * Mark the top element as 'root' to help when creating list items
   * The top elemetn should not have a delete icon
   * @param {Array} smData - array of structured metadata
   */
  markRootElement(smData) {
    if (smData.length > 0) {
      smData[0].type = 'root';
    }
  }

  /**
   * Moment.js helper millisecond converter to make calculations consistent
   * @param {String} strTime form input value
   */
  toMs(strTime) {
    return moment.duration(strTime).asMilliseconds();
  }

  /**
   * Convert seconds to string format hh:mm:ss
   * @param {Number} secTime - time in seconds
   */
  toHHmmss(secTime) {
    let sec_num = this.roundOff(secTime);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor(sec_num / 60);
    let seconds = sec_num - minutes * 60 - hours * 3600;

    let hourStr = hours < 10 ? `0${hours}` : `${hours}`;
    let minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    let secStr = seconds.toFixed(2);
    secStr = seconds < 10 ? `0${secStr}` : `${secStr}`;

    return `${hourStr}:${minStr}:${secStr}`;
  }

  roundOff(value) {
    var valueString = '';
    var [intVal, decVal] = value.toString().split('.');
    if (!decVal) {
      valueString = intVal;
    } else {
      valueString = intVal + '.' + decVal.substring(0, 2);
    }
    return parseFloat(valueString);
  }
}
