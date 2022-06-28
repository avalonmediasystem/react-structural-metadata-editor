import { parseManifest } from "manifesto.js";

export function getMediaInfo(manifest) {
  let canvas;
  let mediaInfo = {};
  try {
    canvas = parseManifest(manifest)
      .getSequences()[0]
      .getCanvases()[0];
    const sources = canvas.getContent()[0].getBody();
    mediaInfo.mediaSrc = filterMediaSrc(sources);
    mediaInfo.duration = canvas.getDuration();
  } catch (err) {
    console.log('Error fetching resources, ', err);
    return { error: 'Error fetching stream files' };
  }

  return mediaInfo;

}

function filterMediaSrc(sources) {
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
        console.log(src.id);
        srcId = src.id;
      }
    });
    return srcId;
  }
}

export function getManifestStructure(manifest) {
  const structure = parseManifest(manifest).getStructure();
  return structure;
}