import { parseManifest } from "manifesto.js";
import { v4 as uuidv4 } from 'uuid';
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
    if (items?.length > 0) {
      items.map((i) => {
        const range = parseManifest(manifest)
          .getRangeById(i.id);
        // Mark a Canvas/section item as a 'div' with a Canvas reference
        let isCanvasSection = false;
        if (i.items?.length > 0 && i.items[0].type === 'Canvas') isCanvasSection = true;
        if (range) {
          // Set default type to 'div' and change it as needed for timespans
          let structItem = {
            label: getLabelValue(i.label),
            items: [],
            type: "div",
            nestedSpan: false,
            isCanvasSection,
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
    manifestName = getLabelValue(manifest.label);
  }

  const behavior = structures.length > 0 ? structures[0]?.behavior : '';
  const canvasCount = parseManifest(manifest).getSequences()[0].getCanvases().length;

  let root;
  if (behavior === 'top') {
    /**
     * Ignore the top element, this gets injected in the manifest generation in Avalon.
     * `iiif_manifest` gem keeps wrapping the structure with a root element with
     * behavior set to 'top' without a label every time structure
     * is saved in SME.
     */
    const structureItems = structures[0].items;
    root = structureItems?.length > 0 ? structureItems[canvasIndex] : [];
  } else if (structures.length > 0 && structures.length != canvasCount) {
    /**
     * When the root doesn't have behavior='top' then look into the structures array
     * and check if the root level has structures for each Canvas/section in the Manifest.
     * E.g. https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/
     */
    const structureSections = structures[0].items;
    root = structureSections.length === canvasCount ? structureSections[canvasIndex] : structures;
  } else {
    root = structures[canvasIndex];
  }

  if (root) {
    let children = [];
    let isCanvasSection = false;

    // Mark the root is a Canvas/section item -> a 'div' with a Canvas reference
    if (root.items?.length > 0 && root.items[0]?.type === 'Canvas') {
      isCanvasSection = true;
    }

    // Build the nested JSON object from structure
    buildStructureItems(root.items, children, { type: 'div' });

    // Add the root element to the JSON object
    structureJSON.push({
      type: 'div', items: children, nestedSpan: false,
      label: getLabelValue(root.label),
      isCanvasSection,
    });
  }
  // Create an empty structure with manifest information
  else if (manifestName != undefined) {
    structureJSON.push({
      label: manifestName, items: [], type: 'div', nestedSpan: false,
      isCanvasSection: true
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

/**
 * Convert the internal 'smData' structure back to a IIIF Presentation API 3.0
 * 'structures' array of Range objects. This is the inverse of 'parseStructureToJSON'
 * @param {Array} smData - internal structure tree from state
 * @param {Object} manifest - raw IIIF manifest object
 * @param {Number} canvasIndex - index of the current Canvas(defaults to 0)
 * @returns {Array} IIIF 'structures' array
 */
export function parseJSONToStructure(manifest, smData, canvasIndex = 0) {
  if (!smData || smData?.length === 0) {
    if (!manifest) return [];
    else return manifest.structures;
  }

  const smu = new StructuralMetadataUtils();
  let canvasId, manifestId, structureBehavior, structures;
  let structureItems = [];
  // 'structures' property has a root Range surrounding sections
  let hasWrapperRange = false;

  if (manifest != undefined && manifest != null) {
    // Get the canvasId to build the Canvas reference for Range items as needed
    canvasId = manifest.items?.[canvasIndex]?.id ?? manifest.items?.[0]?.id;
    if (!canvasId) return [];

    // Number of items under the Manifest's 'items' property
    const canvasCount = parseManifest(manifest).getSequences()[0]
      .getCanvases().length;

    structures = manifest.structures != undefined ? manifest.structures : [];
    // Remove the '.json' suffix in the Manifest label
    manifestId = manifest.id.replace(/\.json$/, "");

    structureBehavior = structures.length > 0 ? structures[0]?.behavior : '';
    if (structureBehavior === 'top') {
      /**
       * When there is a root Range with behavior='top' avoid it and retrieve the
       * relevant structure item for the current Canvas from its 'items'.
       * Update the top Range's id to match the new hierarchical format starting with 0.
       * E.g. Avalon manifests -> https://media.dlib.indiana.edu/media_objects/qn59qp839/
       */
      structures[0].id = `${manifestId}/range/0`;
      structureItems = structures[0].items;
      hasWrapperRange = true;
    } else if (structures.length > 0 && structures.length != canvasCount) {
      /**
       * When the root doesn't have behavior='top' then look into the structures array
       * and check if the root level has structures for each Canvas/section in the Manifest.
       * E.g. https://iiif.io/api/cookbook/recipe/0065-opera-multiple-canvases/
       */
      const structureSections = structures[0].items;
      if (structureSections.length === canvasCount) {
        structures[0].id = `${manifestId}/range/0`;
      }
      structureItems = structureSections.length === canvasCount ? structureSections : structures;
      hasWrapperRange = true;
    } else {
      structureItems = structures;
    }
  }

  const buildRange = (item, pathKey) => {
    const range = {
      id: `${manifestId}/range/${pathKey}`,
      type: 'Range',
      label: { en: [item.label] },
      items: [],
    };

    if (item.isCanvasSection) {
      const canvasDuration = manifest.items?.[canvasIndex]?.duration ?? 0;
      range.items.push({ id: `${canvasId}#t=0,${canvasDuration}`, type: 'Canvas' });
    } else if (item.type === 'span') {
      const start = smu.convertToSeconds(item.begin);
      const end = smu.convertToSeconds(item.end);
      range.items.push({ id: `${canvasId}#t=${start},${end}`, type: 'Canvas' });
    }

    (item.items || []).forEach((child, i) => {
      range.items.push(buildRange(child, `${pathKey}-${i + 1}`));
    });

    return range;
  };
  const buildIds = (item, pathKey) => {
    item.id = `${manifestId}/range/${pathKey}`;

    (item.items || []).forEach((child, i) => {
      if (child.type === 'Range') buildIds(child, `${pathKey}-${i + 1}`);
    });

    return item;
  };

  if (structureItems.length > 0) {
    let updatedRanges = [];
    // Build the updated Range items from the internal structure tree
    const changedRange = buildRange(smData[0], `${canvasIndex + 1}`);
    // Update the Range ids for the rest of the structure items for multi-Canvas Manifest
    for (let i = 0; i < structureItems.length; i++) {
      if (i === canvasIndex) {
        // Use the updated Range for the edited Canvas
        updatedRanges.push(changedRange);
        continue;
      } else {
        // Update the Range ids for the rest
        const updated = buildIds(JSON.parse(JSON.stringify(structureItems[i])), i + 1);
        updatedRanges.push(updated);
      }
    }

    if (hasWrapperRange) {
      return [{ ...structures[0], items: updatedRanges }];
    } else {
      return updatedRanges;
    }
  }
}
