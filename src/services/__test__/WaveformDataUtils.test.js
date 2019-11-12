import WaveformDataUtils from '../WaveformDataUtils';
import { testSmData } from '../testing-helpers';
import Peaks from 'peaks';
import { cleanup } from 'react-testing-library';

const waveformUtils = new WaveformDataUtils();

afterEach(cleanup);

describe('WaveformDataUtils class', () => {
  test('initializes peaks segments with empty metadata structure', () => {
    const value = waveformUtils.initSegments([], {});
    expect(value).toBeDefined();
    expect(value).toEqual([]);
  });

  test('initializes peaks segments with metadata structure', () => {
    const expected = [
      {
        startTime: 3.321,
        endTime: 10.321,
        labelText: 'Segment 1.1',
        id: '123a-456b-789c-3d',
        color: '#80A590'
      },
      {
        startTime: 11.231,
        endTime: 480.001,
        labelText: 'Segment 1.2',
        id: '123a-456b-789c-4d',
        color: '#2A5459'
      },
      {
        startTime: 543.241,
        endTime: 900.001,
        labelText: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        color: '#80A590'
      }
    ];

    const value = waveformUtils.initSegments(testSmData);
    expect(value).toBeDefined();
    expect(value).toHaveLength(3);
    expect(value).toEqual(expected);
  });

  describe('tests util functions for Waveform manipulations', () => {
    let peaks;
    const options = {
      container: null,
      mediaElement: null,
      dataUri: null,
      dataUriDefaultFormat: 'json',
      keyboard: true,
      _zoomLevelIndex: 0,
      _zoomLevels: [512, 1024, 2048, 4096]
    };
    beforeEach(() => {
      peaks = Peaks.init(options);
    });

    describe('tests inserting temporary segment', () => {
      test('when current time is at zero', () => {
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 0,
              endTime: 3.321,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(0);
      });
      test('when current time is in between an existing segment', () => {
        peaks.player.seek(450.001);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(480.001);
      });

      test('when current time is at the end time of an existing timespan', () => {
        peaks.player.seek(480.001);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(480.001);
      });

      test('when current time is at the begin time of an existing timespan', () => {
        peaks.player.seek(543.241);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 900.001,
              endTime: 960.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(900.001);
      });

      test('when end time of temporary segment overlaps existing segment', () => {
        peaks.player.seek(520.001);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 520.001,
              endTime: 543.241,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(520.001);
      });

      test('when current playhead time + 60 > duration of the media file', () => {
        peaks.player.seek(1680.001);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 1680.001,
              endTime: 1738.945,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
      });

      test('when there are multiple small segments with a length of less than 60 seconds', () => {
        peaks.segments.add({
          startTime: 1690.001,
          endTime: 1738.951,
          id: '123a-456b-789c-9d',
          color: '#2A5459',
          labelText: 'Test segment'
        });
        peaks.player.seek(450.001);
        const value = waveformUtils.insertTempSegment(peaks);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true
            })
          ])
        );
      });
    });

    describe('deletes segments when structure metadata items are deleted', () => {
      test('deleting a timespan', () => {
        const item = {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001'
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(2);
      });

      test('deleting a childless header', () => {
        const item = {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d',
          items: []
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(3);
      });

      test('deleting a header with children', () => {
        const item = {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d',
          items: [
            {
              type: 'div',
              label: 'Sub-Segment 2.1.1',
              id: '123a-456b-789c-7d',
              items: []
            },
            {
              type: 'span',
              label: 'Segment 2.1',
              id: '123a-456b-789c-8d',
              begin: '00:09:03.241',
              end: '00:15:00.001'
            }
          ]
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(2);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-4d',
              labelText: 'Segment 1.2'
            })
          ])
        );
      });
    });

    describe('rebuilds waveform', () => {
      test('when a segment is added in between existing segments', () => {
        peaks.segments.add({
          startTime: 500.001,
          endTime: 540.001,
          id: '123a-456b-789c-9d',
          labelText: 'Added segment'
        });

        const value = waveformUtils.rebuildPeaks(peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(4);
        // Tests adding color property to the new segment
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-9d',
              color: '#80A590'
            })
          ])
        );
        // Tests changing the color of an exisiting segment to adhere to alternating colors in waveform
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-8d',
              color: '#2A5459'
            })
          ])
        );
      });
      test('when a segment is deleted', () => {
        peaks.segments.removeById('123a-456b-789c-4d');
        const value = waveformUtils.rebuildPeaks(peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(2);
        // Tests changing the color of an exisiting segment to adhere to alternating colors in waveform
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-8d',
              color: '#2A5459'
            })
          ])
        );
      });
    });

    test('activates a segment', () => {
      const value = waveformUtils.activateSegment('123a-456b-789c-4d', peaks);
      const segments = value.segments.getSegments();
      expect(segments).toHaveLength(3);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '123a-456b-789c-4d',
            editable: true,
            color: '#FBB040'
          })
        ])
      );
    });

    test('deactivates a segment', () => {
      const value = waveformUtils.deactivateSegment('123a-456b-789c-4d', peaks);
      const segments = value.segments.getSegments();
      expect(segments).toHaveLength(3);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '123a-456b-789c-4d',
            editable: false,
            color: '#2A5459'
          })
        ])
      );
    });

    test('saves changes to an existing segment', () => {
      const clonedSegment = peaks.segments.getSegment('123a-456b-789c-4d');
      const currentState = {
        beginTime: '00:00:10.331',
        endTime: '00:08:00.001',
        clonedSegment
      };
      const value = waveformUtils.saveSegment(currentState, peaks);
      const segments = value.segments.getSegments();
      expect(segments).toHaveLength(3);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            startTime: 10.331,
            endTime: 480.001,
            id: '123a-456b-789c-4d'
          })
        ])
      );
    });

    describe('updates a segment when editing a timespan', () => {
      let segment;
      beforeEach(() => {
        segment = {
          startTime: 11.231,
          endTime: 480.001,
          id: '123a-456b-789c-4d',
          labelText: 'Segment 1.2',
          color: '#2A5459'
        };
      });
      test('start time = 00:03:', () => {
        const currentState = { beginTime: '00:03:', endTime: '00:08:00.001' };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 180.000,
              id: '123a-456b-789c-4d'
            })
          ])
        );
      });

      test('start time = 00:03:59', () => {
        const currentState = { beginTime: '00:03:59', endTime: '00:08:00.001' };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 239.000,
              id: '123a-456b-789c-4d'
            })
          ])
        );
      });

      test('start time = 00:03:59.991', () => {
        const currentState = {
          beginTime: '00:03:59.991',
          endTime: '00:08:00.001'
        };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 239.991,
              id: '123a-456b-789c-4d'
            })
          ])
        );
      });
    });

    describe('prevents overlapping with existing segments', () => {
      test('when start time of an editing segment overlaps segment before', () => {
        const testSegment = {
          startTime: 480.001,
          endTime: 500.001,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        };
        peaks.segments.add(testSegment);
        // Change start time to overlap with previous segment
        testSegment.startTime = 479.001;
        const value = waveformUtils.validateSegment(testSegment, peaks);
        expect(value).toEqual({
          startTime: 480.001,
          endTime: 500.001,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        });
      });

      test('when end time of an editing segment overlaps segment after', () => {
        const testSegment = {
          startTime: 490.991,
          endTime: 540.001,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        };
        peaks.segments.add(testSegment);
        // Change end time to overlap with following segment
        testSegment.endTime = 543.251;
        const value = waveformUtils.validateSegment(testSegment, peaks);
        expect(value).toEqual({
          startTime: 490.991,
          endTime: 543.241,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        });
      });

      test('when a segment does not overlap neighboring segments', () => {
        const testSegment = {
          startTime: 499.991,
          endTime: 529.991,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        };
        peaks.segments.add(testSegment);
        // Change end time of the segment
        testSegment.endTime = 540.991;
        const value = waveformUtils.validateSegment(testSegment, peaks);
        expect(value).toEqual({
          startTime: 499.991,
          endTime: 540.991,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        });
      });

      test('when a segment overlaps the end time of the media file', () => {
        const testSegment = {
          startTime: 1200.991,
          endTime: 1699.991,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        };
        peaks.segments.add(testSegment);
        // Change the end time to exceed the end time of the media file
        testSegment.endTime = 1740.001;
        const value = waveformUtils.validateSegment(testSegment, peaks);
        expect(value).toEqual({
          startTime: 1200.991,
          endTime: 1738.945,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        });
      });

      test('when there is a segment going until the end of the file over an existing segment', () => {
        const testSegment = {
          startTime: 540.001,
          endTime: 1738.945,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        };
        peaks.segments.add(testSegment);
        // Change the start time of the segment
        testSegment.startTime = 541.431;
        const value = waveformUtils.validateSegment(testSegment, peaks);
        expect(value).toEqual({
          startTime: 541.431,
          endTime: 543.241,
          editable: true,
          id: 'test-segment',
          color: '#FBB040'
        });
      });
    });
  });
});