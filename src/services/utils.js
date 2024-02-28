import WaveformData from 'waveform-data';
import { parseManifest, Annotation, AnnotationPage } from 'manifesto.js';

const MimeTyeps = {
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
};

const getMediaExtension = (url) => {
  if (typeof url === 'string') {
    const urlSplit = url.split('.');

    if (urlSplit) {
      return urlSplit.pop().toLowerCase();
    }
  }
  return '';
};

export const getMimetype = (src = '') => {
  const ext = getMediaExtension(src);
  return MimeTyeps[ext] || '';
};

/**
 * Generate waveform data for media files using waveform-data
 * library
 * @param {String} src URL of the media file
 * @returns {Object} JSON object containing waveform data
 */
const generateWaveformData = async (src) => {
  let waveformJSON = fetch(src)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const audioContext = new AudioContext();
      const options = {
        audio_context: audioContext,
        array_buffer: buffer,
        scale: 512
      };

      return new Promise((resolve, reject) => {
        WaveformData.createFromAudio(options, (err, waveform) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(waveform);
          }
        });
      });
    })
    .then(waveform => {
      return waveform.toJSON();
    });
  return waveformJSON;
};

/**
 * Create a dummy waveform dataset for the duration of the media file
 * This is used when a waveform is not specified in the manifest OR the
 * duration of the media file is longer than 10 minutes.
 * Waveform data calculation formula reference:
 * https://github.com/avalonmediasystem/avalon/blob/main/app/services/waveform_service.rb#L48-L72
 * @param {Number} duration of the media file in the manifest
 * @returns {Object} JSON object containing dummy waveform data
 */
const createEmptyWaveform = (duration) => {
  const maxPeak = 1.0, minPeak = -1.0;
  const sampleRate = 44100;
  const samplesPerPixel = 512; // lowest default zoom level
  const waveformLength = 2 * Math.ceil(((sampleRate * duration) / samplesPerPixel) / 2);
  let waveformData = [];
  for (let i = 0; i < waveformLength; i++) {
    let dataPoints = [Math.random() * ((minPeak - maxPeak) + minPeak), Math.random() * ((maxPeak - minPeak) + maxPeak)];
    waveformData.push(Math.min(...dataPoints));
    waveformData.push(Math.max(...dataPoints));
  }
  let waveform_json = {
    sample_rate: sampleRate,
    bits: 8,
    length: waveformLength,
    samples_per_pixel: samplesPerPixel,
    data: waveformData,
  };
  let waveformJSON = WaveformData.create(waveform_json).toJSON();
  return waveformJSON;
};

/**
 * Set relevant waveform data options for Peaks instance creation
 * @param {Object} mediaInfo src, duration, and media type information
 * @param {Object} peaksOptions existign options for Peaks instantiation
 * @returns {Object}
 */
export const setWaveformOptions = async (mediaInfo, peaksOptions) => {
  const { duration, src, isStream } = mediaInfo;
  let alertStatus = null;
  // for non-streaming shorter media files
  if (duration < 300 && !isStream) {
    const wdJSON = await generateWaveformData(src);
    peaksOptions.waveformData = { json: wdJSON };
  } else {
    peaksOptions.waveformData = {
      json: createEmptyWaveform(duration)
    };
    alertStatus = -7;
  }
  return { opts: peaksOptions, alertStatus };
};

/* 
  IIIF Manifest parsing code adapted from Ramp: 
  https://github.com/samvera-labs/ramp/blob/main/src/services/iiif-parser.js
*/
export function readAnnotations({ manifest, canvasIndex, key, motivation }) {
  const { annotations, duration } = getAnnotations({
    manifest,
    canvasIndex,
    key,
    motivation
  });
  return getResourceItems(annotations, duration);
}

/**
 * Extract list of Annotations from `annotations`/`items`
 * under the canvas with the given motivation
 * @param {Object} obj
 * @param {Object} obj.manifest IIIF manifest
 * @param {Number} obj.canvasIndex curent canvas's index
 * @param {String} obj.key property key to pick
 * @param {String} obj.motivation
 * @returns {Array} array of AnnotationPage
 */
function getAnnotations({ manifest, canvasIndex, key, motivation }) {
  let annotations = [];
  // When annotations are at canvas level
  try {
    const annotationPage = parseManifest(manifest).getSequences()[0]
      .getCanvases()[canvasIndex];
    const duration = Number(annotationPage.getDuration()) || 0.0;
    if (annotationPage) {
      annotations = parseAnnotations(annotationPage.__jsonld[key], motivation);
    }
    return { annotations, duration };
  } catch (error) {
    throw error;
  }
}

/**
 * Parse a list of annotations or a single annotation to extract details of a
 * given a Canvas. Assumes the annotation type as either painting or supplementing
 * @param {Array} annotations list of painting/supplementing annotations to be parsed
 * @param {Number} duration Canvas duration
 * @returns {Object} containing source, canvas targets
 */
function getResourceItems(annotations, duration) {
  let resources = [];
  if (!annotations || annotations.length === 0) {
    return {
      error: 'No resources found in Manifest',
      resources,
      duration
    };
  }
  // Multiple resource files on a single canvas
  else if (annotations.length > 1) {
    annotations.map((a, index) => {
      const source = getResourceInfo(a.getBody()[0]);
      /**
       * TODO::
       * Is this pattern safe if only one of `source.length` or `track.length` is > 0?
       * For example, if `source.length` > 0 is true and `track.length` > 0 is false,
       * then sources and tracks would end up with different numbers of entries.
       * Is that okay or would that mess things up?
       * Maybe this is an impossible edge case that doesn't need to be worried about?
       */
      (source.length > 0 && source[0].src) && resources.push(source[0]);
    });
  }
  // Multiple Choices avalibale
  else if (annotations[0].getBody()?.length > 0) {
    const annoQuals = annotations[0].getBody();
    annoQuals.map((a) => {
      const source = getResourceInfo(a);
      // Check if the parsed sources has a resource URL
      (source.length > 0 && source[0].src) && resources.push(source[0]);
    });
  }
  // No resources
  else {
    return { resources, error: 'No resources found', duration };
  }
  return { resources, duration, error: '' };
}


/**
 * Parse source and track information related to media
 * resources in a Canvas
 * @param {Object} item AnnotationBody object from Canvas
 * @returns parsed source and track information
 */
function getResourceInfo(item) {
  let source = [];
  let label = undefined;
  if (item.getLabel().length === 1) {
    label = item.getLabel().getValue();
  } else if (item.getLabel().length > 1) {
    // If there are multiple labels, assume the first one
    // is the one intended for default display
    label = getLabelValue(item.getLabel()[0]._value);
  }
  let s = {
    src: item.id,
    key: item.id,
    type: item.getProperty('format'),
    kind: item.getProperty('type'),
    label: label || 'auto',
    value: item.getProperty('value') ? item.getProperty('value') : '',
  };
  source.push(s);
  return source;
}

/**
 * Parse json objects in the manifest into Annotations
 * @param {Array<Object>} annotations array of json objects from manifest
 * @param {String} motivation of the resources need to be parsed
 * @returns {Array<Object>} Array of Annotations
 */
export function parseAnnotations(annotations, motivation) {
  let content = [];
  if (!annotations) return content;
  // should be contained in an AnnotationPage
  let annotationPage = null;
  if (annotations.length) {
    annotationPage = new AnnotationPage(annotations[0], {});
  }
  if (!annotationPage) {
    return content;
  }
  let items = annotationPage.getItems();
  if (items === undefined) return content;
  for (let i = 0; i < items.length; i++) {
    let a = items[i];
    let annotation = new Annotation(a, {});
    let annoMotivation = annotation.getMotivation();
    if (annoMotivation == motivation) {
      content.push(annotation);
    }
  }
  return content;
}
