import WaveformData from 'waveform-data';

export const MimeTyeps = {
  mp4: 'video/mp4',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m3u8: 'application/x-mpegURL',
};

export const getMediaExtension = (url) => {
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
 * Create a dummy waveform dataset for the duration of the media file
 * This is used when a waveform is not specified in the manifest OR the
 * duration of the media file is longer than 10 minutes.
 * Waveform data calculation formula reference:
 * https://github.com/avalonmediasystem/avalon/blob/main/app/services/waveform_service.rb#L48-L72
 * @param {Number} duration of the media file in the manifest
 * @returns {Object} JSON object containing dummy waveform data
 */
export const createEmptyWaveform = (duration) => {
  const maxPeak = 1.0, minPeak = -1.0;
  const sampleRate = 44100;
  const samplesPerPixel = 512; // lowest default zoom level
  const waveformLength = 2 * Math.ceil(((sampleRate * duration) / samplesPerPixel) / 2);
  let waveformData = [];
  for(let i = 0; i < waveformLength; i++) {
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
  }
  let waveformJSON = WaveformData.create(waveform_json).toJSON();
  return waveformJSON;
}
