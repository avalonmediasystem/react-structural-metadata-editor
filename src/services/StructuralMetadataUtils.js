import { findIndex, cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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
      id: uuidv4(),
    };
  }

  /**
   * Helper function which creates an object with the shape our data structure requires
   * @param {Object} obj
   * @param {Boolean} nestedSpan flag the new span is nested wihin a timespan
   * @return {Object}
   */
  createSpanObject(obj, nestedSpan = false) {
    return {
      id: uuidv4(),
      type: 'span',
      label: obj.timespanTitle,
      begin: obj.beginTime,
      end: obj.endTime,
      items: [],
      timeRange: {
        start: this.convertToSeconds(obj.beginTime),
        end: this.convertToSeconds(obj.endTime)
      },
      nestedSpan,
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
    let parentDiv = this.getParentItem(item, clonedItems);
    let indexToDelete = findIndex(parentDiv.items, { id: item.id });

    parentDiv.items.splice(indexToDelete, 1);

    return clonedItems;
  }

  /**
   * Convert time in hh:mm:ss.ms format to seconds
   * @param {String} time time in hh:mm:ss.ms format
   * @returns {Number}
   */
  convertToSeconds = (time) => {
    let timeSeconds = this.toMs(time) / 1000;
    // When time property is missing
    if (isNaN(timeSeconds)) {
      return 0;
    } else {
      return timeSeconds;
    }
  };

  /**
   * Format the time of the timespans in the structured metadata fetched from the server,
   * so that they can be used in the validation logic and Peaks instance
   * @param {Array} allItems - array of all the items in structured metadata
   * @param {Float} duration - end time of the media file in seconds
   * @return {Object} { newSmData: Array<Object>, newSmDataStatus: Boolean }
   */
  buildSMUI(allItems, duration) {
    let smDataIsValid = true;

    let decodeHTML = (lableText) => {
      return lableText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    };

    // Recursive function to traverse whole data structure
    let formatItems = (items) => {
      for (let item of items) {
        item.label = decodeHTML(item.label);
        item.valid = true;
        if (item.type === 'span') {
          const { begin, end } = item;
          let beginTime = this.convertToSeconds(begin);
          let endTime = this.convertToSeconds(end);
          item.timeRange = { start: beginTime, end: endTime };
          item.begin = this.toHHmmss(beginTime);
          item.end = this.toHHmmss(endTime);
          if (beginTime > endTime || beginTime > duration) {
            item.valid = false;
            smDataIsValid = false;
          } else if (endTime > duration) {
            item.valid = false;
            smDataIsValid = false;
            item.end = this.toHHmmss(duration);
          }
          if (endTime === 0) {
            item.end = this.toHHmmss(duration);
          }
        }
        if (item.type === 'div') {
          if (item.items.length === 0) {
            item.valid = false;
            smDataIsValid = false;
          }
        }

        if (item.items) {
          formatItems(item.items);
        }
      }
    };

    formatItems(allItems);
    return { newSmData: allItems, newSmDataStatus: smDataIsValid };
  }

  /**
   * Update the data structure to represent all possible dropTargets for the 
   * provided dragSource item with type='span'
   * @param {Object} dragSource
   * @param {Object} allItems
   * @returns {Array} - newly created items with drop-zones as needed
   */
  determineDropTargets(dragSource, allItems) {
    if (dragSource == undefined || dragSource == null || allItems?.length === 0) {
      return allItems;
    }
    const clonedItems = cloneDeep(allItems);

    // Set the scope of the drop-zones based on the dragSource
    let scopedItems = clonedItems;
    let allSpans = this.getItemsOfType(['span'], clonedItems);
    let parent = this.getParentItem(dragSource, clonedItems);
    let siblings = parent ? parent.items : [];
    let spanIndex = siblings.map((sibling) => sibling.id).indexOf(dragSource.id);

    if (dragSource.nestedSpan) {
      // Scope the drop-zones to only its parent timespan
      scopedItems = [parent];
      // For nested timespans, scope drop target calculation within parent timespan only
      parent = this.getParentItem(dragSource, clonedItems);
      allSpans = this.getItemsOfType(['span'], [parent]);
      siblings = parent ? parent.items : [];
      const siblingHeadings = siblings.filter(sib => sib.type === 'div');

      /**
       * If the parent timespan doesn't have any heading type structre, then it can't be moved.
       * Assumption: children inside a timespan are not overlapping and are in chronological order,
       * therefore the timespan cannot able to be moved.
       */
      if (siblingHeadings?.length === 0) {
        return clonedItems;
      }
    } else {
      let stuckInMiddle = this.dndHelper.stuckInMiddle(spanIndex, siblings, parent);

      // If span falls in the middle of its sibling spans, it can't be moved
      if (stuckInMiddle) {
        return clonedItems;
      }

      let grandParentDiv = this.getParentItem(parent, clonedItems);
      // A first/last child of siblings, or an only child
      if (grandParentDiv !== null) {
        let siblingTimespans = this.getItemsOfType(['span'], siblings);
        let timespanIndex = siblingTimespans.map((sibling) => sibling.id).indexOf(dragSource.id);

        let parentIndex = grandParentDiv.items.map((item) => item.id).indexOf(parent.id);
        if (timespanIndex === 0) {
          grandParentDiv.items.splice(parentIndex, 0, this.createDropZoneObject());
        }
        if (timespanIndex === siblingTimespans.length - 1) {
          let newPI = grandParentDiv.items.map((item) => item.id).indexOf(parent.id);
          grandParentDiv.items.splice(newPI + 1, 0, this.createDropZoneObject());
        }
      }
    }

    // Get sibling timespans for the drag source timespan
    let wrapperSpans = this.findWrapperSpans(dragSource, allSpans);

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
    if (spanIndex !== siblings.length - 1 && siblings[spanIndex + 1].type === 'div') {
      let sibling = siblings[spanIndex + 1];
      if (sibling.items) {
        sibling.items.unshift(this.createDropZoneObject());
      } else {
        sibling.items = [this.createDropZoneObject()];
      }
    }

    // Insert after the "before" wrapper span (if one exists)
    if (wrapperSpans.before) {
      this.dndHelper.addSpanBefore(parent, scopedItems, wrapperSpans.before);
    }
    // Insert relative to the span after the active span
    if (wrapperSpans.after) {
      this.dndHelper.addSpanAfter(parent, scopedItems, wrapperSpans.after);
    }
    // Insert when there is no wrapper span after active span, but empty headers
    if (!wrapperSpans.after) {
      this.dndHelper.addSpanToEmptyHeader(parent, scopedItems);
    }

    return clonedItems;
  }

  /**
   * Helper object for drag and drop data structure manipulations
   * This mutates the state of the data structure
   */
  dndHelper = {
    addSpanBefore: (parentDiv, allItems, wrapperSpanBefore) => {
      let beforeParent = this.getParentItem(wrapperSpanBefore, allItems);
      let beforeSiblings = beforeParent.items;
      let beforeIndex = beforeSiblings
        .map((item) => item.id)
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
      let afterParent = this.getParentItem(wrapperSpanAfter, allItems);
      let afterSiblings = afterParent.items;
      let afterIndex = afterSiblings
        .map((item) => item.id)
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
    },
  };

  /**
   * Find an item by it's id
   * @param {String} id - string value to match against
   * @param {Array} items - Array of nested structured metadata objects containing headings and time spans
   * @return {Object} - Object found, or null if none
   */
  findItem(id, items) {
    let foundItem = null;
    let fn = (items) => {
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
      after: null,
    };
    let spansBefore = allSpans.filter(
      (span) => toMs(newSpan.begin) >= toMs(span.end)
    );
    let spansAfter = allSpans.filter(
      (span) => toMs(newSpan.end) <= toMs(span.begin)
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
      after: null,
    };
    let grandParentDiv = this.getParentItem(parentDiv, allItems);
    if (grandParentDiv != null) {
      let grandParentItems = grandParentDiv.items.filter(
        (item) => item.type !== 'optional'
      );

      let parentIndex = grandParentItems
        .map((item) => item.label)
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
   * @param {Array} itemTypes types of items to pick
   * @param {Array} json
   * @returns {Array} - all stripped down objects of type in the entire structured metadata collection
   */
  getItemsOfType(itemTypes = [], items = []) {
    if (itemTypes.length === 0) {
      return [];
    }
    let options = [];

    // Recursive function to search the whole data structure
    let getItems = (items) => {
      for (let item of items) {
        if (itemTypes.includes(item.type)) {
          let currentObj = { ...item };
          // Keep items array to identify parent timespans in HeadingForm
          if (item.type != 'span') { delete currentObj.items; }
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

  /**
   * Find the parent heading item (div/span) of a given item
   * @param {Object} child - item for which parent div needs to be found
   * @param {Array} allItems - list of items in the structure
   * @returns {Object} parent div of the given child item
   */
  getParentItem(child, allItems) {
    let foundDiv = null;

    let findItem = (child, items) => {
      if (items && items.length > 0) {
        for (let item of items) {
          if (item.items) {
            let childItem = item.items.filter(
              (currentChild) => child.id === currentChild.id
            );
            // Found it
            if (childItem.length > 0) {
              foundDiv = item;
              break;
            }
            findItem(child, item.items);
          }
        }
      }
    };
    findItem(child, allItems);
    return foundDiv;
  }

  /**
   * Overall logic to find possible parent structure items for a newly created timespan.
   * To find possible parent headings; get existing wrapper timespans for the new timespan, and then
   * find their parent 'divs'. 
   * Timespans can have children, so to find possible parent timespans; combine the wrapper timespans with
   * the parent 'divs' of the wrapper timespans.
   * @param {Object} newSpan - new timespan created with values supplied by the user
   * @param {Object} wrapperSpans object representing before and after spans of newSpan (if they exist)
   * @param {Array} allItems - all structural metadata items in tree
   * @param {Object} parentTimespan - closest possible parent timespan that can contain the new timespan
   * @return {Array} - of valid <div> and <span> objects in structural metadata tree
   */
  getValidParents(newSpan, wrapperSpans, allItems, parentTimespan = null) {
    let possibleValidParents = [];
    let sortedParents = [];
    let uniqueParents = [];
    // New timespan falls between timespans in the same parent
    let stuckInMiddle = false;
    const { toMs } = this;

    /**
     * If there is a parent timespan for the new timespan, then the choices for a possible
     * parent for the new timespan is limited to the parent timespan and any of its children
     * headings (if exists). Reasoning: a timespan cannot span across multiple parent timespans.
     */
    if (parentTimespan) {
      const { before, after } = wrapperSpans;
      const prevSiblingIndex = parentTimespan.items.findIndex((c) => c.id === before?.id);
      const nextSiblingIndex = parentTimespan.items.findIndex((c) => c.id === after?.id);

      let siblingHeadings = parentTimespan.items.filter((sib, index) => {
        if (sib.type !== 'div') return false;
        // No siblings
        if (prevSiblingIndex < 0 && nextSiblingIndex < 0) { return true; }
        // New timespan is at the start of the sibling list
        if (prevSiblingIndex < 0) { return index + 1 === nextSiblingIndex; }
        // New timespan is at the end of the sibling list
        if (nextSiblingIndex < 0) { return index === prevSiblingIndex + 1; }
        // New timespan is sandwiched between other siblings
        if (prevSiblingIndex >= 0 && nextSiblingIndex >= 0) {
          return index === prevSiblingIndex + 1 && index + 1 === nextSiblingIndex;
        }
        return false;
      });
      return [parentTimespan, ...siblingHeadings];
    }

    const { before, after } = wrapperSpans;
    const allPossibleParents = this.getItemsOfType(['root', 'div', 'span'], allItems);

    // Explore possible headings traversing outwards from a suggested heading
    let exploreOutwards = (heading) => {
      let invalid = false;
      const parentHeading = this.getParentItem(heading, allItems);
      const { begin: newBegin, end: newEnd } = newSpan;
      if (parentHeading && !stuckInMiddle) {
        const headingIndex = parentHeading.items
          .map((item) => item.id)
          .indexOf(heading.id);
        const siblings = parentHeading.items;
        siblings.forEach((sibling, i) => {
          if (sibling.type === 'span') {
            const { begin, end } = sibling;
            if (toMs(newEnd) < toMs(begin) && i < headingIndex) {
              invalid = true;
            }
            if (toMs(newBegin) > toMs(end) && i > headingIndex) {
              invalid = true;
            }
          }
        });
        if (!invalid) {
          possibleValidParents.push(parentHeading);
          exploreOutwards(parentHeading);
        } else {
          return;
        }
      }
    };

    // Find relevant headings traversing into suggested headings
    let exploreInwards = (wrapperParent, wrapperSpan, isBefore) => {
      const spanIndex = wrapperParent.items
        .map((item) => item.id)
        .indexOf(wrapperSpan.id);
      let divsAfter = [],
        divsBefore = [];
      if (isBefore) {
        divsAfter = wrapperParent.items.filter((item, i) => i > spanIndex);
        const nextDivs = this.getItemsAfter(wrapperParent, allItems, []);
        divsAfter = divsAfter.concat(nextDivs);
      } else {
        divsBefore = wrapperParent.items.filter((item, i) => i < spanIndex);
      }
      const allParents = this.getItemsOfType(['div', 'span'], [...divsAfter, ...divsBefore]);
      return allParents;
    };

    if (!before && !after) {
      possibleValidParents = allPossibleParents;
    }
    if (before) {
      const parentBefore = this.getParentItem(before, allItems);
      possibleValidParents.push(parentBefore);
      if (!after) {
        let parents = exploreInwards(parentBefore, before, true);
        possibleValidParents = possibleValidParents.concat(parents);
      }
    }
    if (after) {
      const parentAfter = this.getParentItem(after, allItems);
      possibleValidParents.push(parentAfter);
      if (!before) {
        let parents = exploreInwards(parentAfter, after, false);
        possibleValidParents = possibleValidParents.concat(parents);
      }
    }
    if (before && after) {
      const parentBefore = this.getParentItem(before, allItems);
      const parentAfter = this.getParentItem(after, allItems);
      if (parentBefore.id === parentAfter.id) {
        stuckInMiddle = true;
        possibleValidParents.push(parentBefore);
      }
    }

    possibleValidParents.map((heading) => exploreOutwards(heading));

    // Sort valid headings to comply with the order in the metadata structure
    allPossibleParents.forEach((key) => {
      let found = false;
      possibleValidParents.filter((parent) => {
        if (!found && parent.label === key.label) {
          const { items, ...cloneWOItems } = parent;
          sortedParents.push(cloneWOItems);
          found = true;
          return false;
        } else {
          return true;
        }
      });
    });

    // Filter the duplicated headings
    sortedParents.map((parent) => {
      const indexIn = uniqueParents.map((h) => h.id).indexOf(parent.id);
      if (indexIn === -1) {
        uniqueParents.push(parent);
      }
    });
    return uniqueParents;
  }

  /**
   * Get items after a given item in the structure
   * @param {Object} currentItem
   * @param {Array} allItems all items in the structure
   * @param {Array} nextDivs heading items after the current item
   */
  getItemsAfter(currentItem, allItems, nextDivs) {
    const parentItem = this.getParentItem(currentItem, allItems);
    if (parentItem) {
      const currentIndex = parentItem.items
        .map((item) => item.id)
        .indexOf(currentItem.id);
      const nextItem = parentItem.items.filter((item, i) => i > currentIndex);
      nextDivs = nextDivs.concat(nextItem);
      if (this.getParentItem(parentItem, allItems)) {
        return this.getItemsAfter(parentItem, allItems, nextDivs);
      }
    }
    return nextDivs;
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
    let itemToMoveParent = this.getParentItem(itemToMove, clonedItems);
    let itemToMoveItemIndex = itemToMoveParent.items
      .map((item) => item.id)
      .indexOf(itemToMove.id);
    itemToMoveParent.items.splice(itemToMoveItemIndex, 1);

    // Place itemToMove right after the placeholder array position
    let dropTargetParent = this.getParentItem(dropTarget, clonedItems);
    let dropTargetItemIndex = dropTargetParent.items
      .map((item) => item.id)
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
        id: uuidv4(),
        type: 'div',
        label: obj.headingTitle,
        items: [],
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
    let clonedItems = cloneDeep(allItems);

    let parentItem = this.findItem(obj.timespanChildOf, clonedItems);
    let nestedSpan = false;
    if (parentItem.type === 'span') { nestedSpan = true; }
    // Timespan related to values
    const spanObj = this.createSpanObject(obj, nestedSpan);

    // Index the new timespan to be inserted
    let insertIndex = 0;

    let getParentOfSpan = (item) => {
      let inFoundDiv = false;
      let closestSibling = null;
      const siblings = parentItem.items;
      if (siblings?.length > 0) {
        siblings.map((sibling) => {
          if (sibling.id === item.id) {
            inFoundDiv = true;
            closestSibling = sibling;
          }
        });
      }
      if (!inFoundDiv) {
        let parentItem = this.getParentItem(item, allItems);
        if (parentItem) {
          closestSibling = getParentOfSpan(parentItem);
        }
      }
      return closestSibling;
    };

    if (parentItem) {
      const allSpans = this.getItemsOfType(['span'], allItems);
      const { before, after } = this.findWrapperSpans(spanObj, allSpans);
      if (before) {
        let siblingBefore = getParentOfSpan(before);
        if (siblingBefore) {
          insertIndex =
            parentItem.items.map((item) => item.id).indexOf(siblingBefore.id) + 1;
        }
      } else if (after) {
        let siblingAfter = getParentOfSpan(after);
        if (siblingAfter) {
          let siblingAfterIndex = parentItem.items
            .map((item) => item.id)
            .indexOf(siblingAfter.id);
          insertIndex = siblingAfterIndex === 0 ? 0 : siblingAfterIndex - 1;
        }
      } else {
        insertIndex = parentItem.items.length + 1;
      }
    }

    // Insert new span at appropriate index
    parentItem.items.splice(insertIndex, 0, spanObj);

    return { newSpan: spanObj, updatedData: clonedItems };
  }

  /**
   * Recursive function to clean out any 'active' drag item property in the data structure
   * @param {Array} allItems
   * @returns {Array}
   */
  removeActiveDragSources(allItems) {
    let removeActive = (parent) => {
      if (parent.active) {
        parent.active = false;
      }
      if (parent.items) {
        parent.items = parent.items.map((child) => removeActive(child));
      }

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
        .filter((child) => child.type !== childTypeToRemove)
        .map((child) => removeFromTree(child, childTypeToRemove));

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

  /**
   * This function adds a unique, front-end only id, to every object in the data structure
   * @param {Array} structureJS
   * @returns {Array}
   */
  addUUIds(structureJS) {
    let structureWithIds = cloneDeep(structureJS);

    // Recursively loop through data structure
    let fn = (items) => {
      for (let item of items) {
        // Create and add an id
        item.id = uuidv4();

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
   * Convert hh:mm:ss to milliseconds to make calculations consistent
   * @param {String} strTime form input value
   */
  toMs(strTime) {
    let [seconds, minutes, hours] = strTime.split(':').reverse();
    let hoursInS = hours ? parseInt(hours) * 3600 : 0;
    let minutesInS = minutes ? parseInt(minutes) * 60 : 0;
    // Replace comma with dot for decimal seconds
    seconds = seconds.replace(/,/g, '.');
    let secondsNum = seconds === '' ? 0.0 : parseFloat(seconds);
    let timeSeconds = hoursInS + minutesInS + secondsNum;
    return timeSeconds * 1000;
  }

  /**
   * Convert seconds to string format hh:mm:ss.ms
   * @param {Number} secTime - time in seconds
   */
  toHHmmss(secTime) {
    if (secTime != undefined) {
      let sec_num = this.roundOff(secTime);
      let hours = Math.floor(sec_num / 3600);
      let minutes = Math.floor((sec_num % 3600) / 60);
      let seconds = sec_num - minutes * 60 - hours * 3600;

      let hourStr = hours < 10 ? `0${hours}` : `${hours}`;
      let minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      let secStr = seconds.toFixed(3);
      secStr = seconds < 10 ? `0${secStr}` : `${secStr}`;

      return `${hourStr}:${minStr}:${secStr}`;
    }
  }

  roundOff(value) {
    if (value != undefined) {
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

  /**
   * Remove a given key in the each object in the structure
   * @param {Array} allitems - smData
   * @param {String} key - object key to be removed in the structure
   */
  filterObjectKey(allitems, key) {
    let clonedItems = cloneDeep(allitems);
    let removeKey = (items) => {
      for (let item of items) {
        if (key in item) {
          delete item.active;
        }
        if (item.items && item.items.length > 0) {
          removeKey(item.items);
        }
      }
    };
    removeKey(clonedItems, key);

    return clonedItems;
  }


  /**
   * Get siblings and parent timespans for a given structure item.
   * These values are then used across the component to validate timespan
   * creation and editing.
   * @param {Array} smData structure data
   * @param {Object} item 'span' type object matching structure data
   * @returns {Object}
   */
  calculateAdjacentTimespans(smData, item) {
    const allSpans = this.getItemsOfType(['span'], smData);

    let possibleParent = null;
    let closestGapBefore = Infinity; let possiblePrevSibling = null;
    let closestGapAfter = Infinity; let possibleNextSibling = null;

    const { start, end } = item.timeRange;

    let parentDiv = this.getParentItem(item, smData);
    if (parentDiv == null && item.parentId != undefined) {
      parentDiv = this.findItem(item.parentId, smData);
    }
    if (parentDiv && parentDiv.type === 'span') {
      possibleParent = parentDiv;
    } else {
      possibleParent = null;
    }

    allSpans.map((span) => {
      let gapBefore = start - span.timeRange.end;
      if (gapBefore >= 0 && gapBefore < closestGapBefore) {
        closestGapBefore = gapBefore;
        possiblePrevSibling = span;
      }

      let gapAfter = span.timeRange.start - end;
      if (gapAfter >= 0 && gapAfter < closestGapAfter) {
        closestGapAfter = gapAfter;
        possibleNextSibling = span;
      }
    });
    return { possibleParent, possiblePrevSibling, possibleNextSibling };
  };

}
