import StructuralMetadataUtils from './StructuralMetadataUtils';
import {
  testSmData,
  testEmptyHeaderBefore,
  testEmptyHeaderAfter
} from '../services/testing-helpers';
import { cloneDeep } from 'lodash';

const smu = new StructuralMetadataUtils();
var testData = [];

beforeEach(() => {
  testData = cloneDeep(testSmData);
});

describe('StructuralMetadataUtils class', () => {
  test('creates a helper drop zone object for drag and drop', () => {
    const value = smu.createDropZoneObject();
    expect(value).toHaveProperty('id');
    expect(value).toHaveProperty('type', 'optional');
  });

  test('creates a helper span object', () => {
    const obj = {
      beginTime: '00:00:01',
      endTime: '00:00:02',
      timespanChildOf: '3bf42620-2321-11e9-aa56-f9563015e266',
      timespanTitle: 'Tester'
    };
    const value = smu.createSpanObject(obj);

    expect(value).toHaveProperty('id');
    expect(value).toHaveProperty('type', 'span');
    expect(value).toHaveProperty('begin', '00:00:01');
    expect(value).toHaveProperty('end', '00:00:02');
    expect(value).toHaveProperty('label', 'Tester');
  });

  describe('tests deleting list item', () => {
    test('deletes a timespan', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 1.1',
        id: '123a-456b-789c-2d',
        items: []
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[0].items[0]).toEqual({
        type: 'span',
        label: 'Segment 1.1',
        id: '123a-456b-789c-3d',
        begin: '00:00:03.32',
        end: '00:00:10.32'
      });
    });
    test('deletes a header with children', () => {
      const obj = {
        type: 'div',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: []
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.32',
            end: '00:00:10.32'
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.23',
            end: '00:08:00.00'
          }
        ]
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[0].items[0].items[0]).toEqual({
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: []
      });
    });
    test('deletes a childless header', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: []
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[1].items[0].items[0]).toEqual({
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.24',
        end: '00:15:00.00'
      });
    });
  });

  describe('tests new time overlaps existing time ranges', () => {
    var allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('time == 00:00:00.00 (before the first timespan)', () => {
      const time = '00:00:00.00';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time = 00:00:03.32 (start of the first timespan)', () => {
      const time = '00:00:03.32';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time == 00:00:05.00 (within an existing timespan)', () => {
      const time = '00:00:05.00';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeFalsy();
    });
    test('time == 00:00:10.45 (between existing timespans)', () => {
      const time = '00:00:10.45';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time == 00:15.00.00 (end of the last timespan)', () => {
      const time = '00:15.00.00';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
  });

  describe('tests new timespan overlaps existing timespans', () => {
    var allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('timespan overlapping an existing timespan', () => {
      const value = smu.doesTimespanOverlap(
        '00:00:00.00',
        '00:00:05.00',
        allSpans
      );
      expect(value).toBeTruthy();
    });
    test('timespan not overlapping an existing timespan', () => {
      const value = smu.doesTimespanOverlap(
        '00:15:00.00',
        '00:18:00.00',
        allSpans
      );
      expect(value).toBeFalsy();
    });
  });

  test('finds an item by its id', () => {
    const obj = {
      type: 'div',
      label: 'Sub-Segment 1.1',
      id: '123a-456b-789c-2d',
      items: []
    };
    const value = smu.findItem('123a-456b-789c-2d', testData);
    expect(value).toEqual(obj);
  });

  describe('finds wrapping timespans of a new timespan, ', () => {
    var allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('before first timespan', () => {
      const obj = {
        begin: '00:00:00.00',
        end: '00:00:03.32'
      };
      const expected = {
        before: null,
        after: {
          type: 'span',
          label: 'Segment 1.1',
          begin: '00:00:03.32',
          end: '00:00:10.32',
          id: '123a-456b-789c-3d'
        }
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('in between existing timespans', () => {
      const obj = {
        begin: '00:00:10.32',
        end: '00:00:11.23'
      };
      const expected = {
        before: {
          type: 'span',
          label: 'Segment 1.1',
          begin: '00:00:03.32',
          end: '00:00:10.32',
          id: '123a-456b-789c-3d'
        },
        after: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.23',
          end: '00:08:00.00'
        }
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('after last timespan', () => {
      const obj = {
        begin: '00:15:00.00',
        end: '00:20:00.00'
      };
      const expected = {
        before: {
          type: 'span',
          label: 'Segment 2.1',
          begin: '00:09:03.24',
          end: '00:15:00.00',
          id: '123a-456b-789c-8d'
        },
        after: null
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
  });

  describe('finds wrapping headers when ', () => {
    test('preceding header is empty', () => {
      const obj = {
        type: 'div',
        label: 'Scene 2',
        id: '123a-456b-789c-2d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-3d',
            begin: '00:10:00.00',
            end: '00:15:00.00'
          }
        ]
      };
      const value = smu.findWrapperHeaders(obj, testEmptyHeaderBefore);
      const expected = {
        before: {
          type: 'div',
          label: 'Scene 1',
          id: '123a-456b-789c-1d',
          items: []
        },
        after: null
      };
      expect(value).toEqual(expected);
    });
    test('succeeding header is empty', () => {
      const obj = {
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-2d',
            begin: '00:00:00.00',
            end: '00:09:00.00'
          }
        ]
      };
      const value = smu.findWrapperHeaders(obj, testEmptyHeaderAfter);
      const expected = {
        before: null,
        after: {
          type: 'div',
          label: 'Scene 2',
          id: '123a-456b-789c-3d',
          items: []
        }
      };
      expect(value).toEqual(expected);
    });
  });

  describe('finds all items for a given type', () => {
    test('type === div', () => {
      const allDivs = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d'
        },
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d'
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1.1',
          id: '123a-456b-789c-7d'
        }
      ];
      const value = smu.getItemsOfType('div', testData);
      expect(value).toHaveLength(allDivs.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d'
      });
    });
    test('type === span', () => {
      const allSpans = [
        {
          type: 'span',
          label: 'Segment 1.1',
          id: '123a-456b-789c-3d',
          begin: '00:00:03.32',
          end: '00:00:10.32'
        },
        {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.23',
          end: '00:08:00.00'
        },
        {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.24',
          end: '00:15:00.00'
        }
      ];
      const value = smu.getItemsOfType('span', testData);
      expect(value).toHaveLength(allSpans.length);
      expect(value).toContainEqual({
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.24',
        end: '00:15:00.00'
      });
    });
  });

  describe('finds parent div of a given item', () => {
    test('item is a span', () => {
      const obj = {
        type: 'span',
        label: 'Segment 1.2',
        id: '123a-456b-789c-4d',
        begin: '00:00:11.23',
        end: '00:08:00.00'
      };
      const expected = {
        type: 'div',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: []
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.32',
            end: '00:00:10.32'
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.23',
            end: '00:08:00.00'
          }
        ]
      };
      const value = smu.getParentDiv(obj, testData);
      expect(value).toEqual(expected);
    });
    test('item is a div', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: []
      };
      const expected = {
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
            begin: '00:09:03.24',
            end: '00:15:00.00'
          }
        ]
      };
      const value = smu.getParentDiv(obj, testData);
      expect(value).toEqual(expected);
    });
  });

  describe('finds valid headings when adding/editing a timespan', () => {
    test('no existing timespans', () => {
      const newSpan = { begin: '00:00:00.01', end: '00:02:00.00' };
      const wrapperSpans = {
        before: null,
        after: null
      };
      const structure = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d',
          items: [
            {
              type: 'div',
              label: 'Scene 1',
              id: '123a-456b-789c-1d',
              items: []
            },
            {
              type: 'div',
              label: 'Scene 2',
              id: '123a-456b-789c-2d',
              items: []
            }
          ]
        }
      ];
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d'
        },
        {
          type: 'div',
          label: 'Scene 1',
          id: '123a-456b-789c-1d'
        },
        {
          type: 'div',
          label: 'Scene 2',
          id: '123a-456b-789c-2d'
        }
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, structure);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d'
      });
    });
    test('wrapped by existing timespans', () => {
      const newSpan = { begin: '00:08:00.00', end: '00:09:00.00' };
      const wrapperSpans = {
        before: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.23',
          end: '00:08:00.00'
        },
        after: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.24',
          end: '00:15:00.00'
        }
      };
      const expected = [
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d'
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1.1',
          id: '123a-456b-789c-7d'
        }
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d'
      });
    });
    test('no wrapping timespans after', () => {
      const newSpan = { begin: '00:15:00.00', end: '00:16:00.00' };
      const wrapperSpans = {
        before: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.24',
          end: '00:15:00.00'
        },
        after: null
      };
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d'
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d'
        }
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d'
      });
    });
    test('no wrapping span before', () => {
      const newSpan = { begin: '00:00:00.00', end: '00:00:03.32' };
      const wrapperSpans = {
        before: null,
        after: {
          type: 'span',
          label: 'Act 1',
          id: '123a-456b-789c-3d',
          begin: '00:00:03.32',
          end: '00:00:10.32'
        }
      };
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d'
        },
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d'
        },
        {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d'
        }
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 1.1',
        id: '123a-456b-789c-2d'
      });
    });
  });

  describe('validates order of begin and end times', () => {
    test('begin time < end time', () => {
      const begin = '00:00:10.30';
      const end = '00:10:00.30';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeTruthy();
    });
    test('begin time === end time', () => {
      const begin = '00:00:10.30';
      const end = '00:00:10.30';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeFalsy();
    });
    test('begin time > end time', () => {
      const begin = '00:10:00.30';
      const end = '00:00:10.30';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeFalsy();
    });
  });

  describe('converts time in seconds to string hh:mm:ss.ss format', () => {
    test('when time is an integer', () => {
      const timeInSeconds = 540.0;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:00.00');
    });
    test('when there are decimal points', () => {
      const timeInSeconds = 543.9983255;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:03.99');
    });
    test('when decimal with zero at the end', () => {
      const timeInSeconds = 545.2;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:05.20');
    });
  });
});
