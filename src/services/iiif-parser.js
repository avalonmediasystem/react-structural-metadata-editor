import { parseManifest } from "manifesto.js";
import StructuralMetadataUtils from "./StructuralMetadataUtils";
import { getMimetype, readAnnotations } from "./utils";

const smUtils = new StructuralMetadataUtils;

/**
 * Fetch media information relavant to the current canvas
 * from manifest
 * @param {Object} manifest IIIF manifest from given URL
 * @param {Number} canvasIndex index of the current canvas
 * @returns { String, Number } { media src, media duration }
 */
export function getMediaInfo(manifest, canvasIndex = 0) {
  let mediaInfo = {};
  try {
    const { resources, error, duration } = readAnnotations({
      manifest,
      canvasIndex,
      key: "items",
      motivation: "painting"
    });
    if (resources.length === 0) {
      console.log('iiif-parser -> getMediaInfo() -> error', error);
      return { src: undefined, duration: 0, isStream: false, isVideo: false, error };
    } else {
      const { src, type } = filtersrc(resources);
      mediaInfo.isStream = getMimetype(src) === 'application/x-mpegURL' ? true : false;
      mediaInfo.src = src;
      mediaInfo.isVideo = type.toLowerCase() === 'video' ? true : false;
      mediaInfo.duration = duration;
    }
  } catch (err) {
    console.error(err);
    const error = typeof err == 'object' ?
      'Manifest is invalid. Please check the Manifest.'
      : err;
    return { error };
  }
  return mediaInfo;
}

function filtersrc(sources) {
  if (sources.length < 1) {
    throw 'Error fetching media files. Please check the Manifest.';
  }
  else if (sources.length == 1) {
    return { src: sources[0].src, type: sources[0].kind };
  } else {
    let srcId = sources[0].src;
    let type = sources[0].kind;
    sources.map((src) => {
      const srcQuality = src.label;
      if (srcQuality == 'auto' || srcQuality == 'low') {
        srcId = src.src;
        type = src.kind;
      }
    });
    return { src: srcId, type };
  }
}


/**
 * Retrieve the waveform information listed under `seeAlso` property
 * for each Canvas in the Manifest
 * @param {Object} manifest
 * @param {Number} canvasIndex
 * @returns List of files under `seeAlso` property in a Canvas
 */
export function getWaveformInfo(manifest, canvasIndex) {
  let waveformFile = null;
  let fileInfo = [];

  if (manifest === null) {
    return null;
  }
  try {
    const manifestParsed = parseManifest(manifest);
    let canvas = manifestParsed.getSequences()[0]
      .getCanvasByIndex(canvasIndex);
    if (canvas.__jsonld.seeAlso) {
      fileInfo = canvas.__jsonld.seeAlso;

      if (fileInfo.length > 0) {
        const w = fileInfo[0];
        const name = getLabelValue(w.label);
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
  const canvasURL = mediaFragment.split('#')[0];

  // Check if the Canvas ID exists in the Manifest's items list
  return manifest.items.some(item =>
    item.type === 'Canvas' && item.id === canvasURL
  );
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
export function parseStructureToJSON(manifest, duration, canvasIndex = 0) {
  let structureJSON = [];

  if (!manifest) return [];
  let buildStructureItems = (items, children, parent = null) => {
    if (items.length > 0) {
      items.map((i) => {
        const range = parseManifest(manifest)
          .getRangeById(i.id);
        if (range) {
          // Set default type to 'div' and change it as needed for timespans
          let structItem = {
            label: getLabelValue(i.label),
            items: [],
            type: "div",
            nestedSpan: false
          };

          // Get canvases associated with the current Range
          const childCanvases = range.getCanvasIds();
          /**
           * Only mark a structure item as a timespan, when the relevant Canvas is in the current
           * Manifest.
           * NOTE::It's possible to have Canvas references to external Manifests in the
           * structure, but for the purpose of SME only consider Range items with Canvas
           * references in the Manifest as timespans. This helps with validation in Peaks.js 
           * when editing timespans.
           */
          const canvasIsInManifest = isCanvasInManifest(childCanvases[0], manifest);
          if (childCanvases.length > 0 && canvasIsInManifest) {
            const { start, end } = getMediaFragment(childCanvases[0], duration);
            structItem = {
              ...structItem,
              type: "span",
              begin: smUtils.toHHmmss(start),
              end: smUtils.toHHmmss(end),
              timeRange: { start, end },
              // Mark timespan item as nested span if it has parent of type='span'
              nestedSpan: parent?.type === 'span'
            };
          }
          children.push(structItem);

          // If the structure item has children build them recuresively
          if (i.items?.length > 0) {
            buildStructureItems(i.items, structItem.items, structItem);
          }
        }
      });
    }
  };

  let manifestName;
  let structures = [];

  if (manifest != undefined && manifest != null) {
    structures = manifest.structures != undefined ? manifest.structures : [];
    // Ignore the top element, this gets injected in the manifest generation in Avalon.
    // `iiif_manifest` gem keeps wrapping the structure with a root element with 
    // behavior set to 'top' without a label every time structure
    // is saved in SME.
    const behavior = structures.length > 0 ? structures[0]?.behavior : '';
    structures = behavior === 'top' ? structures[0].items : structures;
    manifestName = getLabelValue(manifest.label);
  }

  // Check for empty structures in manifest
  if (structures.length > 0) {
    const root = structures[canvasIndex];
    let children = [];

    // Build the nested JSON object from structure
    buildStructureItems(root.items, children, { type: 'div' });

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
  const structureWithIDs = smUtils.addUUIds(structureJSON);
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
