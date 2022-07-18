import * as iiifParser from '../iiif-parser';
import { manifest, manifestWithStructure, manifestWoStructure } from '../testing-helpers';

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
          duration: 662.037
        });
      });
      test('without media choice \'auto\', selects first', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifest, 0);
        expect(mediaInfo).toEqual(
          {
            src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            duration: 662.037
          }
        );
      });
      test('without any media related information', () => {
        const mediaInfo = iiifParser.getMediaInfo(manifestWoStructure, 0);
        console.log(mediaInfo);
        expect(mediaInfo).toEqual({
          error: 'Error fetching media files. Please check the Manifest.',
        });
      });
    });
  });

  describe('getWaveformInfo()', () => {
    test('when given manifest is invalid', () => {
      const waveform = iiifParser.getWaveformInfo(undefined, 0);
      expect(waveform).toEqual([]);
    });

    describe('when given manifest has waveform', () => {
      test('as a manifest resource', () => {
        const waveform = iiifParser.getWaveformInfo(manifestWoStructure, 0);
        expect(waveform.length).toEqual(1);
        expect(waveform[0]).toEqual('https://example.com/lunchroom_manners/waveform.json');
      });

      test('as a canvas resource', () => {
        const waveform = iiifParser.getWaveformInfo(manifestWithStructure, 1);
        expect(waveform.length).toEqual(1);
        expect(waveform[0]).toEqual('http://example.com/lunchroom-manners/waveform.json');
      });
    });
  });

  describe('parseStructureToJSON()', () => {
    test('when both manifest and initStructure are invalid', () => {
      const { structureJSON, structureIsValid } = iiifParser.parseStructureToJSON(undefined, {}, 0);
      expect(structureJSON).toEqual([]);
      expect(structureIsValid).toBeFalsy();
    });

    test('when manifest is invalid but initStructure is valid', () => {
      const initStructure = {
        label: 'Lunchroom manners',
        type: 'div',
        items: [
          {
            label: 'Darwin',
            begin: '00:00:00.00',
            end: '00:00:12.199',
            type: 'span',
          },
        ],
      };
      const { structureJSON, structureIsValid } = iiifParser.parseStructureToJSON(undefined, initStructure, 660);
      expect(structureJSON.length).toEqual(1);
      expect(structureIsValid).toBeTruthy();

      const { type, label, valid, items } = structureJSON[0];
      expect(type).toEqual('root');
      expect(label).toEqual('Lunchroom manners');
      expect(valid).toBeTruthy();
      expect(items.length).toEqual(1);
    });

    test('when manifest is valid and intitStructure is invalid', () => {
      const { structureJSON, structureIsValid } = iiifParser.parseStructureToJSON(manifest, {}, 662.037);
      expect(structureJSON.length).toEqual(1);
      expect(structureIsValid).toBeTruthy();

      const { type, label, valid, items } = structureJSON[0];
      expect(type).toEqual('root');
      expect(label).toEqual('Volleyball for Boys');
      expect(valid).toBeTruthy();
      expect(items.length).toEqual(1);
      expect(items[0].label).toEqual('Volleyball for Boys');
      expect(items[0].type).toEqual('span');
    });

    test('when manifest is valid but doesn\'t have structures', () => {
      const { structureJSON, structureIsValid } = iiifParser.parseStructureToJSON(manifestWoStructure, {}, 660);
      expect(structureJSON.length).toEqual(1);
      expect(structureIsValid).toBeTruthy();

      const { type, label, valid, items } = structureJSON[0];
      expect(label).toEqual('Beginning Responsibility: Lunchroom Manners');
      expect(type).toEqual('root');
      expect(items.length).toBe(0);
    });
  });
});