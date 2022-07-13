import { parseManifest } from "manifesto.js";
import StructuralMetadataUtils from "../StructuralMetadataUtils";
import uuidv1 from 'uuid';

const smUtils = new StructuralMetadataUtils;

/**
 * Fetch media information relavant to the current canvas
 * from manifest
 * @param {Object} manifest IIIF manifest from given URL
 * @param {Number} canvasIndex index of the current canvas
 * @returns { String, Number } { media src, media duration }
 */
export function getMediaInfo(manifest, canvasIndex) {
  let canvas;
  let mediaInfo = {};
  try {
    canvas = parseManifest(manifest)
      .getSequences()[0]
      .getCanvases()[canvasIndex];
    const sources = canvas.getContent()[0].getBody();
    mediaInfo.src = filtersrc(sources);
    mediaInfo.duration = canvas.getDuration();
  } catch (err) {
    console.log('Error fetching resources, ', err);
    return { error: 'Error fetching stream files' };
  }

  return mediaInfo;

}

function filtersrc(sources) {
  if (sources.length < 1) {
    return '';
  }
  else if (sources.length == 1) {
    return sources[0].id;
  } else {
    let srcId = '';
    sources.map((src) => {
      const srcQuality = src.getLabel()[0].value.toLowerCase();
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
export function getWaveformInfo(manifest, canvasIndex) {
  let files = [];
  const manifestParsed = parseManifest(manifest);
  let manifestRendering = manifestParsed.getRenderings();

  let canvas = manifestParsed.getSequences()[0]
    .getCanvasByIndex(canvasIndex);
  let canvasRendering = canvas.__jsonld.rendering;

  let buildFileInfo = (format, label, id) => {
    const name = getLabelValue(label);
    if (format == 'application/json' && name == 'waveform.json') {
      files.push(id);
    }
  };

  manifestRendering.map((r) => {
    buildFileInfo(r.getFormat(), r.getProperty('label'), r.id);
  });

  if (canvasRendering) {
    canvasRendering.map((r) => {
      buildFileInfo(r.format, r.label, r.id);
    });
  }
  return files;
}

/**
 * Parse the structures within manifest into a nested JSON object
 * structure to be consumed by the ReactJS components to help visualize
 * and edit structure
 * @param {Object} manifest current manifest
 * @param {Object} initStructure  backup blank structure to use
 * @param {Number} duration duration of the canvas in manifest
 * @returns {Array, Boolean} array of nested JSON objects with structure items
 * parsed from the given manifest and boolean flag to indicate structure is
 * valid/not.
 */
export function parseStructureToJSON(manifest, initStructure, duration) {
  let structureJSON = [];
  let structureIsValid = true;

  let buildStructureItems = (items, children) => {
    if (items.length > 0) {
      items.map((i) => {
        const childCanvases = getRangeCanvas(i.id, manifest);
        let structItem = {};
        if (childCanvases.length > 0) {
          const { start, end } = getMediaFragment(childCanvases[0], duration);
          const { isValid, endTime } = validateTimes(start, end, duration);
          structureIsValid = structureIsValid && isValid;
          structItem = {
            label: getLabelValue(i.label),
            type: "span",
            begin: smUtils.toHHmmss(start),
            end: smUtils.toHHmmss(endTime),
            valid: isValid,
            id: uuidv1(),
          };
          children.push(structItem);
        } else {
          structItem = {
            label: getLabelValue(i.label),
            type: "div",
            valid: true,
            items: [],
            id: uuidv1(),
          };
          if (i.items) {
            buildStructureItems(i.items, structItem.items);
          }
          children.push(structItem);
        }
      });
    }
  };


  // Check for empty structures in manifest
  if (manifest && manifest.structures.length > 0) {
    const structures = manifest.structures;
    const root = structures[0];
    let children = [];

    // Build the nested JSON object from structure
    buildStructureItems(root.items, children);

    // Add the root element to the JSON object
    structureJSON.push({
      type: "root",
      label: getLabelValue(root.label),
      valid: true,
      items: children,
      id: uuidv1(),
    });
  } else {
    const root = buildInitStructure(manifest, initStructure);
    structureJSON.push(root);
  }

  return { structureJSON, structureIsValid };
}

function validateTimes(start, end, duration) {
  let isValid = true;
  let endTime = end;
  if (start > end || start > duration) {
    isValid = false;
  } else if (end > duration) {
    isValid = false;
    endTime = smUtils.toHHmmss(duration);
  }
  if (end === 0) {
    isValid = false;
    endTime = smUtils.toHHmmss(duration);
  }
  return { isValid, endTime };
}


export function buildInitStructure(manifest, initStructure) {
  let root = initStructure;
  if (initStructure == undefined) {
    const manifestName = getLabelValue(manifest.label);
    root = {
      label: manifestName,
      items: [],
      type: 'root',
      id: uuidv1(),
      valid: true,
    };
  }
  return root;
};

/**
 * Retrieve the canvas URI with mediafragment of a given
 * range
 * @param {String} rangeId id of the range in ToC
 * @param {Object} manifest manifest with structure
 * @returns {Array} of canvas URI with mediafragment inside
 * the given range
 */
export function getRangeCanvas(rangeId, manifest) {
  let rangeCanvases = [];
  try {
    rangeCanvases = parseManifest(manifest)
      .getRangeById(rangeId)
      .getCanvasIds();
  } catch (e) {
    console.log('error fetching range canvases');
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
export function getMediaFragment(uri, duration) {
  if (uri !== undefined) {
    const fragment = uri.split('#t=')[1];
    if (fragment !== undefined) {
      const splitFragment = fragment.split(',');
      if (splitFragment[1] == undefined || splitFragment[1] == '') {
        splitFragment[1] = duration;
      }
      return { start: Number(splitFragment[0]), end: Number(splitFragment[1]) };
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
export function getLabelValue(label) {
  let decodeHTML = (labelText) => {
    return labelText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  };
  if (label && typeof label === 'object') {
    const labelKeys = Object.keys(label);
    if (labelKeys && labelKeys.length > 0) {
      // Get the first key's first value
      const firstKey = labelKeys[0];
      return label[firstKey].length > 0 ? decodeHTML(label[firstKey][0]) : '';
    }
  } else if (typeof label === 'string') {
    return decodeHTML(label);
  }
  return 'Label could not be parsed';
}
