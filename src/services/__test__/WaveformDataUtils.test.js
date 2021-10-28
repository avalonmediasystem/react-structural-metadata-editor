import WaveformDataUtils from '../WaveformDataUtils';
import { testSmData } from '../testing-helpers';
import Peaks from 'peaks';
import { cleanup } from 'react-testing-library';

const waveformUtils = new WaveformDataUtils();

afterEach(cleanup);

describe('WaveformDataUtils class', () => {
  describe('initSegments()', () => {
    test('with non-empty structure', () => {
      const expected = [
        {
          startTime: 3.321,
          endTime: 10.321,
          labelText: 'Segment 1.1',
          id: '123a-456b-789c-3d',
          color: '#80A590',
        },
        {
          startTime: 11.231,
          endTime: 480.001,
          labelText: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          color: '#2A5459',
        },
        {
          startTime: 543.241,
          endTime: 900.001,
          labelText: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          color: '#80A590',
        },
      ];

      const value = waveformUtils.initSegments(testSmData, 1738945);
      expect(value).toBeDefined();
      expect(value).toHaveLength(3);
      expect(value).toEqual(expected);
    });

    test('with empty structure', () => {
      const value = waveformUtils.initSegments([], 1738945);
      expect(value).toBeDefined();
      expect(value).toHaveLength(0);
    });
  });

  describe('changes segments in Peaks intance when', () => {
    let peaks;
    const options = {
      container: null,
      mediaElement: null,
      dataUri: null,
      dataUriDefaultFormat: 'json',
      keyboard: true,
      _zoomLevelIndex: 0,
      _zoomLevels: [512, 1024, 2048, 4096],
    };
    beforeEach(() => {
      Peaks.init(options, (err, peaksInst) => {
        peaks = peaksInst;
      });
    });

    describe('insertTempSegment()', () => {
      test('when current time is at zero', () => {
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 0,
              endTime: 3.321,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(0);
      });
      test('when current time is in between an existing segment', () => {
        peaks.player.seek(450.001);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(480.001);
      });

      test('when current time is at the end time of an existing timespan', () => {
        peaks.player.seek(480.001);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(480.001);
      });

      test('when current time is at the begin time of an existing timespan', () => {
        peaks.player.seek(543.241);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 900.001,
              endTime: 960.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(900.001);
      });

      test('when end time of temporary segment overlaps existing segment', () => {
        peaks.player.seek(520.001);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 520.001,
              endTime: 543.241,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
        expect(value.player.getCurrentTime()).toEqual(520.001);
      });

      test('when current playhead time + 60 > duration of the media file', () => {
        peaks.player.seek(1680.001);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 1680.001,
              endTime: 1738.945,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
      });

      test('when there are multiple small segments with a length of less than 60 seconds', () => {
        peaks.segments.add({
          startTime: 1690.001,
          endTime: 1738.951,
          id: '123a-456b-789c-9d',
          color: '#2A5459',
          labelText: 'Test segment',
        });
        peaks.player.seek(450.001);
        const value = waveformUtils.insertTempSegment(peaks, 1738945);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 480.001,
              endTime: 540.001,
              id: 'temp-segment',
              color: '#FBB040',
              editable: true,
            }),
          ])
        );
      });
    });

    describe('deleteSegments()', () => {
      test('timespan', () => {
        const item = {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(2);
      });

      test('header', () => {
        const item = {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d',
          items: [],
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(3);
      });

      test('header with children', () => {
        const item = {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d',
          items: [
            {
              type: 'div',
              label: 'Sub-Segment 2.1.1',
              id: '123a-456b-789c-7d',
              items: [],
            },
            {
              type: 'span',
              label: 'Segment 2.1',
              id: '123a-456b-789c-8d',
              begin: '00:09:03.241',
              end: '00:15:00.001',
            },
          ],
        };
        const value = waveformUtils.deleteSegments(item, peaks);
        expect(value.segments._segments).toHaveLength(2);
        expect(value.segments._segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-4d',
              labelText: 'Segment 1.2',
            }),
          ])
        );
      });
    });

    describe('rebuildPeaks()', () => {
      test('when a segment is added in between existing segments', () => {
        peaks.segments.add({
          startTime: 500.001,
          endTime: 540.001,
          id: '123a-456b-789c-9d',
          labelText: 'Added segment',
        });

        const value = waveformUtils.rebuildPeaks(peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(4);
        // Tests adding color property to the new segment
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-9d',
              color: '#80A590',
            }),
          ])
        );
        // Tests changing the color of an exisiting segment to adhere to alternating colors in waveform
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-8d',
              color: '#2A5459',
            }),
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
              color: '#2A5459',
            }),
          ])
        );
      });
    });

    describe('editing timespans', () => {
      test('when a segment is activated', () => {
        const value = waveformUtils.activateSegment('123a-456b-789c-4d', peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-4d',
              editable: true,
              color: '#FBB040',
            }),
          ])
        );
      });

      test('when a segment is deactivated', () => {
        const clonedSegment = {
          startTime: 16.2,
          endTime: 38.58,
          id: '123a-456b-789c-4d',
          labelText: 'Segment 2',
          valid: true,
        };
        const value = waveformUtils.deactivateSegment(
          clonedSegment,
          true,
          peaks
        );
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '123a-456b-789c-4d',
              editable: false,
              color: '#2A5459',
            }),
          ])
        );
      });

      test('when making changes to an existing segment', () => {
        const clonedSegment = peaks.segments.getSegment('123a-456b-789c-4d');
        const currentState = {
          beginTime: '00:00:10.331',
          endTime: '00:08:00.001',
          clonedSegment,
        };
        const value = waveformUtils.saveSegment(currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 10.331,
              endTime: 480.001,
              id: '123a-456b-789c-4d',
            }),
          ])
        );
      });
    });

    describe('updateSegment()', () => {
      let segment;
      beforeEach(() => {
        segment = {
          startTime: 11.231,
          endTime: 480.001,
          id: '123a-456b-789c-4d',
          labelText: 'Segment 1.2',
          color: '#2A5459',
        };
      });
      test('after typing 00:03: (hours and minutes)', () => {
        const currentState = { beginTime: '00:03:', endTime: '00:08:00.001' };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 180.0,
              id: '123a-456b-789c-4d',
            }),
          ])
        );
      });

      test('after typing 00:03:59 (hours, minutes, and seconds)', () => {
        const currentState = { beginTime: '00:03:59', endTime: '00:08:00.001' };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 239.0,
              id: '123a-456b-789c-4d',
            }),
          ])
        );
      });

      test('after typing 00:03:59.991 (hours, minutes, seconds, and milliseconds)', () => {
        const currentState = {
          beginTime: '00:03:59.991',
          endTime: '00:08:00.001',
        };
        const value = waveformUtils.updateSegment(segment, currentState, peaks);
        const segments = value.segments.getSegments();
        expect(segments).toHaveLength(3);
        expect(segments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              startTime: 239.991,
              id: '123a-456b-789c-4d',
            }),
          ])
        );
      });
    });
  });

  describe('helpers when edititing structure', () => {
    let peaks;
    const options = {
      container: null,
      mediaElement: null,
      dataUri: null,
      dataUriDefaultFormat: 'json',
      keyboard: true,
      _zoomLevelIndex: 0,
      _zoomLevels: [512, 1024, 2048, 4096],
    };
    beforeEach(() => {
      Peaks.init(options, (err, peaksInst) => {
        peaks = peaksInst;
      });
    });
    describe('findWrapperSegments()', () => {
      let allSegments = [];
      beforeEach(() => {
        allSegments = peaks.segments.getSegments();
      });
      test('for first segment', () => {
        const currentSegment = {
          labelText: 'Segment 1.1',
          id: '123a-456b-789c-3d',
          startTime: 3.321,
          endTime: 10.321,
        };
        const { before, after } = waveformUtils.findWrapperSegments(
          currentSegment,
          peaks,
          1738.951
        );
        expect(before).toEqual(undefined);
        expect(after.id).toEqual('123a-456b-789c-4d');
      });
      test('for middle segment', () => {
        const currentSegment = {
          labelText: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          startTime: 11.231,
          endTime: 480.001,
        };
        const { before, after } = waveformUtils.findWrapperSegments(
          currentSegment,
          peaks,
          1738.951
        );
        expect(before.id).toEqual('123a-456b-789c-3d');
        expect(after.id).toEqual('123a-456b-789c-8d');
      });
      test('for last segment', () => {
        const currentSegment = {
          labelText: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          startTime: 543.241,
          endTime: 900.001,
        };
        const { before, after } = waveformUtils.findWrapperSegments(
          currentSegment,
          peaks,
          1738.951
        );
        expect(before.id).toEqual('123a-456b-789c-4d');
        expect(after).toEqual(undefined);
      });
    });

    describe('activateSegment()', () => {
      test('when start time of an editing segment overlaps segment before', () => {
        const testSegment = {
          startTime: 480.001,
          endTime: 500.001,
          editable: true,
          id: 'test-segment',
          color: '#FBB040',
        };
        peaks.segments.add(testSegment);
        let activatedPeaks = waveformUtils.activateSegment(
          'test-segment',
          peaks
        );
        // Change start time to overlap with previous segment
        let activatedSegment =
          activatedPeaks.segments.getSegment('test-segment');
        activatedSegment.startTime = 479.001;
        const value = waveformUtils.validateSegment(
          activatedSegment,
          true,
          activatedPeaks,
          1738945
        );
        expect(value.startTime).toEqual(480.001);
        expect(value.endTime).toEqual(500.001);
      });

      test('when end time of an editing segment overlaps segment after', () => {
        const testSegment = {
          startTime: 490.991,
          endTime: 540.001,
          editable: true,
          id: 'test-segment',
          color: '#FBB040',
        };
        peaks.segments.add(testSegment);
        let activatedPeaks = waveformUtils.activateSegment(
          'test-segment',
          peaks
        );
        // Change end time to overlap with following segment
        let activatedSegment =
          activatedPeaks.segments.getSegment('test-segment');
        activatedSegment.endTime = 543.251;
        const value = waveformUtils.validateSegment(
          activatedSegment,
          false,
          activatedPeaks,
          1738945
        );
        expect(value.startTime).toEqual(490.991);
        expect(value.endTime).toEqual(543.241);
      });

      test('when a segment does not overlap neighboring segments', () => {
        const testSegment = {
          startTime: 499.991,
          endTime: 529.991,
          editable: true,
          id: 'test-segment',
          color: '#FBB040',
        };
        peaks.segments.add(testSegment);
        let activatedPeaks = waveformUtils.activateSegment(
          'test-segment',
          peaks,
          1738945
        );
        // Change end time of the segment
        let activatedSegment =
          activatedPeaks.segments.getSegment('test-segment');
        activatedSegment.endTime = 540.991;
        const value = waveformUtils.validateSegment(
          activatedSegment,
          false,
          activatedPeaks,
          1738945
        );
        expect(value.startTime).toEqual(499.991);
        expect(value.endTime).toEqual(540.991);
      });

      test('when a segment overlaps the end time of the media file', () => {
        const testSegment = {
          startTime: 1200.991,
          endTime: 1699.991,
          editable: true,
          id: 'test-segment',
          color: '#FBB040',
        };
        peaks.segments.add(testSegment);
        let activatedPeaks = waveformUtils.activateSegment(
          'test-segment',
          peaks,
          1738945
        );
        // Change the end time to exceed the end time of the media file
        let activatedSegment =
          activatedPeaks.segments.getSegment('test-segment');
        activatedSegment.endTime = 1740.001;
        const value = waveformUtils.validateSegment(
          activatedSegment,
          false,
          activatedPeaks,
          1738945
        );
        expect(value.startTime).toEqual(1200.991);
        expect(value.endTime).toEqual(1738.945);
      });

      test('when there is a segment going until the end of the file over an existing segment', () => {
        const testSegment = {
          startTime: 540.001,
          endTime: 1738.945,
          editable: true,
          id: 'test-segment',
          color: '#FBB040',
        };
        peaks.segments.add(testSegment);
        let activatedPeaks = waveformUtils.activateSegment(
          'test-segment',
          peaks
        );
        // Change the start time of the segment
        let activatedSegment =
          activatedPeaks.segments.getSegment('test-segment');
        activatedSegment.startTime = 541.431;
        const value = waveformUtils.validateSegment(
          activatedSegment,
          true,
          activatedPeaks,
          1738945
        );
        expect(value.startTime).toEqual(541.431);
        expect(value.endTime).toEqual(543.241);
      });
    });

    describe('addTempInvalidSegment()', () => {
      describe('when startTime > duration', () => {
        test('for first timespan', () => {
          const testTimespan = {
            begin: '00:29:02.999',
            end: '00:30:00.000',
            id: '123a-456b-789c-11d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: null,
            nextSpan: { begin: '00:03:04.324', end: '00:09:05.000' },
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-11d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-11d');
          expect(tempSegment.startTime).toEqual(0);
          expect(tempSegment.endTime).toEqual(184.324);
        });

        test('for a middle timespan', () => {
          const testTimespan = {
            begin: '00:29:02.999',
            end: '00:30:00.000',
            id: '123a-456b-789c-11d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: { begin: '00:03:04.324', end: '00:09:05.000' },
            nextSpan: { begin: '00:10:04.324', end: '00:11:05.000' },
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-11d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-11d');
          expect(tempSegment.startTime).toEqual(545);
          expect(tempSegment.endTime).toEqual(604.324);
        });

        test('for last timespan', () => {
          const testTimespan = {
            begin: '00:29:02.999',
            end: '00:30:00.000',
            id: '123a-456b-789c-11d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: { begin: '00:03:04.324', end: '00:09:05.000' },
            nextSpan: null,
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-11d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-11d');
          expect(tempSegment.startTime).toEqual(545);
          expect(tempSegment.endTime).toEqual(1738.945);
        });
      });

      describe('when startTime > endTime', () => {
        test('for first timespan', () => {
          const testTimespan = {
            begin: '00:00:02.999',
            end: '00:00:00.000',
            id: '123a-456b-789c-11d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: null,
            nextSpan: { begin: '00:03:09.000', end: '00:05:00.000' },
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-11d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-11d');
          expect(tempSegment.startTime).toEqual(0);
          expect(tempSegment.endTime).toEqual(189.0);
        });

        test('for a middle timespan', () => {
          const testTimespan = {
            begin: '00:02:24.000',
            end: '00:02:06.234',
            id: '123a-456b-789c-10d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: { begin: '00:03:09.000', end: '00:05:00.000' },
            nextSpan: { begin: '00:06:00.003', end: '00:08:05.000' },
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-10d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-10d');
          expect(tempSegment.startTime).toEqual(300.0);
          expect(tempSegment.endTime).toEqual(360.003);
        });

        test('for last timespan', () => {
          const testTimespan = {
            begin: '00:16:24.000',
            end: '00:14:06.234',
            id: '123a-456b-789c-10d',
            label: 'Invalid Timespan',
            type: 'span',
            valid: false,
          };
          const wrapperSpans = {
            prevSpan: { begin: '00:09:09.000', end: '00:10:00.000' },
            nextSpan: null,
          };
          const value = waveformUtils.addTempInvalidSegment(
            testTimespan,
            wrapperSpans,
            peaks,
            1738945
          );
          expect(value.segments.getSegment('123a-456b-789c-10d')).toBeDefined();
          const tempSegment = value.segments.getSegment('123a-456b-789c-10d');
          expect(tempSegment.startTime).toEqual(600.0);
          expect(tempSegment.endTime).toEqual(1738.945);
        });
      });
    });
  });
});
