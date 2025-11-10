"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLabelValue = getLabelValue;
exports.getMediaFragment = getMediaFragment;
exports.getMediaInfo = getMediaInfo;
exports.getWaveformInfo = getWaveformInfo;
exports.parseStructureToJSON = parseStructureToJSON;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _manifesto = require("manifesto.js");
var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));
var _utils = require("./utils");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var smUtils = new _StructuralMetadataUtils["default"]();

/**
 * Fetch media information relavant to the current canvas
 * from manifest
 * @param {Object} manifest IIIF manifest from given URL
 * @param {Number} canvasIndex index of the current canvas
 * @returns { String, Number } { media src, media duration }
 */
function getMediaInfo(manifest) {
  var canvasIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var mediaInfo = {};
  try {
    var _readAnnotations = (0, _utils.readAnnotations)({
        manifest: manifest,
        canvasIndex: canvasIndex,
        key: "items",
        motivation: "painting"
      }),
      resources = _readAnnotations.resources,
      error = _readAnnotations.error,
      duration = _readAnnotations.duration;
    if (resources.length === 0) {
      console.log('iiif-parser -> getMediaInfo() -> error', error);
      return {
        src: undefined,
        duration: 0,
        isStream: false,
        isVideo: false,
        error: error
      };
    } else {
      var _filtersrc = filtersrc(resources),
        src = _filtersrc.src,
        type = _filtersrc.type;
      mediaInfo.isStream = (0, _utils.getMimetype)(src) === 'application/x-mpegURL' ? true : false;
      mediaInfo.src = src;
      mediaInfo.isVideo = type.toLowerCase() === 'video' ? true : false;
      mediaInfo.duration = duration;
    }
  } catch (err) {
    console.error(err);
    var _error = (0, _typeof2["default"])(err) == 'object' ? 'Manifest is invalid. Please check the Manifest.' : err;
    return {
      error: _error
    };
  }
  return mediaInfo;
}
function filtersrc(sources) {
  if (sources.length < 1) {
    throw 'Error fetching media files. Please check the Manifest.';
  } else if (sources.length == 1) {
    return {
      src: sources[0].src,
      type: sources[0].kind
    };
  } else {
    var srcId = sources[0].src;
    var type = sources[0].kind;
    sources.map(function (src) {
      var srcQuality = src.label;
      if (srcQuality == 'auto' || srcQuality == 'low') {
        srcId = src.src;
        type = src.kind;
      }
    });
    return {
      src: srcId,
      type: type
    };
  }
}

/**
 * Retrieve the waveform information listed under `seeAlso` property
 * for each Canvas in the Manifest
 * @param {Object} manifest
 * @param {Number} canvasIndex
 * @returns List of files under `seeAlso` property in a Canvas
 */
function getWaveformInfo(manifest, canvasIndex) {
  var waveformFile = null;
  var fileInfo = [];
  if (manifest === null) {
    return null;
  }
  try {
    var manifestParsed = (0, _manifesto.parseManifest)(manifest);
    var canvas = manifestParsed.getSequences()[0].getCanvasByIndex(canvasIndex);
    if (canvas.__jsonld.seeAlso) {
      fileInfo = canvas.__jsonld.seeAlso;
      if (fileInfo.length > 0) {
        var w = fileInfo[0];
        var name = getLabelValue(w.label);
        if (w.format == 'application/json' && name == 'waveform.json') {
          waveformFile = w.id;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  return waveformFile;
}

/**
 * Check if a given Canvas exists in the Manifest's items array
 * @param {String} mediaFragment - media fragment URI
 * @param {Object} manifest - current IIIF manifest
 * @returns {Boolean} - true if Canvas exists in Manifest, false otherwise
 */
function isCanvasInManifest(mediaFragment, manifest) {
  if (!mediaFragment || !manifest || !manifest.items) {
    return false;
  }

  // Get Canvas ID from mediafragment URL
  var canvasURL = mediaFragment.split('#')[0];

  // Check if the Canvas ID exists in the Manifest's items list
  return manifest.items.some(function (item) {
    return item.type === 'Canvas' && item.id === canvasURL;
  });
}

/**
 * Parse the structures within manifest into a nested JSON object
 * structure to be consumed by the ReactJS components to help visualize
 * and edit structure
 * @param {Object} manifest current manifest
 * @param {Number} duration duration of the canvas in manifest
 * @param {Number} canvasIndex current canvas index with default value of zero
 * @returns {Array.<Object>} structureJSON - array of nested JSON 
 * objects with structure items parsed from the given manifest
 */
function parseStructureToJSON(manifest, duration) {
  var canvasIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var structureJSON = [];
  if (!manifest) return [];
  var _buildStructureItems = function buildStructureItems(items, children) {
    var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (items.length > 0) {
      items.map(function (i) {
        var range = (0, _manifesto.parseManifest)(manifest).getRangeById(i.id);
        if (range) {
          var _i$items;
          // Set default type to 'div' and change it as needed for timespans
          var structItem = {
            label: getLabelValue(i.label),
            items: [],
            type: "div",
            nestedSpan: false
          };

          // Get canvases associated with the current Range
          var childCanvases = range.getCanvasIds();
          /**
           * Only mark a structure item as a timespan, when the relevant Canvas is in the current
           * Manifest.
           * NOTE::It's possible to have Canvas references to external Manifests in the
           * structure, but for the purpose of SME only consider Range items with Canvas
           * references in the Manifest as timespans. This helps with validation in Peaks.js 
           * when editing timespans.
           */
          var canvasIsInManifest = isCanvasInManifest(childCanvases[0], manifest);
          if (childCanvases.length > 0 && canvasIsInManifest) {
            var _getMediaFragment = getMediaFragment(childCanvases[0], duration),
              start = _getMediaFragment.start,
              end = _getMediaFragment.end;
            structItem = _objectSpread(_objectSpread({}, structItem), {}, {
              type: "span",
              begin: smUtils.toHHmmss(start),
              end: smUtils.toHHmmss(end),
              timeRange: {
                start: start,
                end: end
              },
              // Mark timespan item as nested span if it has parent of type='span'
              nestedSpan: (parent === null || parent === void 0 ? void 0 : parent.type) === 'span'
            });
          }
          children.push(structItem);

          // If the structure item has children build them recuresively
          if (((_i$items = i.items) === null || _i$items === void 0 ? void 0 : _i$items.length) > 0) {
            _buildStructureItems(i.items, structItem.items, structItem);
          }
        }
      });
    }
  };
  var manifestName;
  var structures = [];
  if (manifest != undefined && manifest != null) {
    var _structures$;
    structures = manifest.structures != undefined ? manifest.structures : [];
    // Ignore the top element, this gets injected in the manifest generation in Avalon.
    // `iiif_manifest` gem keeps wrapping the structure with a root element with 
    // behavior set to 'top' without a label every time structure
    // is saved in SME.
    var behavior = structures.length > 0 ? (_structures$ = structures[0]) === null || _structures$ === void 0 ? void 0 : _structures$.behavior : '';
    structures = behavior === 'top' ? structures[0].items : structures;
    manifestName = getLabelValue(manifest.label);
  }

  // Check for empty structures in manifest
  if (structures.length > 0) {
    var root = structures[canvasIndex];
    var children = [];

    // Build the nested JSON object from structure
    _buildStructureItems(root.items, children, {
      type: 'div'
    });

    // Add the root element to the JSON object
    structureJSON.push({
      type: 'div',
      label: getLabelValue(root.label),
      items: children,
      nestedSpan: false
    });
  }
  // Create an empty structure with manifest information
  else if (manifestName != undefined) {
    structureJSON.push({
      label: manifestName,
      items: [],
      type: 'div',
      nestedSpan: false
    });
  }
  var structureWithIDs = smUtils.addUUIds(structureJSON);
  return structureWithIDs;
}

/**
 * Takes a uri with a media fragment that looks like #=120,134 and returns an object
 * with start/end in seconds and the duration in milliseconds
 * Reference: https://github.com/samvera-labs/iiif-react-media-player/blob/main/src/services/iiif-parser.js#L288-L303
 * @param {string} uri - Uri value
 * @param {number} duration - duration of the current canvas
 * @return {Object} - Representing the media fragment ie. { start: 3287.0, end: 3590.0 }, or undefined
 */
function getMediaFragment(uri, duration) {
  if (uri !== undefined) {
    var fragment = uri.split('#t=')[1];
    if (fragment !== undefined) {
      var splitFragment = fragment.split(',');
      if (splitFragment[1] == undefined || splitFragment[1] == '') {
        splitFragment[1] = duration;
      }
      return {
        start: Number(splitFragment[0]),
        end: Number(splitFragment[1])
      };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

/**
 * Parse the label value from a manifest item
 * See https://iiif.io/api/presentation/3.0/#label
 * Reference: https://github.com/samvera-labs/iiif-react-media-player/blob/main/src/services/iiif-parser.js#L258-L278
 * @param {Object} label
 */
function getLabelValue(label) {
  var decodeHTML = function decodeHTML(labelText) {
    return labelText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  };
  if (label && (0, _typeof2["default"])(label) === 'object') {
    var labelKeys = Object.keys(label);
    if (labelKeys && labelKeys.length > 0) {
      // Get the first key's first value
      var firstKey = labelKeys[0];
      return label[firstKey].length > 0 ? decodeHTML(label[firstKey][0]) : '';
    }
  } else if (typeof label === 'string') {
    return decodeHTML(label);
  }
  return 'Label could not be parsed';
}