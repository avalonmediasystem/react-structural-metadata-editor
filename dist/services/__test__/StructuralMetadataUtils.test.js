import StructuralMetadataUtils from '../StructuralMetadataUtils';
import {
  testSmData,
  testDataFromServer,
  testEmptyHeaderBefore,
  testEmptyHeaderAfter,
  testInvalidData,
  nestedTestSmData,
} from '../testing-helpers';
import { cloneDeep } from 'lodash';

const smu = new StructuralMetadataUtils();
let testData = [];

beforeEach(() => {
  testData = cloneDeep(testSmData);
});

describe('StructuralMetadataUtils class', () => {
  test('createDropZoneObject()', () => {
    const value = smu.createDropZoneObject();
    expect(value).toHaveProperty('id');
    expect(value).toHaveProperty('type', 'optional');
  });

  describe('createSpanObject()', () => {
    const obj = {
      beginTime: '00:00:011',
      endTime: '00:00:021',
      timespanChildOf: '3bf42620-2321-11e9-aa56-f9563015e266',
      timespanTitle: 'Tester',
    };
    test('with default value for nestedSpan', () => {
      const value = smu.createSpanObject(obj);

      expect(value).toHaveProperty('id');
      expect(value).toHaveProperty('type', 'span');
      expect(value).toHaveProperty('begin', '00:00:011');
      expect(value).toHaveProperty('end', '00:00:021');
      expect(value).toHaveProperty('label', 'Tester');
      expect(value).toHaveProperty('items', []);
      expect(value).toHaveProperty('timeRange', { start: 11, end: 21 });
      expect(value).toHaveProperty('nestedSpan', false);
    });

    test('with nestedSpan=true', () => {
      const value = smu.createSpanObject(obj, true);

      expect(value).toHaveProperty('id');
      expect(value).toHaveProperty('type', 'span');
      expect(value).toHaveProperty('begin', '00:00:011');
      expect(value).toHaveProperty('end', '00:00:021');
      expect(value).toHaveProperty('label', 'Tester');
      expect(value).toHaveProperty('items', []);
      expect(value).toHaveProperty('timeRange', { start: 11, end: 21 });
      expect(value).toHaveProperty('nestedSpan', true);
    });
  });

  describe('deleteListItem()', () => {
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
        valid: true,
        timeRange: { start: 3.321, end: 10.321 }
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
        valid: true,
        timeRange: { start: 543.241, end: 900.001 }
      });
    });
  });

  describe('buildSMUI()', () => {
    describe('for valid items', () => {
      let structure = [];
      beforeEach(() => {
        const { newSmData } = smu.buildSMUI(testDataFromServer, 1738.945);
        structure = newSmData;
      });
      test('when time is in hh:mm:ss (00:10:42) format', () => {
        const timespan = smu.findItem('123a-456b-789c-2d', structure);
        expect(timespan.begin).toEqual('00:10:42.000');
        expect(timespan.valid).toBeTruthy();
      });
      test('when time is in hh:mm:ss.ms (00:15:00.23) format', () => {
        const timespan = smu.findItem('123a-456b-789c-2d', structure);
        expect(timespan.end).toEqual('00:15:00.230');
        expect(timespan.valid).toBeTruthy();
      });
      test('when time is in mm:ss (15:30) format', () => {
        const timespan = smu.findItem('123a-456b-789c-3d', structure);
        expect(timespan.begin).toEqual('00:15:30.000');
        expect(timespan.valid).toBeTruthy();
      });
      test('when time is in mm:ss.ms (16:00.23) format', () => {
        const timespan = smu.findItem('123a-456b-789c-3d', structure);
        expect(timespan.end).toEqual('00:16:00.230');
        expect(timespan.valid).toBeTruthy();
      });
      test('when time is in ss (42) format', () => {
        const timespan = smu.findItem('123a-456b-789c-1d', structure);
        expect(timespan.end).toEqual('00:00:42.000');
        expect(timespan.valid).toBeTruthy();
      });
      test('when time is in ss.ms (41.45) format', () => {
        const timespan = smu.findItem('123a-456b-789c-1d', structure);
        expect(timespan.begin).toEqual('00:00:41.450');
        expect(timespan.valid).toBeTruthy();
      });
      test('when end time exceeds (00:38:58.000) file duration (00:28:58.945)', () => {
        const timespan = smu.findItem('123a-456b-789c-4d', structure);
        expect(timespan.end).toEqual('00:28:58.945');
        expect(timespan.valid).toBeTruthy();
      });
      test('when end time is missing', () => {
        const timespan = smu.findItem('123a-456b-789c-5d', structure);
        expect(timespan.end).toEqual('00:28:58.945');
        expect(timespan.valid).toBeTruthy();
      });
    });

    describe('for invalid items', () => {
      test('when begin > end', () => {
        const { newSmData } = smu.buildSMUI(testInvalidData, 1738.945);
        const timespan = smu.findItem('123a-456b-789c-5d', newSmData);
        expect(timespan.valid).toBeFalsy();
      });
    });
  });

  test('findItem()', () => {
    const obj = {
      type: 'div',
      label: 'Sub-Segment 1.1',
      id: '123a-456b-789c-2d',
      items: [],
    };
    const value = smu.findItem('123a-456b-789c-2d', testData);
    expect(value).toEqual(obj);
  });

  describe('findWrapperSpans(), ', () => {
    let allSpans = [];
    beforeEach(() => {
      allSpans = smu.getItemsOfType(['span'], testData);
    });
    test('for first timespan', () => {
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
          valid: true,
          timeRange: { start: 3.321, end: 10.321 }
        },
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('for a timespan in between existing timespans', () => {
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
          valid: true,
          timeRange: { start: 3.321, end: 10.321 }
        },
        after: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
          valid: true,
          timeRange: { start: 11.231, end: 480.001 }
        },
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
    test('for last timespan', () => {
      const obj = {
        begin: '00:15:00.001',
        end: '00:20:00.001',
        timeRange: { start: 900.001, end: 1200.001 }
      };
      const expected = {
        before: {
          type: 'span',
          label: 'Segment 2.1',
          begin: '00:09:03.241',
          end: '00:15:00.001',
          id: '123a-456b-789c-8d',
          valid: true,
          timeRange: { start: 543.241, end: 900.001 }
        },
        after: null,
      };
      const value = smu.findWrapperSpans(obj, allSpans);
      expect(value).toEqual(expected);
    });
  });

  describe('findWrapperHeaders()', () => {
    test('when preceding header is empty', () => {
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
    test('when succeeding header is empty', () => {
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

  describe('getItemsOfType()', () => {
    const allDivs = [
      { type: 'div', label: 'Title', id: '123a-456b-789c-0d' },
      { type: 'div', label: 'First segment', id: '123a-456b-789c-1d' },
      { type: 'div', label: 'Sub-Segment 1.1', id: '123a-456b-789c-2d' },
      { type: 'div', label: 'Second segment', id: '123a-456b-789c-5d' },
      { type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d' },
      { type: 'div', label: 'Sub-Segment 2.1.1', id: '123a-456b-789c-7d' },
    ];
    const allSpans = [
      {
        type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
        begin: '00:00:03.321', end: '00:00:10.321',
        valid: true,
        timeRange: { start: 3.321, end: 10.321 }
      },
      {
        type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
        begin: '00:00:11.231', end: '00:08:00.001',
        valid: true,
        timeRange: { start: 11.231, end: 480.001 }
      },
      {
        type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
        begin: '00:09:03.241', end: '00:15:00.001',
        valid: true,
        timeRange: { start: 543.241, end: 900.001 }
      },
    ];
    test('itemTypes = []', () => {
      const value = smu.getItemsOfType([], testData);
      expect(value).toEqual([]);
    });

    test('itemTypes = [\'root\']', () => {
      const value = smu.getItemsOfType(['root'], testData);
      expect(value).toHaveLength(1);
      expect(value).toContainEqual({
        type: 'root', label: 'Ima Title', id: '123a-456b-789c-0d'
      });
    });

    test('itemTypes = [\'div\']', () => {
      const value = smu.getItemsOfType(['div'], testData);
      expect(value).toHaveLength(allDivs.length);
      expect(value).toContainEqual({
        type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d'
      });
    });

    test('itemTypes = [\'span\']', () => {
      const value = smu.getItemsOfType(['span'], testData);
      expect(value).toHaveLength(allSpans.length);
      expect(value).toContainEqual({
        type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
        begin: '00:09:03.241', end: '00:15:00.001',
        valid: true,
        timeRange: { start: 543.241, end: 900.001 }
      });
    });

    test('itemTypes = [\'div\', \'span\']', () => {
      const value = smu.getItemsOfType(['span', 'div'], testData);
      expect(value).toHaveLength(allSpans.length + allDivs.length);
      expect(value).toContainEqual({
        type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
        begin: '00:09:03.241', end: '00:15:00.001',
        valid: true,
        timeRange: { start: 543.241, end: 900.001 }
      });
      expect(value).toContainEqual({
        type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d'
      });
    });
  });

  describe('getParentItem()', () => {
    test('when item is a span', () => {
      const obj = {
        type: 'span',
        label: 'Segment 1.2',
        id: '123a-456b-789c-4d',
        begin: '00:00:11.231',
        end: '00:08:00.001',
        timeRange: { start: 11.231, end: 480.001 }
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
            valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001',
            valid: true,
            timeRange: { start: 11.231, end: 480.001 }
          },
        ],
      };
      const value = smu.getParentItem(obj, testData);
      expect(value).toEqual(expected);
    });
    test('when item is a div', () => {
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
            valid: true,
            timeRange: { start: 543.241, end: 900.001 }
          },
        ],
      };
      const value = smu.getParentItem(obj, testData);
      expect(value).toEqual(expected);
    });
  });

  describe('getValidParents()', () => {
    test('when there are no timespans', () => {
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
      const value = smu.getValidParents(newSpan, wrapperSpans, structure);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
      });
    });

    test('when new timespan is wrapped by existing timespans', () => {
      const newSpan = { begin: '00:08:00.001', end: '00:09:00.001' };
      const wrapperSpans = {
        before: { type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d' },
        after: { type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d' },
      };
      const expected = [
        { type: 'div', label: 'First segment', id: '123a-456b-789c-1d' },
        { type: 'div', label: 'Second segment', id: '123a-456b-789c-5d' },
        { type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d' },
        { type: 'div', label: 'Sub-Segment 2.1.1', id: '123a-456b-789c-7d' },
      ];
      const value = smu.getValidParents(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({ type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d' });
    });

    test('when there are no timespans after the new timespan', () => {
      const newSpan = { begin: '00:15:00.001', end: '00:16:00.001' };
      const wrapperSpans = {
        before: { type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d' },
        after: null,
      };
      const expected = [
        { type: 'div', label: 'Title', id: '123a-456b-789c-0d' },
        { type: 'div', label: 'Second segment', id: '123a-456b-789c-5d' },
        { type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d' },
        { type: 'div', label: 'A ', id: '123a-456b-789c-9d' },
      ];
      const value = smu.getValidParents(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({ type: 'div', label: 'Sub-Segment 2.1', id: '123a-456b-789c-6d' });
    });

    test('when there are no timespans before the new timespan', () => {
      const newSpan = { begin: '00:00:00.000', end: '00:00:03.321' };
      const wrapperSpans = {
        before: null,
        after: { type: 'span', label: 'Act 1', id: '123a-456b-789c-3d' },
      };
      const expected = [
        { type: 'div', label: 'Title', id: '123a-456b-789c-0d' },
        { type: 'div', label: 'First segment', id: '123a-456b-789c-1d' },
        { type: 'div', label: 'Sub-Segment 1.1', id: '123a-456b-789c-2d' },
      ];
      const value = smu.getValidParents(newSpan, wrapperSpans, testData);
      expect(value).toHaveLength(expected.length);
      expect(value).toContainEqual({ type: 'div', label: 'Sub-Segment 1.1', id: '123a-456b-789c-2d' });
    });

    describe('when new timespan has a parent timespan', () => {
      test('without sibling headings', () => {
        const parentTimespan = nestedTestSmData[0].items[1].items[0].items[0];
        const newSpan = { begin: '00:10:00.321', end: '00:11:00.321' };
        const wrapperSpans = {
          before: { type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d' },
          after: { type: 'span', label: 'Segment 2.1.2', id: '123a-456b-789c-8d' },
        };

        const value = smu.getValidParents(newSpan, wrapperSpans, nestedTestSmData, parentTimespan);
        expect(value).toHaveLength(1);
        expect(value.map(h => h.id)).toContain('123a-456b-789c-6d');
      });

      describe('with a sibling heading', () => {
        // Get a copy of the parent timeppan to modify as needed
        const parentTimespan = cloneDeep(nestedTestSmData[0].items[1].items[0].items[0]);
        beforeEach(() => {
          parentTimespan.items.splice(0, 0, {
            type: 'div', label: 'New Sub-segment Title Before', id: 'new-title-before',
          });
        });

        test('next to the new timespan', () => {
          const newSpan = { begin: '00:09:00.241', end: '00:09:10.241' };
          const wrapperSpans = {
            before: null,
            after: { type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d' }
          };

          const value = smu.getValidParents(newSpan, wrapperSpans, nestedTestSmData, parentTimespan);
          expect(value).toHaveLength(2);
          // Have both parent and sibling heading as valid parents
          expect(value.map(h => h.id)).toContain('123a-456b-789c-6d');
          expect(value.map(h => h.id)).toContain('new-title-before');
        });

        test('before previous sibling timespan (out of order)', () => {
          const newSpan = { begin: '00:10:00.321', end: '00:11:00.321' };
          const wrapperSpans = {
            before: { type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d' },
            after: { type: 'span', label: 'Segment 2.1.2', id: '123a-456b-789c-8d' },
          };

          const value = smu.getValidParents(newSpan, wrapperSpans, nestedTestSmData, parentTimespan);
          // Only have the parent timespan as a valid parent
          expect(value).toHaveLength(1);
          expect(value.map(h => h.id)).toContain('123a-456b-789c-6d');
        });

        test('after next sibling timespan (out of order)', () => {
          const newSpan = { begin: '00:10:00.321', end: '00:11:00.321' };
          const wrapperSpans = {
            before: { type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d' },
            after: { type: 'span', label: 'Segment 2.1.2', id: '123a-456b-789c-8d' },
          };
          // Add a title item to the end of the children list
          parentTimespan.items.push({ type: 'div', label: 'New Sub-segment Title After', id: 'new-title-after' });

          const value = smu.getValidParents(newSpan, wrapperSpans, nestedTestSmData, parentTimespan);
          // Only have parent timespan as a valid parent
          expect(value).toHaveLength(1);
          expect(value.map(h => h.id)).toContain('123a-456b-789c-6d');
        });
      });
    });
  });

  describe('getItemsAfter()', () => {
    test('a timespan in the middle of the structure', () => {
      const expected = [
        {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
          valid: true,
          timeRange: { start: 11.231, end: 480.001 }
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
                  valid: true,
                  timeRange: { start: 543.241, end: 900.001 }
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

  describe('validateBeforeEndTimeOrder()', () => {
    test('begin time < end time', () => {
      const value = smu.validateBeforeEndTimeOrder(
        '00:00:10.301',
        '00:10:00.301'
      );
      expect(value).toBeTruthy();
    });
    test('begin time === end time', () => {
      const value = smu.validateBeforeEndTimeOrder(
        '00:00:10.301',
        '00:00:10.301'
      );
      expect(value).toBeFalsy();
    });
    test('begin time > end time', () => {
      const value = smu.validateBeforeEndTimeOrder(
        '00:10:00.301',
        '00:00:10.301'
      );
      expect(value).toBeFalsy();
    });
    test('begin time is null', () => {
      const value = smu.validateBeforeEndTimeOrder(null, '00:00:10.301');
      expect(value).toBeTruthy();
    });
  });

  describe('toHHmmss()', () => {
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

  describe('determineDropTargets()', () => {
    test('handles null dragSource', () => {
      const originalData = cloneDeep(testData);
      // Returns the input testData
      expect(smu.determineDropTargets(null, testData)).toEqual(testData);
      // Original data remains unchanged
      expect(testData).toEqual(originalData);
    });

    test('handles undefined dragSource', () => {
      const originalData = cloneDeep(testData);
      // Returns the input testData
      expect(smu.determineDropTargets(undefined, testData)).toEqual(testData);
      // Original data remains unchanged
      expect(testData).toEqual(originalData);
    });

    test('handles empty allItems array', () => {
      const dragSource = { id: 'test-id', type: 'span', label: 'Test Span' };
      expect(smu.determineDropTargets(dragSource, [])).toEqual([]);
    });

    describe('for non-nested structure', () => {
      test('creates a drop-zone at grand-parent level for first child span', () => {
        // First child timespan under 'First segment' div
        const dragSource = {
          id: '123a-456b-789c-3d', type: 'span', label: 'Segment 1.1',
          begin: '00:00:03.321', end: '00:00:10.321',
          valid: true, nestedSpan: false,
          timeRange: { start: 3.321, end: 10.321 },
        };

        const result = smu.determineDropTargets(dragSource, testData);

        // Adds drop-zone before parent in grandparent
        const rootItem = result[0];
        expect(rootItem.items[0].type).toBe('optional');
        expect(rootItem.items[1]).toEqual(expect.objectContaining({ label: 'First segment' }));
      });

      test('creates a drop-zone at grand-parent level for last child span', () => {
        // Last child timespan under 'First segment' div
        const dragSource = {
          id: '123a-456b-789c-4d', type: 'span', label: 'Segment 1.2',
          begin: '00:00:11.231', end: '00:08:00.001',
          valid: true, nestedSpan: false,
          timeRange: { start: 11.231, end: 480.001 }
        };

        const result = smu.determineDropTargets(dragSource, testData);

        // Adds a drop-zone after parent in grandparent
        const rootItem = result[0];
        const firstSegmentIndex = rootItem.items.findIndex(item => item.label === 'First segment');
        expect(firstSegmentIndex).toBeGreaterThan(-1);
        expect(rootItem.items[firstSegmentIndex + 1].type).toBe('optional');
      });

      test('does not create drop-zones for a middle child span', () => {
        // Test data with a span in the middle of two other spans
        const testDataWithMiddleSpan = [
          {
            type: 'root', label: 'Title', id: '123a-456b-789c-0d',
            items: [
              {
                type: 'div', label: 'Test Division', id: '123a-456b-789c-1d',
                items: [
                  {
                    type: 'span', label: 'First Span', id: '123a-456b-789c-2d',
                    valid: true, nestedSpan: false,
                    begin: '00:00:00.000', end: '00:00:10.000',
                    timeRange: { start: 0, end: 10.0 }
                  },
                  {
                    type: 'span', label: 'Middle Span', id: '123a-456b-789c-3d',
                    valid: true, nestedSpan: false,
                    begin: '00:00:10.000', end: '00:00:20.000',
                    timeRange: { start: 10.0, end: 20.0 }
                  },
                  {
                    type: 'span', label: 'Last Span', id: '123a-456b-789c-4d',
                    valid: true, nestedSpan: false,
                    begin: '00:00:20.000', end: '00:00:30.000',
                    timeRange: { start: 20.0, end: 30.0 }
                  }
                ]
              }
            ]
          }
        ];

        const dragSource = {
          id: '123a-456b-789c-3d', type: 'span', label: 'Middle Span',
          valid: true, nestedSpan: false,
          begin: '00:00:10.000', end: '00:00:20.000',
          timeRange: { start: 10.0, end: 20.0 }
        };

        const originalData = cloneDeep(testDataWithMiddleSpan);
        const result = smu.determineDropTargets(dragSource, testDataWithMiddleSpan);

        // No drop-zones are created
        expect(result).toEqual(originalData);
      });

      test('creates drop-zones for an only child', () => {
        // Test data with only one span child
        const testDataWithOnlyChild = [
          {
            type: 'root', label: 'Title', id: '123a-456b-789c-0d',
            items: [
              {
                type: 'div', label: 'Test Division', id: '123a-456b-789c-1d',
                items: [
                  {
                    type: 'span', label: 'Only Span', id: '123a-456b-789c-2d',
                    begin: '00:00:00.000', end: '00:00:10.000',
                    valid: true, nestedSpan: false,
                    timeRange: { start: 0, end: 10.0 }
                  }
                ]
              }
            ]
          }
        ];

        const dragSource = {
          id: '123a-456b-789c-2d', type: 'span', label: 'Only Span',
          begin: '00:00:00.000', end: '00:00:10.000',
          valid: true, nestedSpan: false,
          timeRange: { start: 0, end: 10.0 }
        };

        const result = smu.determineDropTargets(dragSource, testDataWithOnlyChild);

        // Adds drop-zones before and after the parent div at grand-parent level
        const rootItem = result[0];
        expect(rootItem.items[0]).toHaveProperty('type', 'optional');
        expect(rootItem.items[2]).toHaveProperty('type', 'optional');
      });

      test('does not create drop-zones when there is only a timespan in structure', () => {
        // Test data with span at root level (no grandparent)
        const testDataRootSpan = [
          {
            type: 'root', label: 'Title', id: '123a-456b-789c-0d',
            items: [
              {
                type: 'span', label: 'Root Level Span', id: '123a-456b-789c-1d',
                begin: '00:00:00.000', end: '00:00:10.000',
                valid: true, nestedSpan: false,
                timeRange: { start: 0, end: 10.0 }
              }
            ]
          }
        ];

        const dragSource = {
          id: '123a-456b-789c-1d', type: 'span', label: 'Root Level Span',
          begin: '00:00:00.000', end: '00:00:10.000',
          valid: true, nestedSpan: false,
          timeRange: { start: 0, end: 10.0 }
        };

        const result = smu.determineDropTargets(dragSource, testDataRootSpan);

        // Returns the original data
        expect(result).toEqual(testDataRootSpan);
      });
    });

    describe('for nested timespans ', () => {
      test('does not create drop-zones for a nested timespan without sibling headings', () => {
        // First timespan child of 'Segment 2.1' timespan
        const dragSource = {
          id: '123a-456b-789c-7d', type: 'span', label: 'Segment 2.1.1',
          valid: true, nestedSpan: true,
          begin: '00:09:10.241', end: '00:10:00.321',
          timeRange: { start: 550.241, end: 660.321 }
        };

        const result = smu.determineDropTargets(dragSource, nestedTestSmData);

        // Doesn't add drop-zones to the parent timespan
        expect(result).toEqual(nestedTestSmData);
        // Verify drop-zones were not added
        const regex = new RegExp('optional', 'g');
        const matches = JSON.stringify(result).match(regex);
        expect(matches).toBeNull();
      });

      test('creates drop-zones for a nested timespan with sibling headings', () => {
        // Test data with a nested timespan with a sibling heading
        const nestedDataWNestedHeading = [
          {
            type: 'root', label: 'Title', id: '123a-456b-789c-0d',
            items: [
              {
                type: 'div',
                label: 'First Segment',
                id: '123a-456b-789c-1d',
                items: [
                  {
                    type: 'span', label: 'Sub Segment 1.1', id: '123a-456b-789c-2d',
                    valid: true, nestedSpan: false,
                    begin: '00:00:00.000', end: '00:00:20.000',
                    timeRange: { start: 0.0, end: 20.0 },
                    items: [
                      {
                        type: 'span', label: 'Sub Segment 1.1.1', id: '123a-456b-789c-3d',
                        valid: true, nestedSpan: true,
                        begin: '00:00:05.000', end: '00:00:15.000',
                        timeRange: { start: 5.0, end: 15.0 },
                      },
                      {
                        type: 'div', label: 'Segment 1.1 - sub-title', id: '123a-456b-789c-4d',
                        items: [], valid: true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ];

        const dragSource = {
          type: 'span', label: 'Sub Segment 1.1.1', id: '123a-456b-789c-3d',
          valid: true, nestedSpan: true,
          begin: '00:00:05.000', end: '00:00:15.000',
          timeRange: { start: 5.0, end: 15.0 },
        };

        const originalData = cloneDeep(nestedDataWNestedHeading);
        const result = smu.determineDropTargets(dragSource, nestedDataWNestedHeading);

        // Doesn't return the original data
        expect(result).not.toEqual(originalData);
        // Verify a drop-zone was added
        const regex = new RegExp('optional', 'g');
        const matches = JSON.stringify(result).match(regex);
        expect(matches).not.toBeNull();
        expect(matches.length).toEqual(1);
      });

      test('scopes the context to its parent timespan for a nested span', () => {
        // Nested timespan under 'Segment 2.1' timespan
        const dragSource = {
          type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d',
          valid: true, nestedSpan: true,
          begin: '00:09:10.241', end: '00:10:00.321',
          timeRange: { start: 550.241, end: 660.321 }
        };
        const parentTimespan = nestedTestSmData[0].items[1].items[0].items[0];

        // Spy on the method to verify correct scoping
        const getItemsOfTypeSpy = jest.spyOn(smu, 'getItemsOfType');

        smu.determineDropTargets(dragSource, nestedTestSmData);

        // getItemsOfType() was called with parent scope for the nested timespan
        expect(getItemsOfTypeSpy).toHaveBeenCalledWith(['span'], [parentTimespan]);
        // Clear mock
        getItemsOfTypeSpy.mockRestore();
      });
    });
  });
});
