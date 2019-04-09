var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var StructuralMetadataUtils = function () {
  function StructuralMetadataUtils() {
    var _this = this;

    _classCallCheck(this, StructuralMetadataUtils);

    this.dndHelper = {
      addSpanBefore: function addSpanBefore(allItems, wrapperSpanBefore) {
        var beforeParent = _this.getParentDiv(wrapperSpanBefore, allItems);
        var beforeIndex = beforeParent.items.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpanBefore.id);
        // Before the insert, check that the dropTarget index doesn't already exist
        if (beforeParent.items[beforeIndex + 1] && beforeParent.items[beforeIndex + 1].type !== 'optional') {
          beforeParent.items.splice(beforeIndex + 1, 0, _this.createDropZoneObject());
        }
      },
      addSpanAfter: function addSpanAfter(allItems, wrapperSpanAfter) {
        var afterParent = _this.getParentDiv(wrapperSpanAfter, allItems);
        var afterIndex = afterParent.items.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpanAfter.id);

        afterParent.items.splice(afterIndex, 0, _this.createDropZoneObject());
      },
      stuckInMiddle: function stuckInMiddle(spanIndex, siblings, parentDiv) {
        return spanIndex !== 0 && spanIndex !== siblings.length - 1 && parentDiv.items[spanIndex - 1].type === 'span' && parentDiv.items[spanIndex + 1].type === 'span';
      },
      addSpanToEmptyHeader: function addSpanToEmptyHeader(parentDiv, allItems) {
        var wrapperParents = _this.findWrapperHeaders(parentDiv, allItems);
        if (wrapperParents.after) {
          wrapperParents.after.items.splice(0, 0, _this.createDropZoneObject());
        }
      }
    };
  }

  /**
   * Helper function to create a dropZone object for drag and drop
   * @returns {Object}
   */
  StructuralMetadataUtils.prototype.createDropZoneObject = function createDropZoneObject() {
    return {
      type: 'optional',
      id: uuidv1()
    };
  };

  /**
   * Helper function which creates an object with the shape our data structure requires
   * @param {Object} obj
   * @return {Object}
   */


  StructuralMetadataUtils.prototype.createSpanObject = function createSpanObject(obj) {
    return {
      id: uuidv1(),
      type: 'span',
      label: obj.timespanTitle,
      begin: obj.beginTime,
      end: obj.endTime
    };
  };

  /**
   * Remove a targeted list item object from data structure
   * @param {String} id - list item id
   * @param {Array} allItems array of items, usually all current items in the data structure
   * @return {Array}
   */


  StructuralMetadataUtils.prototype.deleteListItem = function deleteListItem(id, allItems) {
    var clonedItems = cloneDeep(allItems);
    var item = this.findItem(id, allItems);
    var parentDiv = this.getParentDiv(item, clonedItems);
    var indexToDelete = findIndex(parentDiv.items, { id: item.id });

    parentDiv.items.splice(indexToDelete, 1);

    return clonedItems;
  };

  /**
   * Update the data structure to represent all possible dropTargets for the provided dragSource
   * @param {Object} dragSource
   * @param {Object} allItems
   * @returns {Array} - new computed items
   */


  StructuralMetadataUtils.prototype.determineDropTargets = function determineDropTargets(dragSource, allItems) {
    var clonedItems = cloneDeep(allItems);

    if (dragSource.type === 'span') {
      var wrapperSpans = this.findWrapperSpans(dragSource, this.getItemsOfType('span', clonedItems));
      var parentDiv = this.getParentDiv(dragSource, clonedItems);
      var siblings = parentDiv ? parentDiv.items : [];
      var spanIndex = siblings.map(function (sibling) {
        return sibling.id;
      }).indexOf(dragSource.id);
      var stuckInMiddle = this.dndHelper.stuckInMiddle(spanIndex, siblings, parentDiv);

      // If span falls in the middle of other spans, it can't be moved
      if (stuckInMiddle) {
        return clonedItems;
      }

      // Sibling before is a div?
      if (spanIndex !== 0 && siblings[spanIndex - 1].type === 'div') {
        var sibling = siblings[spanIndex - 1];
        if (sibling.items) {
          sibling.items.push(this.createDropZoneObject());
        } else {
          sibling.items = [this.createDropZoneObject()];
        }
      }

      // Sibling after is a div?
      if (spanIndex !== siblings.length - 1 && siblings[spanIndex + 1].type === 'div') {
        var _sibling = siblings[spanIndex + 1];
        if (_sibling.items) {
          _sibling.items.unshift(this.createDropZoneObject());
        } else {
          _sibling.items = [this.createDropZoneObject()];
        }
      }

      var grandParentDiv = this.getParentDiv(parentDiv, clonedItems);
      var parentIndex = grandParentDiv ? grandParentDiv.items.map(function (item) {
        return item.id;
      }).indexOf(parentDiv.id) : null;
      // A first child of siblings, or an only child
      if (spanIndex === 0) {
        // Can't move up
        if (parentIndex === null) {
          return clonedItems;
        }

        if (grandParentDiv) {
          // Insert directly before the parent div
          grandParentDiv.items.splice(parentIndex, 0, this.createDropZoneObject());

          // Insert after the "before" wrapper span (if one exists)
          if (wrapperSpans.before) {
            this.dndHelper.addSpanBefore(clonedItems, wrapperSpans.before);
          }
        }
      }

      // Insert relative to the span after the active span
      if (wrapperSpans.after) {
        this.dndHelper.addSpanAfter(clonedItems, wrapperSpans.after);
      }
      // Insert when there is no wrapper span after active span, but empty headers
      if (!wrapperSpans.after) {
        this.dndHelper.addSpanToEmptyHeader(parentDiv, clonedItems);
      }
    }

    return clonedItems;
  };

  /**
   * Helper object for drag and drop data structure manipulations
   * This mutates the state of the data structure
   */


  /**
   * Determine whether a time overlaps (or falls between), an existing timespan's range
   * @param {String} time - form input value
   * @param {*} allSpans - all timespans in the data structure
   * @return {Boolean}
   */
  StructuralMetadataUtils.prototype.doesTimeOverlap = function doesTimeOverlap(time, allSpans) {
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Number.MAX_SAFE_INTEGER;
    var toMs = this.toMs;

    var valid = true;
    time = toMs(time);

    // Loop through all spans
    for (var i in allSpans) {
      var spanBegin = toMs(allSpans[i].begin);
      var spanEnd = toMs(allSpans[i].end);

      // Illegal time (falls between existing start/end times)
      if (time >= spanBegin && time < spanEnd) {
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
  };

  StructuralMetadataUtils.prototype.doesTimespanOverlap = function doesTimespanOverlap(beginTime, endTime, allSpans) {
    var toMs = this.toMs;
    // Filter out only spans where new begin time is before an existing begin time

    var filteredSpans = allSpans.filter(function (span) {
      return toMs(beginTime) < toMs(span.begin);
    });
    // Return whether new end time overlaps the next begin time, if there are timespans after the current timespan
    if (filteredSpans.length !== 0) {
      return toMs(endTime) > toMs(filteredSpans[0].begin);
    }
    return false;
  };

  /**
   * Find an item by it's id
   * @param {String} id - string value to match against
   * @param {Array} items - Array of nested structured metadata objects containing headings and time spans
   * @return {Object} - Object found, or null if none
   */


  StructuralMetadataUtils.prototype.findItem = function findItem(id, items) {
    var foundItem = null;
    var fn = function fn(items) {
      for (var _iterator = items, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var item = _ref;

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
  };

  /**
   * @param {String} label - string value to match against
   * @param {Array} items - Array of nested structured metadata objects containing headings and time spans
   * @return {Object} - Object found, or null if none
   */


  StructuralMetadataUtils.prototype.findItemByLabel = function findItemByLabel(label, items) {
    var foundItem = null;
    var findItem = function findItem(items) {
      for (var _iterator2 = items, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var item = _ref2;

        if (item.label === label) {
          foundItem = item;
        }
        if (item.items) {
          findItem(item.items);
        }
      }
    };
    findItem(items);

    return foundItem;
  };

  /**
   * Find the <span>s which come before and after new span
   * @param {Object} newSpan - new span object
   * @param {Array} allSpans - all type <span> objects in current structured metadata
   * @returns {Object} - wrapper <span>s object: { before: spanObject, after: spanObject }
   */


  StructuralMetadataUtils.prototype.findWrapperSpans = function findWrapperSpans(newSpan, allSpans) {
    var toMs = this.toMs;

    var wrapperSpans = {
      before: null,
      after: null
    };
    var spansBefore = allSpans.filter(function (span) {
      return toMs(newSpan.begin) >= toMs(span.end);
    });
    var spansAfter = allSpans.filter(function (span) {
      return toMs(newSpan.end) <= toMs(span.begin);
    });

    wrapperSpans.before = spansBefore.length > 0 ? spansBefore[spansBefore.length - 1] : null;
    wrapperSpans.after = spansAfter.length > 0 ? spansAfter[0] : null;

    return wrapperSpans;
  };

  /**
   * Find the <div>s wrapping the current active timespan (either in editing or in drag-n-drop)
   * @param {Object} parentDiv - parent header of the active timespan
   * @param {Array} allItems - all the items in the structured metadata
   */


  StructuralMetadataUtils.prototype.findWrapperHeaders = function findWrapperHeaders(parentDiv, allItems) {
    var wrapperHeadings = {
      before: null,
      after: null
    };
    var grandParentDiv = this.getParentDiv(parentDiv, allItems);
    var parentIndex = grandParentDiv ? grandParentDiv.items.map(function (item) {
      return item.label;
    }).indexOf(parentDiv.label) : null;

    wrapperHeadings.before = grandParentDiv.items[parentIndex - 1] !== undefined ? grandParentDiv.items[parentIndex - 1] : null;
    wrapperHeadings.after = grandParentDiv.items[parentIndex + 1] !== undefined ? grandParentDiv.items[parentIndex + 1] : null;
    return wrapperHeadings;
  };

  /**
   * Get all items in data structure of type 'div' or 'span'
   * @param {Array} json
   * @returns {Array} - all stripped down objects of type in the entire structured metadata collection
   */


  StructuralMetadataUtils.prototype.getItemsOfType = function getItemsOfType() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
    var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var options = [];

    // Recursive function to search the whole data structure
    var getItems = function getItems(items) {
      for (var _iterator3 = items, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref3;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref3 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref3 = _i3.value;
        }

        var item = _ref3;

        if (item.type === type) {
          var currentObj = _extends({}, item);
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
  };

  StructuralMetadataUtils.prototype.getParentDiv = function getParentDiv(child, allItems) {
    var foundDiv = null;

    var findItem = function findItem(child, items) {
      for (var _iterator4 = items, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
        var _ref4;

        if (_isArray4) {
          if (_i4 >= _iterator4.length) break;
          _ref4 = _iterator4[_i4++];
        } else {
          _i4 = _iterator4.next();
          if (_i4.done) break;
          _ref4 = _i4.value;
        }

        var item = _ref4;

        if (item.items) {
          var childItem = item.items.filter(function (currentChild) {
            return child.id === currentChild.id;
          });
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
  };

  /**
   * Overall logic is to find existing before and after spans for the new object (time flow), and then
   * their parent 'divs' would be valid headings.
   * @param {Object} wrapperSpans Object representing before and after spans of newSpan (if they exist)
   * @param {Array} allItems - All structural metadata items in tree
   * @return {Array} - of valid <div> objects in structural metadata tree
   */


  StructuralMetadataUtils.prototype.getValidHeadings = function getValidHeadings(wrapperSpans, allItems) {
    var validHeadings = [];
    var sortedHeadings = [];

    var findSpanItem = function findSpanItem(targetSpan, items) {
      for (var _iterator5 = items, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray5) {
          if (_i5 >= _iterator5.length) break;
          _ref5 = _iterator5[_i5++];
        } else {
          _i5 = _iterator5.next();
          if (_i5.done) break;
          _ref5 = _i5.value;
        }

        var item = _ref5;

        // Children items exist
        if (item.items) {
          // Check for a target span match
          var targetSpanMatch = item.items.filter(function (childItem) {
            return childItem.id === targetSpan.id;
          });
          // Match found
          if (targetSpanMatch.length > 0) {
            var _items = item.items,
                cloneWOItems = _objectWithoutProperties(item, ['items']);
            // Add parent div to valid array


            validHeadings.push(cloneWOItems);
          }
          // Try deeper in list
          findSpanItem(targetSpan, item.items);
        }
      }
    };

    // Get all headings in the metada structure
    var allHeadings = this.getItemsOfType('div', allItems);

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
    if (!wrapperSpans.before && wrapperSpans.after || wrapperSpans.before && !wrapperSpans.after) {
      var validDivHeading = this.getValidHeadingForEmptySpans(wrapperSpans, allItems);
      validHeadings = validHeadings.concat(validDivHeading);
    }

    // Sort valid headings to comply with the order in the metadata structure
    allHeadings.forEach(function (key) {
      var found = false;
      validHeadings = validHeadings.filter(function (heading) {
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
  };

  /**
   * Find valid headings when either wrapping timespan before or after is null
   * @param {Object} wrapperSpans - spans wrapping the current active timespan
   * @param {Array} allItems - all the items in structured metadata
   */


  StructuralMetadataUtils.prototype.getValidHeadingForEmptySpans = function getValidHeadingForEmptySpans(wrapperSpans, allItems) {
    var _this2 = this;

    var adjacentDiv = null;

    var getWrapperDiv = function getWrapperDiv(currentParent, position) {
      var wrapperParents = _this2.findWrapperHeaders(currentParent, allItems);
      switch (position) {
        case 'before':
          return !wrapperParents.before ? currentParent : wrapperParents.before;
        case 'after':
          return !wrapperParents.after ? currentParent : wrapperParents.after;
        default:
          return currentParent;
      }
    };

    var nestedHeadings = [];
    var getNestedDivs = function getNestedDivs(currentHeader, currentParent) {
      if (currentHeader !== currentParent) {
        var _items2 = currentHeader.items;
        if (_items2) {
          for (var _iterator6 = _items2, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
            var _ref6;

            if (_isArray6) {
              if (_i6 >= _iterator6.length) break;
              _ref6 = _iterator6[_i6++];
            } else {
              _i6 = _iterator6.next();
              if (_i6.done) break;
              _ref6 = _i6.value;
            }

            var item = _ref6;

            if (item.type === 'div') {
              var _items3 = item.items,
                  cloneWOItems = _objectWithoutProperties(item, ['items']);

              nestedHeadings.push(cloneWOItems);
            }
            getNestedDivs(item, currentParent);
          }
        }
      }
    };
    if (!wrapperSpans.after && wrapperSpans.before) {
      var currentParent = this.getParentDiv(wrapperSpans.before, allItems);
      adjacentDiv = getWrapperDiv(currentParent, 'after');
      getNestedDivs(adjacentDiv, currentParent);
    }
    if (!wrapperSpans.before && wrapperSpans.after) {
      var _currentParent = this.getParentDiv(wrapperSpans.after, allItems);
      adjacentDiv = getWrapperDiv(_currentParent, 'before');
      getNestedDivs(adjacentDiv, _currentParent);
    }

    var _adjacentDiv = adjacentDiv,
        items = _adjacentDiv.items,
        woItems = _objectWithoutProperties(_adjacentDiv, ['items']);

    nestedHeadings.push(woItems);
    return nestedHeadings;
  };

  /**
   * Helper function which handles React Dnd's dropping of a dragSource onto a dropTarget
   * It needs to re-arrange the data structure to reflect the new positions
   * @param {Object} dragSource - a minimal object React DnD uses with only the id value
   * @param {Object} dropTarget
   * @param {Array} allItems
   * @returns {Array}
   */


  StructuralMetadataUtils.prototype.handleListItemDrop = function handleListItemDrop(dragSource, dropTarget, allItems) {
    var clonedItems = cloneDeep(allItems);
    var itemToMove = this.findItem(dragSource.id, clonedItems);

    // Slice out previous position of itemToMove
    var itemToMoveParent = this.getParentDiv(itemToMove, clonedItems);
    var itemToMoveItemIndex = itemToMoveParent.items.map(function (item) {
      return item.id;
    }).indexOf(itemToMove.id);
    itemToMoveParent.items.splice(itemToMoveItemIndex, 1);

    // Place itemToMove right after the placeholder array position
    var dropTargetParent = this.getParentDiv(dropTarget, clonedItems);
    var dropTargetItemIndex = dropTargetParent.items.map(function (item) {
      return item.id;
    }).indexOf(dropTarget.id);
    dropTargetParent.items.splice(dropTargetItemIndex, 0, itemToMove);

    // Get rid of all placeholder elements
    return this.removeDropTargets(clonedItems);
  };

  /**
   * Insert a new heading as child of an existing heading
   * @param {Object} obj - new heading object to insert
   * @param {Array} allItems - The entire structured metadata collection
   * @returns {Array} - The updated structured metadata collection, with new object inserted
   */


  StructuralMetadataUtils.prototype.insertNewHeader = function insertNewHeader(obj, allItems) {
    var clonedItems = cloneDeep(allItems);
    var foundDiv = this.findItem(obj.headingChildOf, clonedItems) || clonedItems[0];

    // If children exist, add to list
    if (foundDiv) {
      foundDiv.items.unshift({
        id: uuidv1(),
        type: 'div',
        label: obj.headingTitle,
        items: []
      });
    }

    return clonedItems;
  };

  /**
   * Insert a new timespan as child of an existing heading
   * @param {Object} obj - object of form values submitted
   * @param {Array} allItems - The entire structured metadata collection
   * @returns ({Object}, {Array}) - (New span, The updated structured metadata collection, with new object inserted)
   */


  StructuralMetadataUtils.prototype.insertNewTimespan = function insertNewTimespan(obj, allItems) {
    var clonedItems = cloneDeep(allItems);
    var foundDiv = this.findItem(obj.timespanChildOf, clonedItems);
    var spanObj = this.createSpanObject(obj);
    var insertIndex = 0;

    // If children exist, add to list
    if (foundDiv) {
      var childSpans = foundDiv.items.filter(function (item) {
        return item.type === 'span';
      });

      // Get before and after sibling spans
      var wrapperSpans = this.findWrapperSpans(spanObj, childSpans);

      if (wrapperSpans.before) {
        insertIndex = findIndex(foundDiv.items, { id: wrapperSpans.before.id }) + 1;
      }
      // Insert new span at appropriate index
      foundDiv.items.splice(insertIndex, 0, spanObj);
    }

    return { newSpan: spanObj, updatedData: clonedItems };
  };

  /**
   * Recursive function to clean out any 'active' drag item property in the data structure
   * @param {Array} allItems
   * @returns {Array}
   */


  StructuralMetadataUtils.prototype.removeActiveDragSources = function removeActiveDragSources(allItems) {
    var removeActive = function removeActive(parent) {
      if (!parent.items) {
        if (parent.active) {
          parent.active = false;
        }
        return parent;
      }
      parent.items = parent.items.map(function (child) {
        return removeActive(child);
      });

      return parent;
    };
    var cleanItems = removeActive(allItems[0]);

    return [cleanItems];
  };

  /**
   * Recursive function to remove all temporary Drop Target objects from the structured metadata items
   * @param {Array} allItems
   */


  StructuralMetadataUtils.prototype.removeDropTargets = function removeDropTargets(allItems) {
    var clonedItems = cloneDeep(allItems);
    var removeFromTree = function removeFromTree(parent, childTypeToRemove) {
      if (!parent.items) {
        return parent;
      }

      parent.items = parent.items.filter(function (child) {
        return child.type !== childTypeToRemove;
      }).map(function (child) {
        return removeFromTree(child, childTypeToRemove);
      });

      return parent;
    };
    var cleanItems = removeFromTree(clonedItems[0], 'optional');

    return [cleanItems];
  };

  /**
   * Moment.js helper millisecond converter to make calculations consistent
   * @param {String} strTime form input value
   */


  StructuralMetadataUtils.prototype.toMs = function toMs(strTime) {
    return moment.duration(strTime).asMilliseconds();
  };

  /**
   * Convert seconds to string format hh:mm:ss
   * @param {Number} secTime - time in seconds
   */


  StructuralMetadataUtils.prototype.toHHmmss = function toHHmmss(secTime) {
    var sec_num = parseInt('' + secTime * 100) / 100;
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60);
    var seconds = Math.round(sec_num % 60 * 100) / 100;

    var hourStr = hours < 10 ? '0' + hours : '' + hours;
    var minStr = minutes < 10 ? '0' + minutes : '' + minutes;
    var secStr = seconds.toFixed(2);
    secStr = seconds < 10 ? '0' + secStr : '' + secStr;

    return hourStr + ':' + minStr + ':' + secStr;
  };

  /**
   * Update an existing heading object
   * @param {Object} heading - updated form object
   * @param {Array} allItems - the data structure
   */


  StructuralMetadataUtils.prototype.updateHeading = function updateHeading(heading, allItems) {
    var clonedItems = cloneDeep(allItems);
    var item = this.findItem(heading.id, clonedItems);
    item.label = heading.headingTitle;

    // TODO: Figure out how to handle "Child Of" when this becomes inline.

    return clonedItems;
  };

  /**
   * Does 'before' time start prior to 'end' time?
   * @param {String} begin form intput value
   * @param {String} end form input value
   * @return {Boolean}
   */


  StructuralMetadataUtils.prototype.validateBeforeEndTimeOrder = function validateBeforeEndTimeOrder(begin, end) {
    if (!begin || !end) {
      return true;
    }
    if (this.toMs(begin) >= this.toMs(end)) {
      return false;
    }
    return true;
  };

  StructuralMetadataUtils.prototype.validTimeFormat = function validTimeFormat(value) {
    return value && value.split(':').length === 3;
  };

  return StructuralMetadataUtils;
}();

export { StructuralMetadataUtils as default };