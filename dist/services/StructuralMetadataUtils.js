"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _moment = _interopRequireDefault(require("moment"));

var _v = _interopRequireDefault(require("uuid/v1"));

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
var StructuralMetadataUtils =
/*#__PURE__*/
function () {
  function StructuralMetadataUtils() {
    var _this = this;

    (0, _classCallCheck2["default"])(this, StructuralMetadataUtils);
    (0, _defineProperty2["default"])(this, "dndHelper", {
      addSpanBefore: function addSpanBefore(allItems, wrapperSpanBefore) {
        var beforeParent = _this.getParentDiv(wrapperSpanBefore, allItems);

        var beforeIndex = beforeParent.items.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpanBefore.id); // Before the insert, check that the dropTarget index doesn't already exist

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
    });
  }

  (0, _createClass2["default"])(StructuralMetadataUtils, [{
    key: "createDropZoneObject",

    /**
     * Helper function to create a dropZone object for drag and drop
     * @returns {Object}
     */
    value: function createDropZoneObject() {
      return {
        type: 'optional',
        id: (0, _v["default"])()
      };
    }
    /**
     * Helper function which creates an object with the shape our data structure requires
     * @param {Object} obj
     * @return {Object}
     */

  }, {
    key: "createSpanObject",
    value: function createSpanObject(obj) {
      return {
        id: (0, _v["default"])(),
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

  }, {
    key: "deleteListItem",
    value: function deleteListItem(id, allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var item = this.findItem(id, allItems);
      var parentDiv = this.getParentDiv(item, clonedItems);
      var indexToDelete = (0, _lodash.findIndex)(parentDiv.items, {
        id: item.id
      });
      parentDiv.items.splice(indexToDelete, 1);
      return clonedItems;
    }
    /**
     * Update the data structure to represent all possible dropTargets for the provided dragSource
     * @param {Object} dragSource
     * @param {Object} allItems
     * @returns {Array} - new computed items
     */

  }, {
    key: "determineDropTargets",
    value: function determineDropTargets(dragSource, allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);

      if (dragSource.type === 'span') {
        var wrapperSpans = this.findWrapperSpans(dragSource, this.getItemsOfType('span', clonedItems));
        var parentDiv = this.getParentDiv(dragSource, clonedItems);
        var siblings = parentDiv ? parentDiv.items : [];
        var spanIndex = siblings.map(function (sibling) {
          return sibling.id;
        }).indexOf(dragSource.id);
        var stuckInMiddle = this.dndHelper.stuckInMiddle(spanIndex, siblings, parentDiv); // If span falls in the middle of other spans, it can't be moved

        if (stuckInMiddle) {
          return clonedItems;
        } // Sibling before is a div?


        if (spanIndex !== 0 && siblings[spanIndex - 1].type === 'div') {
          var sibling = siblings[spanIndex - 1];

          if (sibling.items) {
            sibling.items.push(this.createDropZoneObject());
          } else {
            sibling.items = [this.createDropZoneObject()];
          }
        } // Sibling after is a div?


        if (spanIndex !== siblings.length - 1 && siblings[spanIndex + 1].type === 'div') {
          var _sibling = siblings[spanIndex + 1];

          if (_sibling.items) {
            _sibling.items.unshift(this.createDropZoneObject());
          } else {
            _sibling.items = [this.createDropZoneObject()];
          }
        }

        var grandParentDiv = this.getParentDiv(parentDiv, clonedItems);
        var parentIndex = grandParentDiv != null ? grandParentDiv.items.map(function (item) {
          return item.id;
        }).indexOf(parentDiv.id) : null; // A first child of siblings, or an only child

        if (spanIndex === 0) {
          // Can't move up
          if (parentIndex === null) {
            return clonedItems;
          }

          if (grandParentDiv) {
            // Insert directly before the parent div
            grandParentDiv.items.splice(parentIndex, 0, this.createDropZoneObject()); // Insert after the "before" wrapper span (if one exists)

            if (wrapperSpans.before) {
              this.dndHelper.addSpanBefore(clonedItems, wrapperSpans.before);
            }
          }
        } // Insert relative to the span after the active span


        if (wrapperSpans.after) {
          this.dndHelper.addSpanAfter(clonedItems, wrapperSpans.after);
        } // Insert when there is no wrapper span after active span, but empty headers


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

  }, {
    key: "doesTimeOverlap",

    /**
     * Determine whether a time overlaps (or falls between), an existing timespan's range
     * @param {String} time - form input value
     * @param {*} allSpans - all timespans in the data structure
     * @return {Boolean}
     */
    value: function doesTimeOverlap(time, allSpans) {
      var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Number.MAX_SAFE_INTEGER;
      var toMs = this.toMs;
      var valid = true;
      time = toMs(time); // Loop through all spans

      for (var i in allSpans) {
        var spanBegin = toMs(allSpans[i].begin);
        var spanEnd = toMs(allSpans[i].end); // Illegal time (falls between existing start/end times)

        if (time >= spanBegin && time <= spanEnd) {
          valid = false;
          break;
        } // Time exceeds the end time of the media file


        if (time / 1000 > duration) {
          valid = false;
          break;
        }
      }

      return valid;
    }
  }, {
    key: "doesTimespanOverlap",
    value: function doesTimespanOverlap(beginTime, endTime, allSpans) {
      var toMs = this.toMs; // Filter out only spans where new begin time is before an existing begin time

      var filteredSpans = allSpans.filter(function (span) {
        return toMs(beginTime) < toMs(span.begin);
      }); // Return whether new end time overlaps the next begin time, if there are timespans after the current timespan

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

  }, {
    key: "findItem",
    value: function findItem(id, items) {
      var foundItem = null;

      var fn = function fn(items) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item.id === id) {
              foundItem = item;
            }

            if (item.items && item.items.length > 0) {
              fn(item.items);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      };

      fn(items);
      return foundItem;
    }
    /**
     * @param {String} label - string value to match against
     * @param {Array} items - Array of nested structured metadata objects containing headings and time spans
     * @return {Object} - Object found, or null if none
     */

  }, {
    key: "findItemByLabel",
    value: function findItemByLabel(label, items) {
      var foundItem = null;

      var findItem = function findItem(items) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            if (item.label === label) {
              foundItem = item;
            }

            if (item.items) {
              findItem(item.items);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      };

      findItem(items);
      return foundItem;
    }
    /**
     * Find the <span>s which come before and after new span
     * @param {Object} newSpan - new span object
     * @param {Array} allSpans - all type <span> objects in current structured metadata
     * @returns {Object} - wrapper <span>s object: { before: spanObject, after: spanObject }
     */

  }, {
    key: "findWrapperSpans",
    value: function findWrapperSpans(newSpan, allSpans) {
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
    }
    /**
     * Find the <div>s wrapping the current active timespan (either in editing or in drag-n-drop)
     * @param {Object} parentDiv - parent header of the active timespan
     * @param {Array} allItems - all the items in the structured metadata
     */

  }, {
    key: "findWrapperHeaders",
    value: function findWrapperHeaders(parentDiv, allItems) {
      var wrapperHeadings = {
        before: null,
        after: null
      };
      var grandParentDiv = this.getParentDiv(parentDiv, allItems);

      if (grandParentDiv != null) {
        var parentIndex = grandParentDiv.items.map(function (item) {
          return item.label;
        }).indexOf(parentDiv.label);
        wrapperHeadings.before = grandParentDiv.items[parentIndex - 1] !== undefined ? grandParentDiv.items[parentIndex - 1] : null;
        wrapperHeadings.after = grandParentDiv.items[parentIndex + 1] !== undefined ? grandParentDiv.items[parentIndex + 1] : null;
      }

      return wrapperHeadings;
    }
    /**
     * Get all items in data structure of type 'div' or 'span'
     * @param {Array} json
     * @returns {Array} - all stripped down objects of type in the entire structured metadata collection
     */

  }, {
    key: "getItemsOfType",
    value: function getItemsOfType() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
      var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var options = []; // Recursive function to search the whole data structure

      var getItems = function getItems(items) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            if (item.type === type) {
              var currentObj = (0, _objectSpread2["default"])({}, item);
              delete currentObj.items;
              options.push(currentObj);
            }

            if (item.items) {
              getItems(item.items);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      };

      getItems(items);
      return options;
    }
  }, {
    key: "getParentDiv",
    value: function getParentDiv(child, allItems) {
      var foundDiv = null;

      var findItem = function findItem(child, items) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = items[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var item = _step4.value;

            if (item.items) {
              var childItem = item.items.filter(function (currentChild) {
                return child.id === currentChild.id;
              }); // Found it

              if (childItem.length > 0) {
                foundDiv = item;
                break;
              }

              findItem(child, item.items);
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
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

  }, {
    key: "getValidHeadings",
    value: function getValidHeadings(wrapperSpans, allItems) {
      var validHeadings = [];
      var sortedHeadings = [];

      var findSpanItem = function findSpanItem(targetSpan, items) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = items[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var item = _step5.value;

            // Children items exist
            if (item.items) {
              // Check for a target span match
              var targetSpanMatch = item.items.filter(function (childItem) {
                return childItem.id === targetSpan.id;
              }); // Match found

              if (targetSpanMatch.length > 0) {
                var _items = item.items,
                    cloneWOItems = (0, _objectWithoutProperties2["default"])(item, ["items"]); // Add parent div to valid array

                validHeadings.push(cloneWOItems);
              } // Try deeper in list


              findSpanItem(targetSpan, item.items);
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
              _iterator5["return"]();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }; // Get all headings in the metada structure


      var allHeadings = this.getItemsOfType('div', allItems).concat(this.getItemsOfType('root', allItems)); // There are currently no spans, ALL headings are valid

      if (!wrapperSpans.before && !wrapperSpans.after) {
        validHeadings = allHeadings;
      }

      if (wrapperSpans.before) {
        findSpanItem(wrapperSpans.before, allItems);
      }

      if (wrapperSpans.after) {
        findSpanItem(wrapperSpans.after, allItems);
      } // Get valid headings when either of wrapping timespan is null


      if (!wrapperSpans.before && wrapperSpans.after || wrapperSpans.before && !wrapperSpans.after) {
        var validDivHeading = this.getValidHeadingForEmptySpans(wrapperSpans, allItems);
        validHeadings = validHeadings.concat(validDivHeading);
      } // Sort valid headings to comply with the order in the metadata structure


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
    }
    /**
     * Find valid headings when either wrapping timespan before or after is null
     * @param {Object} wrapperSpans - spans wrapping the current active timespan
     * @param {Array} allItems - all the items in structured metadata
     */

  }, {
    key: "getValidHeadingForEmptySpans",
    value: function getValidHeadingForEmptySpans(wrapperSpans, allItems) {
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
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = _items2[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var item = _step6.value;

                if (item.type === 'div') {
                  var _items3 = item.items,
                      cloneWOItems = (0, _objectWithoutProperties2["default"])(item, ["items"]);
                  nestedHeadings.push(cloneWOItems);
                }

                getNestedDivs(item, currentParent);
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                  _iterator6["return"]();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
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
          woItems = (0, _objectWithoutProperties2["default"])(_adjacentDiv, ["items"]);
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

  }, {
    key: "handleListItemDrop",
    value: function handleListItemDrop(dragSource, dropTarget, allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var itemToMove = this.findItem(dragSource.id, clonedItems); // Slice out previous position of itemToMove

      var itemToMoveParent = this.getParentDiv(itemToMove, clonedItems);
      var itemToMoveItemIndex = itemToMoveParent.items.map(function (item) {
        return item.id;
      }).indexOf(itemToMove.id);
      itemToMoveParent.items.splice(itemToMoveItemIndex, 1); // Place itemToMove right after the placeholder array position

      var dropTargetParent = this.getParentDiv(dropTarget, clonedItems);
      var dropTargetItemIndex = dropTargetParent.items.map(function (item) {
        return item.id;
      }).indexOf(dropTarget.id);
      dropTargetParent.items.splice(dropTargetItemIndex, 0, itemToMove); // Get rid of all placeholder elements

      return this.removeDropTargets(clonedItems);
    }
    /**
     * Insert a new heading as child of an existing heading
     * @param {Object} obj - new heading object to insert
     * @param {Array} allItems - The entire structured metadata collection
     * @returns {Array} - The updated structured metadata collection, with new object inserted
     */

  }, {
    key: "insertNewHeader",
    value: function insertNewHeader(obj, allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var foundDiv = this.findItem(obj.headingChildOf, clonedItems) || clonedItems[0]; // If children exist, add to list

      if (foundDiv) {
        foundDiv.items.push({
          id: (0, _v["default"])(),
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

  }, {
    key: "insertNewTimespan",
    value: function insertNewTimespan(obj, allItems) {
      var _this3 = this;

      var toMs = this.toMs;
      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var foundDiv = this.findItem(obj.timespanChildOf, clonedItems);
      var spanObj = this.createSpanObject(obj);
      var insertIndex = 0;
      var nestedTimespans = [];

      var findNestedTimespans = function findNestedTimespans(header) {
        var items = header.items;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = items[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var item = _step7.value;

            if (item.type === 'span' && toMs(spanObj.begin) > toMs(item.end)) {
              nestedTimespans.push(item);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }; // If children exist, add to list


      if (foundDiv) {
        var childSpans = foundDiv.items.filter(function (item) {
          return item.type === 'span';
        });
        var nestedHeaders = foundDiv.items.filter(function (item) {
          return item.type === 'div';
        });
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = nestedHeaders[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var header = _step8.value;
            findNestedTimespans(header);
          } // Add nested timespans from child items and sort by begin time

        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
              _iterator8["return"]();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        childSpans = childSpans.concat(nestedTimespans).sort(function (x, y) {
          return _this3.toMs(x['begin']) - _this3.toMs(y['begin']);
        }); // Get before and after sibling spans

        var wrapperSpans = this.findWrapperSpans(spanObj, childSpans);

        if (wrapperSpans.before) {
          var wrapperSpanParent = this.getParentDiv(wrapperSpans.before, allItems);

          if (wrapperSpanParent.id !== foundDiv.id) {
            insertIndex = (0, _lodash.findIndex)(foundDiv.items, {
              id: wrapperSpanParent.id
            }) + 1;
          } else {
            insertIndex = (0, _lodash.findIndex)(foundDiv.items, {
              id: wrapperSpans.before.id
            }) + 1;
          }
        } // Insert new span at appropriate index


        foundDiv.items.splice(insertIndex, 0, spanObj);
      }

      return {
        newSpan: spanObj,
        updatedData: clonedItems
      };
    }
    /**
     * Recursive function to clean out any 'active' drag item property in the data structure
     * @param {Array} allItems
     * @returns {Array}
     */

  }, {
    key: "removeActiveDragSources",
    value: function removeActiveDragSources(allItems) {
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
    }
    /**
     * Recursive function to remove all temporary Drop Target objects from the structured metadata items
     * @param {Array} allItems
     */

  }, {
    key: "removeDropTargets",
    value: function removeDropTargets(allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);

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
    }
    /**
     * Moment.js helper millisecond converter to make calculations consistent
     * @param {String} strTime form input value
     */

  }, {
    key: "toMs",
    value: function toMs(strTime) {
      return _moment["default"].duration(strTime).asMilliseconds();
    }
    /**
     * Update an existing heading object
     * @param {Object} heading - updated form object
     * @param {Array} allItems - the data structure
     */

  }, {
    key: "updateHeading",
    value: function updateHeading(heading, allItems) {
      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var item = this.findItem(heading.id, clonedItems);
      item.label = heading.headingTitle; // TODO: Figure out how to handle "Child Of" when this becomes inline.

      return clonedItems;
    }
    /**
     * Does 'before' time start prior to 'end' time?
     * @param {String} begin form intput value
     * @param {String} end form input value
     * @return {Boolean}
     */

  }, {
    key: "validateBeforeEndTimeOrder",
    value: function validateBeforeEndTimeOrder(begin, end) {
      if (!begin || !end) {
        return true;
      }

      if (this.toMs(begin) >= this.toMs(end)) {
        return false;
      }

      return true;
    }
  }, {
    key: "validTimeFormat",
    value: function validTimeFormat(value) {
      return value && value.split(':').length === 3;
    }
  }]);
  return StructuralMetadataUtils;
}();

exports["default"] = StructuralMetadataUtils;