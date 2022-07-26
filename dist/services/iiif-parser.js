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
  var files = [];

  try {
    var manifestParsed = (0, _manifesto.parseManifest)(manifest);
    var manifestRendering = manifestParsed.getRenderings();
    var canvas = manifestParsed.getSequences()[0].getCanvasByIndex(canvasIndex);
    var canvasRendering = canvas.__jsonld.rendering;

    var buildFileInfo = function buildFileInfo(format, label, id) {
      var name = getLabelValue(label);

      if (format == 'application/json' && name == 'waveform.json') {
        files.push(id);
      }
    };

    manifestRendering.map(function (r) {
      buildFileInfo(r.getFormat(), r.getProperty('label'), r.id);
    });

    if (canvasRendering) {
      canvasRendering.map(function (r) {
        buildFileInfo(r.format, r.label, r.id);
      });
    }
  } catch (err) {
    console.error(err);
  }

  return files;
}
/**
 * Parse the structures within manifest into a nested JSON object
 * structure to be consumed by the ReactJS components to help visualize
 * and edit structure
 * @param {Object} manifest current manifest
 * @param {Number} duration duration of the canvas in manifest
 * @param {Object} initStructure initial structure by default from props
 * @returns {Array.<Object>} structureJSON - array of nested JSON 
 * objects with structure items parsed from the given manifest
 */


function parseStructureToJSON(manifest, initStructure, duration) {
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

  if (manifest != undefined || manifest != null) {
    structures = manifest.structures != undefined ? manifest.structures : [];
    manifestName = getLabelValue(manifest.label);
  } // Check for empty structures in manifest


  if (structures.length > 0) {
    var root = structures[0];
    var children = []; // Build the nested JSON object from structure

    buildStructureItems(root.items, children); // Add the root element to the JSON object

    structureJSON.push({
      type: 'div',
      label: getLabelValue(root.label),
      items: children
    });
  } else if (typeof initStructure === 'string' && initStructure !== '') {
    structureJSON = smUtils.addUUIds([JSON.parse(initStructure)]);
  } // Use default initial structure when manifest doesn't
  // have structures 
  else if (initStructure != undefined && Object.keys(initStructure).length != 0) {
    structureJSON = smUtils.addUUIds([initStructure]);
  } // Create a dummy structure with manifest information
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
 * @function IIIFParser#getMediaFragment
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