import * as iiifParser from '../iiif-parser';
import {
  manifest,
  manifestWithStructure,
  manifestWoStructure,
  manifestWoChoice,
  manifestWNestedStructure,
  manifestWEmptyRanges,
  manifestWithSectionCanvas,
} from '../testing-helpers';

describe('iiif-parser', () => {
  let originalError, originalLogger;
  beforeEach(() => {
    /** Mock console.error and console.log functions with empty jest.fn().
     *  This avoids multiple console.error/console.log outputs from within 
     *  Peaks.init() function and other modules the children components 
     *  are populated for the tests.
     */
    originalError = console.error;
    console.error = jest.fn();
    originalLogger = console.log;
    console.log = jest.fn();
  });
  afterEach(() => {
    console.error = originalError;
    console.log = originalLogger;
  });

  describe('getMediaInfo()', () => {
    test('when given manifest is undefined', () => {
      const mediaInfo = iiifParser.getMediaInfo(undefined, 0);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(mediaInfo).toEqual({ error: 'Manifest is invalid. Please check the Manifest.' });
    });

    describe('when given manifest is valid', () => {
      test('with media choice with auto', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifestWithStructure, 0);
        expect(mediaInfo).toEqual({
          src: 'http://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
          duration: 662.037,
          isStream: false,
          isVideo: true,
        });
      });
      test('without media choice \'auto\', selects first', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifest, 0);
        expect(mediaInfo).toEqual(
          {
            src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            duration: 662.037,
            isStream: false,
            isVideo: true,
          }
        );
      });
      test('with one media source without a choice', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifestWoChoice, 0);
        expect(mediaInfo).toEqual({
          src: 'http://example.com/volleyball-for-boys/volleyball-for-boys.m3u8',
          duration: 662.037,
          isStream: true,
          isVideo: false,
        });
      });

      test('without any media related information', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifestWoStructure, 0);
        expect(mediaInfo).toEqual({
          error: 'No resources found in Canvas',
          duration: 0,
          isStream: false,
          isVideo: false,
          src: undefined
        });
      });

    });
  });

  describe('getWaveformInfo()', () => {
    test('when given manifest is undefined', () => {
      const waveform = iiifParser.getWaveformInfo(undefined, 0);
      expect(waveform).toEqual(null);
    });

    test('when given manifest is null', () => {
      const waveform = iiifParser.getWaveformInfo(null, 0);
      expect(waveform).toEqual(null);
    });

    test('when given manifest has waveform', () => {
      const waveform = iiifParser.getWaveformInfo(manifestWithStructure, 1);
      expect(waveform).toEqual('http://example.com/lunchroom-manners/waveform.json');
    });
  });

  describe('parseStructureToJSON()', () => {
    test('returns [] when manifest is invalid', () => {
      const structureJSON = iiifParser.parseStructureToJSON(undefined, 0);
      expect(structureJSON).toEqual([]);
    });

    test('returns manifest\'s structure when manifest is valid', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifest, 662.037);
      expect(structureJSON.length).toEqual(1);

      const { type, label, items } = structureJSON[0];
      expect(type).toEqual('div');
      expect(label).toEqual('Volleyball for Boys');
      expect(items.length).toEqual(1);
      expect(items[0].label).toEqual('Volleyball for Boys');
      expect(items[0].type).toEqual('span');
    });

    test('builds root element from manifest\'s title when manifest doesn\'t have structures', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWoStructure, 660);
      expect(structureJSON.length).toEqual(1);

      const { type, label, items } = structureJSON[0];
      expect(label).toEqual('Beginning Responsibility: Lunchroom Manners');
      expect(type).toEqual('div');
      expect(items.length).toBe(0);
    });

    describe('parses structures with root Range with behavior=\'top\'', () => {
      test('and omits root Range', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660);
        expect(structureJSON.length).toEqual(1);

        const { type, label, items } = structureJSON[0];
        // Has the label of the first section at the root level
        expect(label).not.toBe(null);
        expect(label).toEqual('Volleyball for Boys');
        expect(type).toEqual('div');
        expect(items.length).toBe(1);
      });

      test('and returns structure for the current Canvas', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660, 1);
        expect(structureJSON.length).toEqual(1);

        const { type, label, items } = structureJSON[0];
        expect(label).toEqual('Lunchroom Manners');
        expect(type).toEqual('div');
        expect(items.length).toBe(2);
        expect(items[0].label).toBe('Introduction');
      });
    });

    test('builds structure for childless divs', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660, 1);
      expect(structureJSON.length).toEqual(1);

      const { type, label, items } = structureJSON[0];
      expect(label).toEqual('Lunchroom Manners');
      expect(type).toEqual('div');
      expect(items.length).toBe(2);
      expect(items[1].label).toBe('Washing Hands');
      expect(items[1].items.length).toBe(0);
    });

    test('handles nested structures', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWNestedStructure, 1000);
      expect(structureJSON.length).toEqual(1);

      const root = structureJSON[0];
      expect(root.type).toEqual('div');
      expect(root.label).toEqual('Table of Content');
      expect(root.items.length).toBe(1);

      // Level 1 div has 2 items
      const level_1 = root.items[0];
      expect(level_1.type).toEqual('div');
      expect(level_1.label).toEqual('Level 1 Div');
      expect(level_1.items.length).toBe(2);

      // Level 2 - first item is a timespan without children
      const level_2_1 = level_1.items[0];
      expect(level_2_1.type).toEqual('span');
      expect(level_2_1.label).toEqual('Level 2 Span');
      expect(level_2_1.begin).toBe('00:00:00.000');
      expect(level_2_1.end).toBe('00:01:40.000');
      expect(level_2_1.items).toEqual([]);

      // Level 2 - second item is a div with 2 items
      const level_2_2 = level_1.items[1];
      expect(level_2_2.type).toEqual('div');
      expect(level_2_2.label).toEqual('Level 2 Div');
      expect(level_2_2.items.length).toBe(2);

      // Level 3 - first item is a timespan
      const level_3_1 = level_2_2.items[0];
      expect(level_3_1.type).toEqual('span');
      expect(level_3_1.label).toEqual('Level 3 Span');
      expect(level_3_1.begin).toBe('00:01:40.000');
      expect(level_3_1.end).toBe('00:03:20.000');

      // Level 3 - second item is a div with 1 item
      const level_3_2 = level_2_2.items[1];
      expect(level_3_2.type).toEqual('div');
      expect(level_3_2.label).toEqual('Level 3 Div');
      expect(level_3_2.items.length).toBe(1);

      // Level 4 - a timespan and has one child
      const level_4 = level_3_2.items[0];
      expect(level_4.type).toEqual('span');
      expect(level_4.label).toEqual('Level 4 Span');
      expect(level_4.begin).toBe('00:03:20.000');
      expect(level_4.end).toBe('00:05:00.000');
      expect(level_4.items.length).toBe(1);
      expect(level_4.items[0].label).toEqual('Level 5 Span');
    });

    describe('sets nestedSpan property', () => {
      test('in a nested structure', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWNestedStructure, 1000);

        const root = structureJSON[0];
        // Root level sets nestedSpan=false
        expect(root.nestedSpan).toBeFalsy();

        // Level 1 div, child of root sets nestedSpan=false
        const level_1 = root.items[0];
        expect(level_1.nestedSpan).toBeFalsy();

        // Level 2 span, child of a div sets nestedSpan=false
        const level_2_1 = level_1.items[0];
        expect(level_2_1.nestedSpan).toBeFalsy();

        // Level 2 div, child of a div sets nestedSpan=false
        const level_2_2 = level_1.items[1];
        expect(level_2_2.nestedSpan).toBeFalsy();

        // Level 5 span, child of a span sets nestedSpan=true
        const level_5 = level_2_2.items[1].items[0].items[0];
        expect(level_5.label).toEqual('Level 5 Span');
        expect(level_5.nestedSpan).toBeTruthy();
      });

      test('in a non-nested structure', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifest, 662.037);

        const root = structureJSON[0];
        expect(root.nestedSpan).toBeDefined();
        expect(root.nestedSpan).toBe(false);

        const span = root.items[0];
        expect(span.nestedSpan).toBeDefined();
        expect(span.nestedSpan).toBe(false);
      });

      test('for a root without structure items', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWoStructure, 660);

        const root = structureJSON[0];
        expect(root.nestedSpan).toBeDefined();
        expect(root.nestedSpan).toBe(false);
      });
    });

    test('correctly identifies spans and divs', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWEmptyRanges, 500);
      expect(structureJSON.length).toEqual(1);

      const root = structureJSON[0];
      // All Range items are processed
      expect(root.items.length).toBe(3);

      // Range with Canvas is identified as a span
      const validRange = root.items[0];
      expect(validRange.type).toEqual('span');
      expect(validRange.label).toEqual('Valid Range');
      expect(validRange.begin).toBe('00:00:00.000');
      expect(validRange.end).toBe('00:01:40.000');

      // Range without Canvas is identified as a div
      const noCanvasRange = root.items[1];
      expect(noCanvasRange.type).toEqual('div');
      expect(noCanvasRange.label).toEqual('No Canvas Range');
      expect(noCanvasRange.items).toEqual([]);

      // Range with an invalid Canvas URL is identified as a div
      const invalidRange = root.items[2];
      expect(invalidRange.type).toEqual('div');
      expect(invalidRange.label).toEqual('Range with Invalid Canvas');
      expect(invalidRange.items).toEqual([]);
    });

    describe('correctly identifies section items', () => {
      test('with Canvas reference in structures', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWithSectionCanvas, 660, 1);
        expect(structureJSON.length).toEqual(1);

        const root = structureJSON[0];
        expect(root.label).toEqual('Media 2');
        expect(root.type).toEqual('div');
        expect(root.items).toHaveLength(0);
        expect(root.isCanvasSection).toBeTruthy();
        expect(root.nestedSpan).toBeFalsy();
      });

      test('without Canvas reference in structures', () => {
        const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660, 1);
        expect(structureJSON.length).toEqual(1);

        const root = structureJSON[0];
        expect(root.label).toEqual('Lunchroom Manners');
        expect(root.type).toEqual('div');
        expect(root.isCanvasSection).toBeFalsy();
        expect(root.items).toHaveLength(2);
        expect(root.items[0].label).toBe('Introduction');
        expect(root.items[1].label).toBe('Washing Hands');
      });
    });
  });

  describe('getLabelValue()', () => {
    test('returns decoded HTML entities', () => {
      const labelWithEntities = 'This &amp; that &lt;tag&gt; &quot;quoted&quot; &apos;apostrophe&apos;';
      expect(iiifParser.getLabelValue(labelWithEntities)).toBe('This & that <tag> "quoted" \'apostrophe\'');
    });

    test('returns label when en tag is available', () => {
      const label = { en: ['Track 4. Schwungvoll'] };
      expect(iiifParser.getLabelValue(label)).toEqual('Track 4. Schwungvoll');
    });

    test('returns label when none tag is available', () => {
      const label = { none: ['Track 2. Langsam. Schwer'] };
      expect(iiifParser.getLabelValue(label)).toEqual('Track 2. Langsam. Schwer');
    });

    test('returns label when a string is given', () => {
      const label = 'Track 2. Langsam. Schwer';
      expect(iiifParser.getLabelValue(label)).toEqual('Track 2. Langsam. Schwer');
    });

    test('returns \'Label could not be parsed\' when label is not present', () => {
      const label = {};
      expect(iiifParser.getLabelValue(label)).toEqual('Label could not be parsed');
    });

    test('returns an empty string for empty values', () => {
      expect(iiifParser.getLabelValue({ en: [] })).toBe('');
      expect(iiifParser.getLabelValue('')).toBe('');
    });

    test('returns \'Label could not be parsed\' for null/undefined labels', () => {
      expect(iiifParser.getLabelValue(null)).toBe('Label could not be parsed');
      expect(iiifParser.getLabelValue(undefined)).toBe('Label could not be parsed');
    });
  });

  describe('parseJSONToStructure()', () => {
    describe('returns original structures from Manifest', () => {
      test('when smData is empty', () => {
        const structures = iiifParser.parseJSONToStructure(manifest, [], 0);
        expect(structures).toEqual(manifest.structures);
      });
      test('when smData is undefined', () => {
        const structures = iiifParser.parseJSONToStructure(manifest, undefined, 0);
        expect(structures).toEqual(manifest.structures);
      });
      test('when smData is undefined', () => {
        const structures = iiifParser.parseJSONToStructure(manifest, null, 0);
        expect(structures).toEqual(manifest.structures);
      });
    });

    test('returns [] when both smData and manifest are undefined', () => {
      const structures = iiifParser.parseJSONToStructure(undefined, undefined, 0);
      expect(structures).toEqual([]);
    });

    describe('parses structures with sections with Canvas reference and', () => {
      const sectionSmData = [
        {
          type: 'root', label: 'Media 2 - Edited', nestedSpan: false, id: '1', items: [],
          isCanvasSection: true,
        }
      ];
      const manifestId = 'http://example.com/canvas-ranges/manifest';
      const canvasId = 'http://example.com/canvas-ranges/canvas/2';
      const otherCanvasId = 'http://example.com/canvas-ranges/canvas/1';

      test('preserves root element without \'top\' behavior in structures', () => {
        const ogRootRange = manifestWithSectionCanvas.structures[0];
        expect(ogRootRange.label).toStrictEqual({ 'en': ['Root'] });

        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);
        const editedRootRange = structures[0];
        expect(editedRootRange.behavior).not.toBe('top');
        expect(editedRootRange.label).toStrictEqual({ 'en': ['Root'] });
      });

      test('updates Range labels for edited structure items', () => {
        const ogSecondSection = manifestWithSectionCanvas.structures[0].items[1];
        expect(ogSecondSection.label).toStrictEqual({ 'en': ['Media 2'] });

        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);
        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);
        expect(editedRootRange.items[1].label).toStrictEqual({ 'en': ['Media 2 - Edited'] });
      });

      test('preserves Range labels for structure items in other canvases', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);
        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);

        expect(editedRootRange.items[0].label).toStrictEqual({ 'en': ['Media'] });
      });

      test('builds Canvas references for edited section items', () => {
        const ogSecondSection = manifestWithSectionCanvas.structures[0].items[1];
        expect(ogSecondSection.label).toStrictEqual({ 'en': ['Media 2'] });
        expect(ogSecondSection.items.length).toBe(1);
        expect(ogSecondSection.items[0].type).toBe('Canvas');
        expect(ogSecondSection.items[0].id).toBe(`${canvasId}#t=0,660`);

        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);

        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);

        const editedSecondSection = editedRootRange.items[1];
        expect(editedSecondSection.items.length).toBe(1);
        expect(editedSecondSection.items[0].type).toBe('Canvas');
        expect(editedSecondSection.items[0].id).toBe(`${canvasId}#t=0,660`);
      });

      test('preserves Canvas references for other section items', () => {
        const ogFirstSection = manifestWithSectionCanvas.structures[0].items[0];
        expect(ogFirstSection.label).toStrictEqual({ 'en': ['Media'] });
        expect(ogFirstSection.items.length).toBe(1);
        expect(ogFirstSection.items[0].type).toBe('Canvas');
        expect(ogFirstSection.items[0].id).toBe(`${otherCanvasId}#t=0,500`);

        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);

        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);

        const firstSection = editedRootRange.items[0];
        expect(firstSection.items.length).toBe(1);
        expect(firstSection.items[0].type).toBe('Canvas');
        expect(firstSection.items[0].id).toBe(`${otherCanvasId}#t=0,500`);
      });

      test('assigns hierarchical Range ids at each level', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);

        const rootRange = structures[0];
        expect(rootRange.id).toBe(`${manifestId}/range/0`);

        const firstSection = rootRange.items[0];
        expect(firstSection.id).toBe(`${manifestId}/range/1`);

        const secondSection = rootRange.items[1];
        expect(secondSection.id).toBe(`${manifestId}/range/2`);
      });

      test('does not include internal smData properties in structures', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);

        const editedRootRange = structures[0];
        const firstSection = editedRootRange.items[0];
        const secondSection = editedRootRange.items[1];

        [editedRootRange, firstSection, secondSection].forEach(range => {
          expect(range).not.toHaveProperty('nestedSpan');
          expect(range).not.toHaveProperty('timeRange');
          expect(range).not.toHaveProperty('begin');
          expect(range).not.toHaveProperty('end');
          expect(range).not.toHaveProperty('valid');
          expect(range).not.toHaveProperty('isCanvasSection');
        });
      });

      test('all Range ids are unique in structures', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithSectionCanvas, sectionSmData, 1);
        const allIds = [];
        const collect = (items) => {
          for (const item of items ?? []) {
            if (item.id) allIds.push(item.id);
            if (Array.isArray(item.items)) collect(item.items);
          }
        };
        collect(structures);
        expect(new Set(allIds).size).toBe(allIds.length);
      });
    });

    describe('parses normal structures and', () => {
      const smData = [
        {
          type: 'div', label: 'Volleyball for Boys - First Section', nestedSpan: false, id: '1',
          items: [
            {
              label: 'Volleyball for Boys - Introduction', timeRange: { start: 0, end: 2.37 }, id: '2',
              items: [], type: 'span', nestedSpan: false, begin: '00:00:00.000', end: '00:02:37.000'
            }
          ]
        }
      ];
      const manifestId = 'http://example.com/sample-manifest/manifest';
      const canvasId = 'http://example.com/sample-manifest/manifest/canvas/1';
      const otherCanvasId = 'http://example.com/sample-manifest/manifest/canvas/2';

      test('preserves root element with behavior: \'top\' in structures', () => {
        const originalStructRoot = manifestWithStructure.structures[0];
        expect(originalStructRoot.behavior).toBe('top');
        expect(originalStructRoot.label).toBe(null);

        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);
        const editedRootRange = structures[0];
        expect(editedRootRange.behavior).toBe('top');
        expect(editedRootRange.label).toBe(null);
      });

      test('updates Range labels for edited structure items', () => {
        const originalFirstStruct = manifestWithStructure.structures[0].items[0];
        expect(originalFirstStruct.label).toStrictEqual({ 'en': ['Volleyball for Boys'] });
        expect(originalFirstStruct.items[0].label).toStrictEqual({ 'en': ['Volleyball for Boys'] });

        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);
        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);
        const firstSection = editedRootRange.items[0];
        expect(firstSection.label).toStrictEqual({ 'en': ['Volleyball for Boys - First Section'] });
        expect(firstSection.items[0].label).toStrictEqual({ 'en': ['Volleyball for Boys - Introduction'] });
      });

      test('preserves Range labels for structure items in other canvases', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);
        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);

        const secondSection = editedRootRange.items[1];
        expect(secondSection.label).toStrictEqual({ 'en': ['Lunchroom Manners'] });
        expect(secondSection.items[0].label).toStrictEqual({ 'en': ['Introduction'] });
      });

      test('builds Canvas references for edited span items', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);

        const editedRootRange = structures[0];
        const firstSection = editedRootRange.items[0];
        expect(firstSection.items.length).toBe(1);
        const firstSectionStructure = firstSection.items[0];

        expect(firstSectionStructure.items).toHaveLength(1);
        expect(firstSectionStructure.items[0].type).toBe('Canvas');
        expect(firstSectionStructure.items[0].id).toBe(`${canvasId}#t=0,157`);
      });

      test('preserves Canvas references for for span items in other canvases', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);

        const editedRootRange = structures[0];
        expect(editedRootRange.items.length).toBe(2);

        const secondSection = editedRootRange.items[1];
        expect(secondSection.items.length).toBe(2);
        const secondSectionStructure = secondSection.items[0];

        expect(secondSectionStructure.items).toHaveLength(1);
        expect(secondSectionStructure.items[0].type).toBe('Canvas');
        expect(secondSectionStructure.items[0].id).toBe(`${otherCanvasId}#t=0,23`);
      });

      test('assigns hierarchical Range ids at each level', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);

        const rootRange = structures[0];
        expect(rootRange.behavior).toBe('top');
        expect(rootRange.id).toBe(`${manifestId}/range/0`);

        const firstSection = rootRange.items[0];
        expect(firstSection.id).toBe(`${manifestId}/range/1`);
        expect(firstSection.items[0].id).toBe(`${manifestId}/range/1-1`);

        const secondSection = rootRange.items[1];
        expect(secondSection.id).toBe(`${manifestId}/range/2`);
        expect(secondSection.items[0].id).toBe(`${manifestId}/range/2-1`);
      });

      test('does not include internal smData properties in structures', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);

        const editedRootRange = structures[0];
        const firstSection = editedRootRange.items[0];
        const firstSectionStructureItem = firstSection.items[0];

        [editedRootRange, firstSection, firstSectionStructureItem].forEach(range => {
          expect(range).not.toHaveProperty('nestedSpan');
          expect(range).not.toHaveProperty('timeRange');
          expect(range).not.toHaveProperty('begin');
          expect(range).not.toHaveProperty('end');
          expect(range).not.toHaveProperty('valid');
        });
      });

      test('all Range ids are unique in structures', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWithStructure, smData);
        const allIds = [];
        const collect = (items) => {
          for (const item of items ?? []) {
            if (item.id) allIds.push(item.id);
            if (Array.isArray(item.items)) collect(item.items);
          }
        };
        collect(structures);
        expect(new Set(allIds).size).toBe(allIds.length);
      });
    });

    describe('parses nested structures and', () => {
      const manifestId = 'http://example.com/deep-nested/manifest';
      const canvasId = 'http://example.com/deep-nested/canvas/1';

      // nested smData representing structures in 'manifestWNestedStructure' in testing-helpers.js
      const nestedSmData = [
        {
          type: 'root', label: 'Table of Content - Root', nestedSpan: false, id: '1',
          items: [
            {
              type: 'div', label: 'Level 1 Div - Edited', nestedSpan: false, id: '2',
              items: [
                {
                  type: 'span', label: 'Level 2 Span - Edited', nestedSpan: false, id: '3',
                  begin: '00:00:00.000', end: '00:01:40.000',
                  timeRange: { start: 0, end: 100 }, items: []
                },
                {
                  type: 'div', label: 'Level 2 Div', nestedSpan: false, id: '4',
                  items: [
                    {
                      type: 'span', label: 'Level 3 Span', nestedSpan: false, id: '5',
                      begin: '00:01:40.000', end: '00:03:20.000',
                      timeRange: { start: 100, end: 200 }, items: []
                    },
                    {
                      type: 'div', label: 'Level 3 Div', nestedSpan: false, id: '6',
                      items: [
                        {
                          type: 'span', label: 'Level 4 Span', nestedSpan: false, id: '7',
                          begin: '00:03:20.000', end: '00:05:00.000',
                          timeRange: { start: 200, end: 300 }, items: [

                            {
                              type: 'span', label: 'Level 5 Span', nestedSpan: false, id: '8',
                              begin: '00:04:10.000', end: '00:04:35.000',
                              timeRange: { start: 250, end: 275 }, items: []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      test('updates nested Range labels', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWNestedStructure, nestedSmData);

        expect(structures).toHaveLength(1);
        const rootRange = structures[0];
        expect(rootRange.type).toBe('Range');
        expect(rootRange.label).toStrictEqual({ en: ['Table of Content - Root'] });

        const level_1 = rootRange.items[0];
        expect(level_1.type).toBe('Range');
        expect(level_1.label).toStrictEqual({ en: ['Level 1 Div - Edited'] });
        expect(level_1.items).toHaveLength(2);

        expect(level_1.items[0].label).toStrictEqual({ en: ['Level 2 Span - Edited'] });
        expect(level_1.items[1].label).toStrictEqual({ en: ['Level 2 Div'] });
      });

      test('builds Canvas references for nested span items', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWNestedStructure, nestedSmData);

        const rootRange = structures[0];
        const level_1 = rootRange.items[0];

        // Level 2 span
        const level_2_span = level_1.items[0];
        expect(level_2_span.items).toHaveLength(1);
        expect(level_2_span.items[0].type).toBe('Canvas');
        expect(level_2_span.items[0].id).toBe(`${canvasId}#t=0,100`);

        // Level 2 div
        const level_2_div = level_1.items[1];
        const level_3_span = level_2_div.items[0];
        expect(level_3_span.items).toHaveLength(1);
        expect(level_3_span.items[0].type).toBe('Canvas');
        expect(level_3_span.items[0].id).toBe(`${canvasId}#t=100,200`);
      });

      test('assigns hierarchical Range ids at each level', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWNestedStructure, nestedSmData);

        const rootRange = structures[0];
        expect(rootRange.id).toBe(`${manifestId}/range/1`);

        const level_1 = rootRange.items[0];
        expect(level_1.id).toBe(`${manifestId}/range/1-1`);
        // Level 2 span 
        expect(level_1.items[0].id).toBe(`${manifestId}/range/1-1-1`);

        const level_2_div = level_1.items[1];
        expect(level_2_div.id).toBe(`${manifestId}/range/1-1-2`);
        // Level 3 span 
        expect(level_2_div.items[0].id).toBe(`${manifestId}/range/1-1-2-1`);
      });

      test('does not include internal smData properties in structures', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWNestedStructure, nestedSmData);

        const rootRange = structures[0];
        const level_1 = rootRange.items[0];
        const level_2_span = level_1.items[0];

        [rootRange, level_1, level_2_span].forEach(range => {
          expect(range).not.toHaveProperty('nestedSpan');
          expect(range).not.toHaveProperty('timeRange');
          expect(range).not.toHaveProperty('begin');
          expect(range).not.toHaveProperty('end');
          expect(range).not.toHaveProperty('valid');
        });
      });

      test('all Range ids are unique across deeply nested output', () => {
        const structures = iiifParser.parseJSONToStructure(manifestWNestedStructure, nestedSmData);
        const allIds = [];
        const collect = (items) => {
          for (const item of items ?? []) {
            if (item.id) allIds.push(item.id);
            if (Array.isArray(item.items)) collect(item.items);
          }
        };
        collect(structures);
        expect(new Set(allIds).size).toBe(allIds.length);
      });
    });
  });

  describe('getMediaFragment()', () => {
    test('returns start and end values for a valid mediafragment', () => {
      const fragment = iiifParser.getMediaFragment('canvas#t=120,300', 500);
      expect(fragment).toEqual({ start: 120, end: 300 });
      expect(typeof fragment.start).toBe('number');
      expect(typeof fragment.end).toBe('number');
    });

    test('returns duration for end value when end value is not given', () => {
      expect(iiifParser.getMediaFragment('canvas#t=120', 500))
        .toEqual({ start: 120, end: 500 });
      expect(iiifParser.getMediaFragment('canvas#t=120,', 500))
        .toEqual({ start: 120, end: 500 });
    });

    test('returns undefined for URIs without mediafragment', () => {
      const fragment = iiifParser.getMediaFragment('canvas', 500);
      expect(fragment).toBeUndefined();
    });

    test('returns undefined for invalid URIs', () => {
      expect(iiifParser.getMediaFragment(undefined, 500)).toBeUndefined();
      expect(iiifParser.getMediaFragment('canvas#invalid', 500)).toBeUndefined();
    });
  });
}); 
