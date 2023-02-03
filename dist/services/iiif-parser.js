"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLabelValue = getLabelValue;
exports.getMediaFragment = getMediaFragment;
exports.getMediaInfo = getMediaInfo;
exports.getRangeCanvas = getRangeCanvas;
exports.getWaveformInfo = getWaveformInfo;
exports.parseStructureToJSON = parseStructureToJSON;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _manifesto = require("manifesto.js");

var _StructuralMetadataUtils = _interopRequireDefault(require("./StructuralMetadataUtils"));

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
  var canvas;
  var mediaInfo = {};

  try {
    canvas = (0, _manifesto.parseManifest)(manifest).getSequences()[0].getCanvases()[canvasIndex];
    var sources = canvas.getContent()[0].getBody();
    mediaInfo.src = filtersrc(sources);
    mediaInfo.duration = canvas.getDuration();
  } catch (err) {
    console.error(err);
    var error = (0, _typeof2["default"])(err) == 'object' ? 'Manifest is invalid. Please check the Manifest.' : err;
    return {
      error: error
    };
  }

  return mediaInfo;
}

function filtersrc(sources) {
  if (sources.length < 1) {
    throw 'Error fetching media files. Please check the Manifest.';
  } else if (sources.length == 1) {
    return sources[0].id;
  } else {
    var srcId = sources[0].id;
    sources.map(function (src) {
      var srcQuality = src.getLabel()[0].value.toLowerCase();

      if (srcQuality == 'auto' || srcQuality == 'low') {
        srcId = src.id;
      }
    });
    return srcId;
  }
}
/**
 * Retrieve the list of alternative representation files in manifest or canvas
 * level to make available to download
 * @param {Object} manifest
 * @param {Number} canvasIndex
 * @returns List of files under `rendering` property in manifest
 */


function getWaveformInfo(manifest, canvasIndex) {
  var waveformFile = null;
  var canvasRendering = [];

  try {
    var manifestParsed = (0, _manifesto.parseManifest)(manifest);
    var canvas = manifestParsed.getSequences()[0].getCanvasByIndex(canvasIndex);

    if (canvas.__jsonld.rendering) {
      canvasRendering = canvas.__jsonld.rendering;

      if (canvasRendering.length > 0) {
        var w = canvasRendering[0];
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

  var buildStructureItems = function buildStructureItems(items, children) {
    if (items.length > 0) {
      items.map(function (i) {
        var childCanvases = getRangeCanvas(i.id, manifest);
        var structItem = {};

        if (childCanvases.length > 0) {
          var _getMediaFragment = getMediaFragment(childCanvases[0], duration),
              start = _getMediaFragment.start,
              end = _getMediaFragment.end;

          structItem = {
            label: getLabelValue(i.label),
            type: "span",
            begin: smUtils.toHHmmss(start),
            end: smUtils.toHHmmss(end)
          };
          children.push(structItem);
        } else {
          structItem = {
            label: getLabelValue(i.label),
            type: "div",
            items: []
          };

          if (i.items) {
            buildStructureItems(i.items, structItem.items);
          }

          children.push(structItem);
        }
      });
    }
  };

  var manifestName;
  var structures = [];

  if (manifest != undefined && manifest != null) {
    var _structures$;

    structures = manifest.structures != undefined ? manifest.structures : []; // Ignore the top element, this gets injected in the manifest generation in Avalon.
    // `iiif_manifest` gem keeps wrapping the structure with a root element with 
    // behavior set to 'top' without a label every time structure
    // is saved in SME.

    var behavior = structures.length > 0 ? (_structures$ = structures[0]) === null || _structures$ === void 0 ? void 0 : _structures$.behavior : '';
    structures = behavior === 'top' ? structures[0].items : structures;
    manifestName = getLabelValue(manifest.label);
  } // Check for empty structures in manifest


  if (structures.length > 0) {
    var root = structures[canvasIndex];
    var children = []; // Build the nested JSON object from structure

    buildStructureItems(root.items, children); // Add the root element to the JSON object

    structureJSON.push({
      type: 'div',
      label: getLabelValue(root.label),
      items: children
    });
  } // Create an empty structure with manifest information
  else if (manifestName != undefined) {
    structureJSON.push({
      label: manifestName,
      items: [],
      type: 'div'
    });
  }

  var structureWithIDs = smUtils.addUUIds(structureJSON);
  return structureWithIDs;
}
/**
 * Retrieve the canvas URI with mediafragment of a given
 * range
 * @param {String} rangeId id of the range in ToC
 * @param {Object} manifest manifest with structure
 * @returns {Array} of canvas URI with mediafragment inside
 * the given range
 */


function getRangeCanvas(rangeId, manifest) {
  var rangeCanvases = [];

  try {
    rangeCanvases = (0, _manifesto.parseManifest)(manifest).getRangeById(rangeId).getCanvasIds();
  } catch (e) {
    console.error('error fetching range canvases');
  }

  return rangeCanvases;
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