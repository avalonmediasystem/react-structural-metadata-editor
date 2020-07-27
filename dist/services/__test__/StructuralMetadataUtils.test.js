import StructuralMetadataUtils from '../StructuralMetadataUtils';
import {
  testSmData,
  testDataFromServer,
  testEmptyHeaderBefore,
  testEmptyHeaderAfter,
} from '../testing-helpers';
import { cloneDeep } from 'lodash';

const smu = new StructuralMetadataUtils();
let testData = [];

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
      beginTime: '00:00:011',
      endTime: '00:00:021',
      timespanChildOf: '3bf42620-2321-11e9-aa56-f9563015e266',
      timespanTitle: 'Tester',
    };
    const value = smu.createSpanObject(obj);

    expect(value).toHaveProperty('id');
    expect(value).toHaveProperty('type', 'span');
    expect(value).toHaveProperty('begin', '00:00:011');
    expect(value).toHaveProperty('end', '00:00:021');
    expect(value).toHaveProperty('label', 'Tester');
  });

  describe('tests deleting list item', () => {
    test('deletes a timespan', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 1.1',
        id: '123a-456b-789c-2d',
        items: [],
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[0].items[0]).toEqual({
        type: 'span',
        label: 'Segment 1.1',
        id: '123a-456b-789c-3d',
        begin: '00:00:03.321',
        end: '00:00:10.321',
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
            items: [],
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.321',
            end: '00:00:10.321',
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001',
          },
        ],
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[0].items[0].items[0]).toEqual({
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: [],
      });
    });
    test('deletes a childless header', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: [],
      };
      const value = smu.deleteListItem(obj.id, testData);
      expect(value).not.toContain(obj);
      expect(value[0].items[1].items[0].items[0]).toEqual({
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.241',
        end: '00:15:00.001',
      });
    });
  });

  describe('tests building the structure from structure in the server', () => {
    let structure = [];
    beforeEach(() => {
      structure = smu.buildSMUI(testDataFromServer, 1738945);
    });
    test('when time is in hh:mm:ss (00:10:42) format', () => {
      const timespan = smu.findItem('123a-456b-789c-2d', structure);
      expect(timespan.begin).toEqual('00:10:42.000');
    });
    test('when time is in hh:mm:ss.ms (00:15:00.23) format', () => {
      const timespan = smu.findItem('123a-456b-789c-2d', structure);
      expect(timespan.end).toEqual('00:15:00.230');
    });
    test('when time is in mm:ss (15:30) format', () => {
      const timespan = smu.findItem('123a-456b-789c-3d', structure);
      expect(timespan.begin).toEqual('00:15:30.000');
    });
    test('when time is in mm:ss.ms (16:00.23) format', () => {
      const timespan = smu.findItem('123a-456b-789c-3d', structure);
      expect(timespan.end).toEqual('00:16:00.230');
    });
    test('when time is in ss (42) format', () => {
      const timespan = smu.findItem('123a-456b-789c-1d', structure);
      expect(timespan.end).toEqual('00:00:42.000');
    });
    test('when time is in ss.ms (41.45) format', () => {
      const timespan = smu.findItem('123a-456b-789c-1d', structure);
      expect(timespan.begin).toEqual('00:00:41.450');
    });
    test('when end time exceeds (00:38:58.000) file duration (00:28:58.950)', () => {
      const timespan = smu.findItem('123a-456b-789c-4d', structure);
      expect(timespan.end).toEqual('00:28:58.950');
    });
    test('when end time is missing', () => {
      const timespan = smu.findItem('123a-456b-789c-5d', structure);
      expect(timespan.end).toEqual('00:28:58.950');
    });
  });

  describe('tests new time overlaps existing time ranges', () => {
    let allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('time == 00:00:00.000 (before the first timespan)', () => {
      const time = '00:00:00.000';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time = 00:00:03.321 (start of the first timespan)', () => {
      const time = '00:00:03.321';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time == 00:00:05.001 (within an existing timespan)', () => {
      const time = '00:00:05.001';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeFalsy();
    });
    test('time == 00:00:10.451 (between existing timespans)', () => {
      const time = '00:00:10.451';
      expect(smu.doesTimeOverlap(time, allSpans)).toBeTruthy();
    });
    test('time exceeds file duration', () => {
      const time = '00:39:34.000';
      expect(smu.doesTimeOverlap(time, allSpans, 1738.945306)).toBeFalsy();
    });
  });

  describe('tests new timespan overlaps existing timespans', () => {
    let allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('timespan overlapping an existing timespan', () => {
      const value = smu.doesTimespanOverlap(
        '00:00:00.000',
        '00:00:05.001',
        allSpans
      );
      expect(value).toBeTruthy();
    });
    test('timespan not overlapping an existing timespan', () => {
      const value = smu.doesTimespanOverlap(
        '00:15:00.001',
        '00:18:00.001',
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
      items: [],
    };
    const value = smu.findItem('123a-456b-789c-2d', testData);
    expect(value).toEqual(obj);
  });

  describe('finds wrapping timespans of a new timespan, ', () => {
    let allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType('span', testData);
    });
    test('before first timespan', () => {
      const obj = {
        begin: '00:00:00.000',
        end: '00:00:03.321',
      };
      const expected = {
        before: null,
        after: {
          type: 'span',
          label: 'Segment 1.1',
          begin: '00:00:03.321',
          end: '00:00:10.321',
          id: '123a-456b-789c-3d',
        },
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('in between existing timespans', () => {
      const obj = {
        begin: '00:00:10.321',
        end: '00:00:11.231',
      };
      const expected = {
        before: {
          type: 'span',
          label: 'Segment 1.1',
          begin: '00:00:03.321',
          end: '00:00:10.321',
          id: '123a-456b-789c-3d',
        },
        after: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        },
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('after last timespan', () => {
      const obj = {
        begin: '00:15:00.001',
        end: '00:20:00.001',
      };
      const expected = {
        before: {
          type: 'span',
          label: 'Segment 2.1',
          begin: '00:09:03.241',
          end: '00:15:00.001',
          id: '123a-456b-789c-8d',
        },
        after: null,
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
            begin: '00:10:00.001',
            end: '00:15:00.001',
          },
        ],
      };
      const value = smu.findWrapperHeaders(obj, testEmptyHeaderBefore);
      const expected = {
        before: {
          type: 'div',
          label: 'Scene 1',
          id: '123a-456b-789c-1d',
          items: [],
        },
        after: null,
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
            begin: '00:00:00.000',
            end: '00:09:00.001',
          },
        ],
      };
      const value = smu.findWrapperHeaders(obj, testEmptyHeaderAfter);
      const expected = {
        before: null,
        after: {
          type: 'div',
          label: 'Scene 2',
          id: '123a-456b-789c-3d',
          items: [],
        },
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
          id: '123a-456b-789c-0d',
        },
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d',
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1.1',
          id: '123a-456b-789c-7d',
        },
      ];
      const value = smu.getItemsOfType('div', testData);
      expect(value).toHaveLength(allDivs.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d',
      });
    });
    test('type === span', () => {
      const allSpans = [
        {
          type: 'span',
          label: 'Segment 1.1',
          id: '123a-456b-789c-3d',
          begin: '00:00:03.321',
          end: '00:00:10.321',
        },
        {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        },
        {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.241',
          end: '00:15:00.001',
        },
      ];
      const value = smu.getItemsOfType('span', testData);
      expect(value).toHaveLength(allSpans.length);
      expect(value).toContainEqual({
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.241',
        end: '00:15:00.001',
      });
    });
  });

  describe('finds parent div of a given item', () => {
    test('item is a span', () => {
      const obj = {
        type: 'span',
        label: 'Segment 1.2',
        id: '123a-456b-789c-4d',
        begin: '00:00:11.231',
        end: '00:08:00.001',
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
            items: [],
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.321',
            end: '00:00:10.321',
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001',
          },
        ],
      };
      const value = smu.getParentDiv(obj, testData);
      expect(value).toEqual(expected);
    });
    test('item is a div', () => {
      const obj = {
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: [],
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
      const value = smu.getParentDiv(obj, testData);
      expect(value).toEqual(expected);
    });
  });

  describe('finds valid headings when adding/editing a timespan', () => {
    test('no existing timespans', () => {
      const newSpan = { begin: '00:00:00.011', end: '00:02:00.001' };
      const wrapperSpans = {
        before: null,
        after: null,
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
              items: [],
            },
            {
              type: 'div',
              label: 'Scene 2',
              id: '123a-456b-789c-2d',
              items: [],
            },
          ],
        },
      ];
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d',
        },
        {
          type: 'div',
          label: 'Scene 1',
          id: '123a-456b-789c-1d',
        },
        {
          type: 'div',
          label: 'Scene 2',
          id: '123a-456b-789c-2d',
        },
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, structure);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
      });
    });
    test('wrapped by existing timespans', () => {
      const newSpan = { begin: '00:08:00.001', end: '00:09:00.001' };
      const wrapperSpans = {
        before: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        },
        after: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.241',
          end: '00:15:00.001',
        },
      };
      const expected = [
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d',
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1.1',
          id: '123a-456b-789c-7d',
        },
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d',
      });
    });
    test('no wrapping timespans after', () => {
      const newSpan = { begin: '00:15:00.001', end: '00:16:00.001' };
      const wrapperSpans = {
        before: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.241',
          end: '00:15:00.001',
        },
        after: null,
      };
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d',
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 2.1',
          id: '123a-456b-789c-6d',
        },
        {
          type: 'div',
          label: 'A ',
          id: '123a-456b-789c-9d',
        },
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 2.1',
        id: '123a-456b-789c-6d',
      });
    });
    test('no wrapping span before', () => {
      const newSpan = { begin: '00:00:00.000', end: '00:00:03.321' };
      const wrapperSpans = {
        before: null,
        after: {
          type: 'span',
          label: 'Act 1',
          id: '123a-456b-789c-3d',
          begin: '00:00:03.321',
          end: '00:00:10.321',
        },
      };
      const expected = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d',
        },
        {
          type: 'div',
          label: 'First segment',
          id: '123a-456b-789c-1d',
        },
        {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d',
        },
      ];
      const value = smu.getValidHeadings(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Sub-Segment 1.1',
        id: '123a-456b-789c-2d',
      });
    });
  });

  describe('get element after', () => {
    test('a timespan in the middle of the structure', () => {
      const expected = [
        {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        },
        {
          type: 'div',
          label: 'Second segment',
          id: '123a-456b-789c-5d',
          items: [
            {
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
            },
          ],
        },
        {
          type: 'div',
          label: 'A ',
          id: '123a-456b-789c-9d',
          items: [],
        },
      ];
      const currentItem = {
        type: 'span',
        label: 'Segment 1.1',
        id: '123a-456b-789c-3d',
        begin: '00:00:03.321',
        end: '00:00:10.321',
      };
      const value = smu.getItemsAfter(currentItem, testData, []);
      expect(value).toHaveLength(expected.length);
      expect(value).toEqual(expected);
    });

    test('last leaf node in the structure', () => {
      const currentItem = {
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.241',
        end: '00:15:00.001',
      };

      const expected = [
        {
          type: 'div',
          label: 'A ',
          id: '123a-456b-789c-9d',
          items: [],
        },
      ];
      const value = smu.getItemsAfter(currentItem, testData, []);
      expect(value).toHaveLength(expected.length);
      expect(value).toEqual(expected);
    });

    test('last node in the structure', () => {
      const currentItem = {
        type: 'div',
        label: 'A',
        id: '123a-456b-789c-9d',
        items: [],
      };

      const value = smu.getItemsAfter(currentItem, testData, []);
      expect(value).toHaveLength(0);
    });

    test('last leaf node of the root heading', () => {
      const structItems = {
        type: 'div',
        label: 'Title',
        id: '123a-456b-789c-0d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-1d',
            begin: '00:00:00.000',
            end: '00:09:00.001',
          },
        ],
      };
      const value = smu.getItemsAfter(structItems.items, structItems, []);
      expect(value).toHaveLength(0);
    });
  });

  describe('validates order of begin and end times', () => {
    test('begin time < end time', () => {
      const begin = '00:00:10.301';
      const end = '00:10:00.301';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeTruthy();
    });
    test('begin time === end time', () => {
      const begin = '00:00:10.301';
      const end = '00:00:10.301';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeFalsy();
    });
    test('begin time > end time', () => {
      const begin = '00:10:00.301';
      const end = '00:00:10.301';
      const value = smu.validateBeforeEndTimeOrder(begin, end);
      expect(value).toBeFalsy();
    });
  });

  describe('converts time in seconds to string hh:mm:ss.ss format', () => {
    test('when time is an integer', () => {
      const timeInSeconds = 540.001;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:00.001');
    });
    test('when there are decimal points', () => {
      const timeInSeconds = 543.9983255;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:03.998');
    });
    test('when decimal with zero at the end', () => {
      const timeInSeconds = 545.201;
      const value = smu.toHHmmss(timeInSeconds);
      expect(value).toEqual('00:09:05.201');
    });
  });
});
