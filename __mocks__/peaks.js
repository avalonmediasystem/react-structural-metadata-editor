export const Peaks = jest.fn((opts) => {
  let peaks = {};
  peaks.options = opts;
  peaks.player = {
    seek: jest.fn((time) => {
      peaks.player._mediaElement.currentTime = time;
    }),
    play: jest.fn(() => {}),
    pause: jest.fn(() => {}),
    getCurrentTime: jest.fn(() => {
      return peaks.player._mediaElement.currentTime;
    }),
    getDuration: jest.fn(() => {
      return peaks.player._mediaElement.duration;
    }),
    _mediaElement: {
      currentTime: 0,
      duration: 1738.945306,
    },
  };
  peaks.segments = {
    getSegment: jest.fn((id) => {
      let segment = peaks.segments._segments.find((seg) => {
        return seg.id === id;
      });
      if (segment === undefined) {
        return null;
      }
      return segment;
    }),
    getSegments: jest.fn(() => {
      return peaks.segments._segments;
    }),
    removeAll: jest.fn(() => {
      peaks.segments._segments = [];
    }),
    add: jest.fn((segments) => {
      if (Array.isArray(segments)) {
        segments.forEach((segment) => {
          let seg = new Segment({ parent: peaks, ...segment });
          peaks.segments._segments.push(seg);
        });
      } else {
        let seg = new Segment({ parent: peaks, ...segments });
        peaks.segments._segments.push(seg);
        peaks.player.seek(seg.startTime);
      }
    }),
    removeById: jest.fn((id) => {
      let index = peaks.segments._segments.map((seg) => seg.id).indexOf(id);
      if (index >= 0) {
        return peaks.segments._segments.splice(index, 1);
      }
    }),
    _peaks: peaks,
    _segments: [
      new Segment({
        parent: peaks,
        startTime: 3.321,
        endTime: 10.321,
        id: '123a-456b-789c-3d',
        labelText: 'Segment 1.1',
        color: '#80A590',
      }),
      new Segment({
        parent: peaks,
        startTime: 11.231,
        endTime: 480.001,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#2A5459',
      }),
      new Segment({
        parent: peaks,
        startTime: 543.241,
        endTime: 900.001,
        id: '123a-456b-789c-8d',
        labelText: 'Segment 2.1',
        color: '#80A590',
      }),
    ],
  };
  peaks.zoom = {
    zoomIn: jest.fn(() => {}),
    zoomOut: jest.fn(() => {}),
  }
  return peaks;
});

export const Segment = jest.fn((opts) => {
  let segment = { ...opts };
  let checkProp = (newOpts, prop) => {
    if (newOpts.hasOwnProperty(prop)) {
      return true;
    }
    return false;
  };
  segment.update = jest.fn((newOpts) => {
    checkProp(newOpts, 'startTime')
      ? (segment.startTime = newOpts.startTime)
      : (segment.startTime = segment.startTime);
    checkProp(newOpts, 'endTime')
      ? (segment.endTime = newOpts.endTime)
      : (segment.endTime = segment.endTime);
    checkProp(newOpts, 'labelText')
      ? (segment.labelText = newOpts.labelText)
      : (segment.labelText = segment.labelText);
    checkProp(newOpts, 'editable')
      ? (segment.editable = newOpts.editable)
      : (segment.editable = segment.editable);
    checkProp(newOpts, 'color')
      ? (segment.color = newOpts.color)
      : (segment.color = segment.color);
  });
  return segment;
});

export default {
  init: jest.fn((opts, callback) => {
    let peaks = Peaks(opts);
    callback(null, peaks);
  }),
};
