import WaveformData from 'waveform-data';

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
}

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
    }
    alertStatus = -7;
  }
  return { opts: peaksOptions, alertStatus };
}

