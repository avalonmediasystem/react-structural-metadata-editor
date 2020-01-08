"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _v = _interopRequireDefault(require("uuid/v1"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      addSpanBefore: function addSpanBefore(parentDiv, allItems, wrapperSpanBefore) {
        var beforeParent = _this.getParentDiv(wrapperSpanBefore, allItems);

        var beforeSiblings = beforeParent.items;
        var beforeIndex = beforeSiblings.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpanBefore.id); // Before the insert, check that the dropTarget index doesn't already exist

        if (beforeSiblings[beforeIndex + 1] && beforeSiblings[beforeIndex + 1].type !== 'optional' && parentDiv.id !== beforeParent.id) {
          beforeSiblings.splice(beforeIndex + 1, 0, _this.createDropZoneObject());
        }
      },
      addSpanAfter: function addSpanAfter(parentDiv, allItems, wrapperSpanAfter) {
        var afterParent = _this.getParentDiv(wrapperSpanAfter, allItems);

        var afterSiblings = afterParent.items;
        var afterIndex = afterSiblings.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpanAfter.id);

        if (afterSiblings[afterIndex - 1] && afterSiblings[afterIndex - 1].type !== 'optional' && parentDiv.id !== afterParent.id) {
          afterSiblings.splice(afterIndex, 0, _this.createDropZoneObject());
        }

        if (afterIndex === 0 && parentDiv.id !== afterParent.id) {
          afterSiblings.splice(afterIndex, 0, _this.createDropZoneObject());
        }
      },
      stuckInMiddle: function stuckInMiddle(spanIndex, siblings, parentDiv) {
        return spanIndex !== 0 && spanIndex !== siblings.length - 1 && parentDiv.items[spanIndex - 1].type === 'span' && parentDiv.items[spanIndex + 1].type === 'span';
      },
      addSpanToEmptyHeader: function addSpanToEmptyHeader(parentDiv, allItems) {
        var wrapperParents = _this.findWrapperHeaders(parentDiv, allItems);

        if (wrapperParents.after) {
          if (wrapperParents.after.items) {
            wrapperParents.after.items.splice(0, 0, _this.createDropZoneObject());
          } else {
            wrapperParents.after.items = [_this.createDropZoneObject()];
          }
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
     * Format the time of the timespans in the structured metadata fetched from the server,
     * so that they can be used in the validation logic and Peaks instance
     * @param {Array} allItems - array of all the items in structured metadata
     * @param {Float} duration - end time of the media file in Milliseconds
     */

  }, {
    key: "buildSMUI",
    value: function buildSMUI(allItems, duration) {
      var _this2 = this;

      // Convert file duration to seconds
      var durationInSeconds = Math.round(duration / 10) / 100; // Convert time to HH:mm:ss.ms format to use in validation logic

      var convertToSeconds = function convertToSeconds(time) {
        var timeSeconds = _this2.toMs(time) / 1000; // When time property is missing

        if (isNaN(timeSeconds)) {
          return 0;
        } else {
          return timeSeconds;
        }
      };

      var decodeHTML = function decodeHTML(lableText) {
        return lableText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      }; // Recursive function to traverse whole data structure


      var formatItems = function formatItems(items) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;
            item.label = decodeHTML(item.label);

            if (item.type === 'span') {
              var begin = item.begin,
                  end = item.end;
              var beginTime = convertToSeconds(begin);
              var endTime = convertToSeconds(end);
              item.begin = _this2.toHHmmss(beginTime);

              if (beginTime > endTime) {
                item.end = _this2.toHHmmss(durationInSeconds);
              } else if (endTime > durationInSeconds) {
                item.end = _this2.toHHmmss(durationInSeconds);
              } else {
                item.end = _this2.toHHmmss(endTime);
              }
            }

            if (item.items) {
              formatItems(item.items);
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

      formatItems(allItems);
      return allItems;
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

        var grandParentDiv = this.getParentDiv(parentDiv, clonedItems); // A first/last child of siblings, or an only child

        if (grandParentDiv !== null) {
          var siblingTimespans = this.getItemsOfType('span', siblings);
          var timespanIndex = siblingTimespans.map(function (sibling) {
            return sibling.id;
          }).indexOf(dragSource.id);
          var parentIndex = grandParentDiv.items.map(function (item) {
            return item.id;
          }).indexOf(parentDiv.id);

          if (timespanIndex === 0) {
            grandParentDiv.items.splice(parentIndex, 0, this.createDropZoneObject());
          }

          if (timespanIndex === siblingTimespans.length - 1) {
            var newPI = grandParentDiv.items.map(function (item) {
              return item.id;
            }).indexOf(parentDiv.id);
            grandParentDiv.items.splice(newPI + 1, 0, this.createDropZoneObject());
          }
        } // Insert after the "before" wrapper span (if one exists)


        if (wrapperSpans.before) {
          this.dndHelper.addSpanBefore(parentDiv, clonedItems, wrapperSpans.before);
        } // Insert relative to the span after the active span


        if (wrapperSpans.after) {
          this.dndHelper.addSpanAfter(parentDiv, clonedItems, wrapperSpans.after);
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
     * @param {Float} duration - file length in seconds
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

        if (time > spanBegin && time < spanEnd) {
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
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            if (item.id === id) {
              foundItem = item;
            }

            if (item.items && item.items.length > 0) {
              fn(item.items);
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

      fn(items);
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
        var grandParentItems = grandParentDiv.items.filter(function (item) {
          return item.type !== 'optional';
        });
        var parentIndex = grandParentItems.map(function (item) {
          return item.label;
        }).indexOf(parentDiv.label);
        wrapperHeadings.before = grandParentItems[parentIndex - 1] !== undefined ? grandParentItems[parentIndex - 1] : null;
        wrapperHeadings.after = grandParentItems[parentIndex + 1] !== undefined ? grandParentItems[parentIndex + 1] : null;
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
              var currentObj = _objectSpread({}, item);

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
     * @param {Object} newSpan - New timespan created with values supplied by the user
     * @param {Object} wrapperSpans Object representing before and after spans of newSpan (if they exist)
     * @param {Array} allItems - All structural metadata items in tree
     * @return {Array} - of valid <div> objects in structural metadata tree
     */

  }, {
    key: "getValidHeadings",
    value: function getValidHeadings(newSpan, wrapperSpans, allItems) {
      var _this3 = this;

      var allValidHeadings = [];
      var sortedHeadings = [];
      var uniqueHeadings = []; // New timespan falls between timespans in the same parent

      var stuckInMiddle = false;
      var toMs = this.toMs;
      var before = wrapperSpans.before,
          after = wrapperSpans.after;
      var allHeadings = this.getItemsOfType('root', allItems).concat(this.getItemsOfType('div', allItems)); // Explore possible headings traversing outwards from a suggested heading

      var exploreOutwards = function exploreOutwards(heading) {
        var invalid = false;

        var parentHeading = _this3.getParentDiv(heading, allItems);

        var newBegin = newSpan.begin,
            newEnd = newSpan.end;

        if (parentHeading && !stuckInMiddle) {
          var headingIndex = parentHeading.items.map(function (item) {
            return item.id;
          }).indexOf(heading.id);
          var siblings = parentHeading.items;
          siblings.forEach(function (sibling, i) {
            if (sibling.type === 'span') {
              var begin = sibling.begin,
                  end = sibling.end;

              if (toMs(newEnd) < toMs(begin) && i < headingIndex) {
                invalid = true;
              }

              if (toMs(newBegin) > toMs(end) && i > headingIndex) {
                invalid = true;
              }
            }
          });

          if (!invalid) {
            allValidHeadings.push(parentHeading);
            exploreOutwards(parentHeading);
          } else {
            return;
          }
        }
      }; // Find relevant headings traversing into suggested headings


      var exploreInwards = function exploreInwards(wrapperParent, wrapperSpan, isBefore) {
        var spanIndex = wrapperParent.items.map(function (item) {
          return item.id;
        }).indexOf(wrapperSpan.id);
        var divsAfter = [],
            divsBefore = [];

        if (isBefore) {
          divsAfter = wrapperParent.items.filter(function (item, i) {
            return i > spanIndex;
          });
        } else {
          divsBefore = wrapperParent.items.filter(function (item, i) {
            return i < spanIndex;
          });
        }

        var allDivs = _this3.getItemsOfType('div', divsAfter.concat(divsBefore));

        return allDivs;
      };

      if (!before && !after) {
        allValidHeadings = allHeadings;
      }

      if (before) {
        var parentBefore = this.getParentDiv(before, allItems);
        allValidHeadings.push(parentBefore);

        if (!after) {
          var headings = exploreInwards(parentBefore, before, true);
          allValidHeadings = allValidHeadings.concat(headings);
        }
      }

      if (after) {
        var parentAfter = this.getParentDiv(after, allItems);
        allValidHeadings.push(parentAfter);

        if (!before) {
          var _headings = exploreInwards(parentAfter, after, false);

          allValidHeadings = allValidHeadings.concat(_headings);
        }
      }

      if (before && after) {
        var _parentBefore = this.getParentDiv(before, allItems);

        var _parentAfter = this.getParentDiv(after, allItems);

        if (_parentBefore.id === _parentAfter.id) {
          stuckInMiddle = true;
          allValidHeadings.push(_parentBefore);
        }
      }

      allValidHeadings.map(function (heading) {
        return exploreOutwards(heading);
      }); // Sort valid headings to comply with the order in the metadata structure

      allHeadings.forEach(function (key) {
        var found = false;
        allValidHeadings.filter(function (heading) {
          if (!found && heading.label === key.label) {
            var items = heading.items,
                cloneWOItems = (0, _objectWithoutProperties2["default"])(heading, ["items"]);
            sortedHeadings.push(cloneWOItems);
            found = true;
            return false;
          } else {
            return true;
          }
        });
      }); // Filter the duplicated headings

      sortedHeadings.map(function (heading) {
        var indexIn = uniqueHeadings.map(function (h) {
          return h.id;
        }).indexOf(heading.id);

        if (indexIn === -1) {
          uniqueHeadings.push(heading);
        }
      });
      return uniqueHeadings;
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
      var _this4 = this;

      var clonedItems = (0, _lodash.cloneDeep)(allItems);
      var foundDiv = this.findItem(obj.timespanChildOf, clonedItems); // Timespan related to values

      var spanObj = this.createSpanObject(obj); // Index the new timespan to be inserted

      var insertIndex = 0;

      var getParentOfSpan = function getParentOfSpan(item) {
        var inFoundDiv = false;
        var closestSibling = null;
        var siblings = foundDiv.items;
        siblings.map(function (sibling) {
          if (sibling.id === item.id) {
            inFoundDiv = true;
            closestSibling = sibling;
          }
        });

        if (!inFoundDiv) {
          var parentItem = _this4.getParentDiv(item, allItems);

          if (parentItem) {
            closestSibling = getParentOfSpan(parentItem);
          }
        }

        return closestSibling;
      };

      if (foundDiv) {
        var allSpans = this.getItemsOfType('span', allItems);

        var _this$findWrapperSpan = this.findWrapperSpans(spanObj, allSpans),
            before = _this$findWrapperSpan.before,
            after = _this$findWrapperSpan.after;

        if (before) {
          var siblingBefore = getParentOfSpan(before);

          if (siblingBefore) {
            insertIndex = foundDiv.items.map(function (item) {
              return item.id;
            }).indexOf(siblingBefore.id) + 1;
          }
        } else if (after) {
          var siblingAfter = getParentOfSpan(after);

          if (siblingAfter) {
            var siblingAfterIndex = foundDiv.items.map(function (item) {
              return item.id;
            }).indexOf(siblingAfter.id);
            insertIndex = siblingAfterIndex === 0 ? 0 : siblingAfterIndex - 1;
          }
        } else {
          insertIndex = foundDiv.items.length + 1;
        }
      } // Insert new span at appropriate index


      foundDiv.items.splice(insertIndex, 0, spanObj);
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
    /**
     * This function adds a unique, front-end only id, to every object in the data structure
     * @param {Array} structureJS
     * @returns {Array}
     */

  }, {
    key: "addUUIds",
    value: function addUUIds(structureJS) {
      var structureWithIds = (0, _lodash.cloneDeep)(structureJS); // Recursively loop through data structure

      var fn = function fn(items) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = items[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var item = _step5.value;
            // Create and add an id
            item.id = (0, _v["default"])(); // Send child items back into the function

            if (item.items && item.items.length > 0) {
              fn(item.items);
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
      };

      fn(structureWithIds);
      return structureWithIds;
    }
    /**
     * Mark the top element as 'root' to help when creating list items
     * The top elemetn should not have a delete icon
     * @param {Array} smData - array of structured metadata
     */

  }, {
    key: "markRootElement",
    value: function markRootElement(smData) {
      if (smData.length > 0) {
        smData[0].type = 'root';
      }
    }
    /**
     * Convert hh:mm:ss to milliseconds to make calculations consistent
     * @param {String} strTime form input value
     */

  }, {
    key: "toMs",
    value: function toMs(strTime) {
      var _strTime$split$revers = strTime.split(':').reverse(),
          _strTime$split$revers2 = (0, _slicedToArray2["default"])(_strTime$split$revers, 3),
          seconds = _strTime$split$revers2[0],
          minutes = _strTime$split$revers2[1],
          hours = _strTime$split$revers2[2];

      var hoursInS = hours ? parseInt(hours) * 3600 : 0;
      var minutesInS = minutes ? parseInt(minutes) * 60 : 0;
      var secondsNum = seconds === '' ? 0.0 : parseFloat(seconds);
      var timeSeconds = hoursInS + minutesInS + secondsNum;
      return timeSeconds * 1000;
    }
    /**
     * Convert seconds to string format hh:mm:ss.ms
     * @param {Number} secTime - time in seconds
     */

  }, {
    key: "toHHmmss",
    value: function toHHmmss(secTime) {
      var sec_num = this.roundOff(secTime);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor(sec_num % 3600 / 60);
      var seconds = sec_num - minutes * 60 - hours * 3600;
      var hourStr = hours < 10 ? "0".concat(hours) : "".concat(hours);
      var minStr = minutes < 10 ? "0".concat(minutes) : "".concat(minutes);
      var secStr = seconds.toFixed(3);
      secStr = seconds < 10 ? "0".concat(secStr) : "".concat(secStr);
      return "".concat(hourStr, ":").concat(minStr, ":").concat(secStr);
    }
  }, {
    key: "roundOff",
    value: function roundOff(value) {
      var valueString = '';

      var _value$toString$split = value.toString().split('.'),
          _value$toString$split2 = (0, _slicedToArray2["default"])(_value$toString$split, 2),
          intVal = _value$toString$split2[0],
          decVal = _value$toString$split2[1];

      if (!decVal) {
        valueString = intVal;
      } else {
        valueString = intVal + '.' + decVal.substring(0, 3);
      }

      return parseFloat(valueString);
    }
    /**
     * Remove a given key in the each object in the structure
     * @param {Array} allitems - smData
     * @param {String} key - object key to be removed in the structure
     */

  }, {
    key: "filterObjectKey",
    value: function filterObjectKey(allitems, key) {
      var clonedItems = (0, _lodash.cloneDeep)(allitems);

      var removeKey = function removeKey(items) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = items[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var item = _step6.value;

            if (key in item) {
              delete item.active;
            }

            if (item.items && item.items.length > 0) {
              removeKey(item.items);
            }
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
      };

      removeKey(clonedItems, key);
      return clonedItems;
    }
  }]);
  return StructuralMetadataUtils;
}();

exports["default"] = StructuralMetadataUtils;