import WaveformDataUtils from '../WaveformDataUtils';
import { nestedTestSmData, testSmData } from '../testing-helpers';
import Peaks from 'peaks';

const waveformUtils = new WaveformDataUtils();

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

      const value = waveformUtils.initSegments(testSmData, 1738.945);
      expect(value).toBeDefined();
      expect(value).toHaveLength(3);
      expect(value).toEqual(expected);
    });

    test('with empty structure', () => {
      const value = waveformUtils.initSegments([], 1738.945);
      expect(value).toBeDefined();
      expect(value).toHaveLength(0);
    });
  });

  describe('changes segments in Peaks instance with', () => {
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

    describe('structure without nested timespans', () => {
      beforeEach(() => {
        Peaks.init(options, (err, peaksInst) => {
          peaks = peaksInst;
        });
      });

      describe('insertTempSegment()', () => {
        test('when current time is at zero, creates a sibling timespan', () => {
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
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

        test('when current time is inside an existing segment, creates a child timespan', () => {
          peaks.player.seek(450.001);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
          expect(value.segments._segments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                startTime: 450.001,
                endTime: 480.001,
                id: 'temp-segment',
                color: '#FBB040',
                editable: true,
              }),
            ])
          );
          expect(value.player.getCurrentTime()).toEqual(450.001);
        });

        test('when current time is at the end time of an existing timespan, creates a sibling timespan', () => {
          peaks.player.seek(480.001);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
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

        test('when current time is at the begin time of an existing timespan, creates a child timespan', () => {
          peaks.player.seek(543.241);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
          expect(value.segments._segments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                startTime: 543.241,
                endTime: 603.241,
                id: 'temp-segment',
                color: '#FBB040',
                editable: true,
              }),
            ])
          );
          expect(value.player.getCurrentTime()).toEqual(543.241);
        });

        test('when current playhead time + 60, overlaps an existing segment, creates a sibling timespan', () => {
          // Suggested end time overlaps segment from 543.241 -> 900.001
          peaks.player.seek(520.001);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
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

        test('when current playhead time + 60 exceeds duration of the media file, creates a timespan that reaches duration', () => {
          peaks.player.seek(1680.001);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
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

        test('when start and end times overlaps two different timespans, creates a child timespan inside first parent', () => {
          // Start time overlaps segment from 3.321 -> 10.321, suggested end time overlaps segment from 11.231 -> 480.001
          peaks.player.seek(4.001);
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
          expect(value.segments._segments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                startTime: 4.001,
                endTime: 10.321,
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
          const value = waveformUtils.insertTempSegment(peaks, 1738.945);
          expect(value.segments._segments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                startTime: 450.001,
                endTime: 480.001,
                id: 'temp-segment',
                color: '#FBB040',
                editable: true,
              }),
            ])
          );
        });
      });

      describe('deleteSegments()', () => {
        test('deletes timespan without children', () => {
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

        test('deletes header without children', () => {
          const item = {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: [],
          };
          const value = waveformUtils.deleteSegments(item, peaks);
          expect(value.segments._segments).toHaveLength(3);
        });

        test('deletes header and its children', () => {
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

        test('deletes timespan and its children', () => {
          const item = {
            type: 'span',
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
          const neighbors = {
            previousSibling: {
              type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
              begin: '00:00:03.321', end: '00:00:10.321', valid: true,
              timeRange: { start: 3.321, end: 10.321 }
            },
            nextSibling: {
              type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
              begin: '00:09:03.241', end: '00:15:00.001', valid: true,
              timeRange: { start: 543.241, end: 900.001 }
            },
            parentTimespan: null
          };
          const value = waveformUtils.activateSegment('123a-456b-789c-4d', peaks, 932.32, neighbors);
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

        test('when making changes to time in an existing segment', () => {
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

        test('when making changes to title in an existing segment', () => {
          const clonedSegment = peaks.segments.getSegment('123a-456b-789c-4d');
          const currentState = {
            beginTime: '00:00:11.231',
            endTime: '00:08:00.001',
            timespanTitle: 'Segment 1.2 - edited',
            clonedSegment,
          };
          const value = waveformUtils.saveSegment(currentState, peaks);
          const segments = value.segments.getSegments();
          expect(segments).toHaveLength(3);
          expect(segments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                startTime: 11.231,
                endTime: 480.001,
                labelText: 'Segment 1.2 - edited',
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

    describe('structure has nested timespans', () => {
      beforeEach(() => {
        Peaks.init(options, (err, peaksInst) => {
          peaks = peaksInst;
          // Initialize peaks with segments from test data
          const segments = waveformUtils.initSegments(nestedTestSmData, 1738.945);
          // Clear any existing segments to avoid duplicates
          peaks.segments.removeAll();
          segments.forEach(segment => peaks.segments.add(segment));
        });
      });

      describe('insertTempSegment()', () => {
        describe('when current time is outside of an existing segment', () => {
          test('with suggested end time inside an existing segment', () => {
            // Start time does not overlap, but suggested end time overlaps 'Segment 2.1'
            peaks.player.seek(500.241);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
            // Creates segment at the next possible time interval
            expect(value.segments._segments).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  startTime: 500.241,
                  endTime: 540.241,
                  id: 'temp-segment',
                  color: '#FBB040',
                  editable: true,
                }),
              ])
            );
            expect(value.player.getCurrentTime()).toEqual(500.241);
          });

          test('with suggested end time covering an entire existing timespan', () => {
            // Start time does not overlap, but suggested end time fully encloses 'Segment 1.1'
            peaks.player.seek(0);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
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

          test('with suggested end time not overlapping any existing timespans', () => {
            // Suggested range is in between segments but not overlapping any
            peaks.player.seek(480.002);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
            expect(value.segments._segments).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  startTime: 480.002,
                  endTime: 540.002,
                  id: 'temp-segment',
                  color: '#FBB040',
                  editable: true,
                }),
              ])
            );
            expect(value.player.getCurrentTime()).toEqual(480.002);
          });
        });

        describe('when current time is inside a segment', () => {
          describe('with children', () => {
            test('and suggested range is between its children, creates a sibling segment to its children', () => {
              // Start time inside 'Segment 2.1', and in between its 2 children
              peaks.player.seek(604.24);
              const value = waveformUtils.insertTempSegment(peaks, 1738.945);
              // Creates a segment in between 'Segment 2.1's children
              expect(value.segments._segments).toEqual(
                expect.arrayContaining([
                  expect.objectContaining({
                    startTime: 604.24,
                    endTime: 664.24,
                    id: 'temp-segment',
                    color: '#FBB040',
                    editable: true,
                  }),
                ])
              );
              expect(value.player.getCurrentTime()).toEqual(604.24);
            });

            test('and suggested end time (+60) is inside one of its child segments', () => {
              // Start time inside 'Segment 2.1' and suggested end time is inside its child 'Segment 2.1.2'
              peaks.player.seek(680.241);
              const value = waveformUtils.insertTempSegment(peaks, 1738.945);
              // Creates a segment inside 'Segment 2.1' ending with its end time
              expect(value.segments._segments).toEqual(
                expect.arrayContaining([
                  expect.objectContaining({
                    startTime: 680.241,
                    endTime: 720.231,
                    id: 'temp-segment',
                    color: '#FBB040',
                    editable: true,
                  }),
                ])
              );
              expect(value.player.getCurrentTime()).toEqual(680.241);
            });
          });

          test('without children, creates a child segment', () => {
            // Start time inside 'Segment 1.2'
            peaks.player.seek(453.241);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
            // Creates a segment inside 'Segment 1.2'
            expect(value.segments._segments).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  startTime: 453.241,
                  endTime: 480.001,
                  id: 'temp-segment',
                  color: '#FBB040',
                  editable: true,
                }),
              ])
            );
            expect(value.player.getCurrentTime()).toEqual(453.241);
          });

          test('and suggested end time (+60) is inside its parent segment', () => {
            // Start time inside 'Segment 2.1.1' and suggested end time is inside its parent 'Segment 2.1'
            peaks.player.seek(560.00);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
            // Creates a segment inside 'Segment 2.1'
            expect(value.segments._segments).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  startTime: 560.00,
                  endTime: 600.321,
                  id: 'temp-segment',
                  color: '#FBB040',
                  editable: true,
                }),
              ])
            );
            expect(value.player.getCurrentTime()).toEqual(560.00);
          });

          test('and suggested end time (+60) is outside the current segment', () => {
            // Start time inside 'Segment 2.1' after all of its children and suggested end time is outside the segment
            peaks.player.seek(850.001);
            const value = waveformUtils.insertTempSegment(peaks, 1738.945);
            // Creates a segment inside 'Segment 2.1' ending with its end time
            expect(value.segments._segments).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  startTime: 850.001,
                  endTime: 900.001,
                  id: 'temp-segment',
                  color: '#FBB040',
                  editable: true,
                }),
              ])
            );
            expect(value.player.getCurrentTime()).toEqual(850.001);
          });
        });
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

    test('activateSegment()', () => {
      const testSegment = {
        startTime: 480.001,
        endTime: 500.001,
        editable: true,
        id: 'test-segment',
      };
      expect(peaks.segments.getSegments()).toHaveLength(3);
      peaks.segments.add(testSegment);
      const neighbors = {
        previousSibling: { timeRange: { start: 11.231, end: 480.001 } },
        nextSibling: { timeRange: { start: 543.241, end: 900.001, } },
        parentTimespan: null
      };
      let activatedPeaks = waveformUtils.activateSegment('test-segment', peaks, 1738.945, neighbors);
      expect(activatedPeaks.segments.getSegments()).toHaveLength(4);
      expect(activatedPeaks.segments.getSegment('test-segment').editable).toBeTruthy();
      expect(activatedPeaks.segments.getSegment('test-segment').color).toBe('#FBB040');
    });

    describe('validateSegment()', () => {
      let segment;
      let previousSibling, nextSibling, parentTimespan;
      const duration = 1738.945;

      beforeEach(() => {
        // Mock segment with update method without using the entire Peaks instance
        segment = {
          startTime: 100,
          endTime: 200,
          update: jest.fn(function (changes) {
            if (changes.startTime !== undefined) this.startTime = changes.startTime;
            if (changes.endTime !== undefined) this.endTime = changes.endTime;
          }),
        };
        // By default no sibling or parent timespans are present
        previousSibling = null;
        nextSibling = null;
        parentTimespan = null;
      });

      test('does nothing if no siblings or parent and times are valid', () => {
        const result = waveformUtils.validateSegment(
          segment, true, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).not.toHaveBeenCalled();
        expect(result).toBe(segment);
      });

      test('updates segment.startTime when handle is dragged before previousSibling\'s endTime', () => {
        previousSibling = { timeRange: { start: 0, end: 150 } };
        segment.startTime = 140;
        const result = waveformUtils.validateSegment(
          segment, true, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ startTime: 150 });
        expect(segment.startTime).toBe(150);
        expect(result).toBe(segment);
      });

      test('updates segment.startTime when handle is dragged before parentTimespan\'s startTime', () => {
        parentTimespan = { timeRange: { start: 120, end: 200 } };
        segment.startTime = 110;
        const result = waveformUtils.validateSegment(
          segment, true, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ startTime: 120 });
        expect(segment.startTime).toBe(120);
        expect(result).toBe(segment);
      });

      test('updates segment.startTime when handle is dragged over endTime', () => {
        segment.startTime = 250;
        const result = waveformUtils.validateSegment(
          segment, true, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ startTime: 200 });
        expect(segment.startTime).toBe(200);
        expect(result).toBe(segment);
      });

      test('updates segment.endTime when handle is dragged before startTime', () => {
        segment.startTime = 150;
        segment.endTime = 140;
        const result = waveformUtils.validateSegment(
          segment, false, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ endTime: 150 });
        expect(segment.endTime).toBe(150);
        expect(result).toBe(segment);
      });


      test('updates segment.endTime when handle is dragged after nextSibling\'s startTime', () => {
        nextSibling = { timeRange: { start: 180, end: 250 } };
        segment.endTime = 190;
        const result = waveformUtils.validateSegment(
          segment, false, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ endTime: 180 });
        expect(segment.endTime).toBe(180);
        expect(result).toBe(segment);
      });

      test('updates segment.endTime when handle is dragged after parentTimespan\'s endTime', () => {
        parentTimespan = { timeRange: { start: 90, end: 175 } };
        segment.endTime = 180;
        const result = waveformUtils.validateSegment(
          segment, false, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ endTime: 175 });
        expect(segment.endTime).toBe(175);
        expect(result).toBe(segment);
      });

      test('updates segment.endTime when handle is dragged beyond duration', () => {
        segment.endTime = 1838.945;
        const result = waveformUtils.validateSegment(
          segment, false, duration,
          { previousSibling, nextSibling, parentTimespan }
        );
        expect(segment.update).toHaveBeenCalledWith({ endTime: duration });
        expect(segment.endTime).toBe(duration);
        expect(result).toBe(segment);
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
            1738.945
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
            1738.945
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
            1738.945
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
            1738.945
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
            1738.945
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
            1738.945
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
