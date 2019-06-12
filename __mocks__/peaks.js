export const Peaks = jest.fn(opts => {
  let peaks = {};
  peaks.options = opts;
  peaks.player = {
    seek: jest.fn(time => {
      peaks.player._mediaElement.currentTime = time;
    }),
    getCurrentTime: jest.fn(() => {
      return peaks.player._mediaElement.currentTime;
    }),
    getDuration: jest.fn(() => {
      return peaks.player._mediaElement.duration;
    }),
    _mediaElement: {
      currentTime: 0,
      duration: 1738.945306
    }
  };
  peaks.segments = {
    getSegment: jest.fn(id => {
      let segment = peaks.segments._segments.find(seg => {
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
    add: jest.fn(segments => {
      if (Array.isArray(segments)) {
        segments.forEach(segment => {
          peaks.segments._segments.push(segment);
        });
      } else {
        peaks.segments._segments.push(segments);
      }
    }),
    removeById: jest.fn(id => {
      let index = peaks.segments._segments.map(seg => seg.id).indexOf(id);
      if (index >= 0) {
        return peaks.segments._segments.splice(index, 1);
      }
    }),
    _peaks: peaks,
    _segments: [
      {
        startTime: 3.32,
        endTime: 10.32,
        id: '123a-456b-789c-3d',
        labelText: 'Segment 1.1',
        color: '#80A590'
      },
      {
        startTime: 11.23,
        endTime: 480,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#2A5459'
      },
      {
        startTime: 543.24,
        endTime: 900,
        id: '123a-456b-789c-8d',
        labelText: 'Segment 2.1',
        color: '#80A590'
      }
    ]
  };
  return peaks;
});

export default {
  init: jest.fn(opts => {
    return Peaks(opts);
  })
};
