import * as iiifParser from '../iiif-parser';
import {
  manifest,
  manifestWithStructure,
  manifestWoStructure,
  manifestWoChoice,
  manifestWNestedStructure,
  manifestWEmptyRanges,
  manifestWoStructItems
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
    test('when given manifest is invalid', () => {
      const waveform = iiifParser.getWaveformInfo(undefined, 0);
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

    test('omits root element with behavior: \'top\'', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660);
      expect(structureJSON.length).toEqual(1);

      const { type, label, items } = structureJSON[0];
      expect(label).toEqual('Volleyball for Boys');
      expect(type).toEqual('div');
      expect(items.length).toBe(1);
    });

    test('returns corrrect structure in a multi-canvas manifest', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWithStructure, 660, 1);
      expect(structureJSON.length).toEqual(1);

      const { type, label, items } = structureJSON[0];
      expect(label).toEqual('Lunchroom Manners');
      expect(type).toEqual('div');
      expect(items.length).toBe(2);
      expect(items[0].label).toBe('Introduction');
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

      // Level 2 - first item is a timespan
      const level_2_1 = level_1.items[0];
      expect(level_2_1.type).toEqual('span');
      expect(level_2_1.label).toEqual('Level 2 Span');
      expect(level_2_1.begin).toBe('00:00:00.000');
      expect(level_2_1.end).toBe('00:01:40.000');

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

      // Level 4 - a timespan and has no children
      const level_4 = level_3_2.items[0];
      expect(level_4.type).toEqual('span');
      expect(level_4.label).toEqual('Level 4 Span');
      expect(level_4.begin).toBe('00:03:20.000');
      expect(level_4.end).toBe('00:05:00.000');
      expect(level_4.items).toEqual([]);
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

    test('handles structures with undefined items property', () => {
      const structureJSON = iiifParser.parseStructureToJSON(manifestWoStructItems, 500);
      expect(structureJSON.length).toEqual(1);

      const root = structureJSON[0];
      expect(root.items.length).toBe(1);
      expect(root.items[0].label).toEqual('Valid Range');
      expect(root.items[0].type).toEqual('div');
      expect(root.items[0].items).toEqual([]);
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
