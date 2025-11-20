import * as formHelper from '../form-helper';
import { testSmData } from '../testing-helpers';
import Peaks from 'peaks';
import WaveformDataUtils from '../WaveformDataUtils';
const waveformDataUtils = new WaveformDataUtils();

describe('form-helper', () => {
  describe('getExistingFormValues()', () => {
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
      Peaks.init(options, (_, peaksInst) => {
        peaks = peaksInst;
      });
      const segments = waveformDataUtils.initSegments(testSmData, 20.0);
      // Add segments to peaks instance
      segments.map((seg) => peaks.segments.add(seg));
    });
    test('returns heading values for div/root', () => {
      const result = formHelper.getExistingFormValues('123a-456b-789c-1d', testSmData, peaks);
      expect(result).toEqual({ headingTitle: 'First segment' });
    });
    test('returns timespan values for span', () => {
      const result = formHelper.getExistingFormValues('123a-456b-789c-3d', testSmData, peaks);
      expect(result).toHaveProperty('beginTime');
      expect(result.beginTime).toEqual('00:00:03.321');
      expect(result).toHaveProperty('endTime');
      expect(result.endTime).toEqual('00:00:10.321');
      expect(result).toHaveProperty('timespanChildOf');
      expect(result.timespanChildOf).toEqual('123a-456b-789c-1d');
      expect(result).toHaveProperty('timespanTitle');
      expect(result.timespanTitle).toEqual('Segment 1.1');
      expect(result).toHaveProperty('clonedSegment');
      expect(result.clonedSegment).toHaveProperty('labelText');
      expect(result.clonedSegment.labelText).toEqual('Segment 1.1');
    });
  });

  describe('getValidationBeginState()', () => {
    test('returns false for invalid format', () => {
      expect(formHelper.getValidationBeginState('bad', '00:00:02.000')).toBe(false);
    });
    test('returns true for valid format and overlap', () => {
      expect(formHelper.getValidationBeginState('00:00:01.000', '00:00:02.000')).toBe(true);
    });
  });

  describe('getValidationEndState()', () => {
    test('returns false for invalid format', () => {
      expect(formHelper.getValidationEndState('00:00:01.000', 'bad', 10)).toBe(false);
    });
    test('returns false for invalid order', () => {
      expect(formHelper.getValidationEndState('00:00:02.000', '00:00:01.000', 10)).toBe(false);
    });
    test('returns true for valid in order times', () => {
      expect(formHelper.getValidationEndState('00:00:01.000', '00:00:02.000', 10)).toBe(true);
    });
  });

  describe('isTitleValid()', () => {
    test('returns true for title length > 2', () => {
      expect(formHelper.isTitleValid('abc')).toBe(true);
    });
    test('returns false for title length <= 2', () => {
      expect(formHelper.isTitleValid('a')).toBe(false);
    });
  });

  describe('validTimespans()', () => {
    test('returns true for correct input', () => {
      const result = formHelper.validTimespans('00:00:01.000', '00:00:02.000', 10);
      expect(result.valid).toBe(true);
    });
    test('returns true correct input with a comma decimal seperator', () => {
      const result = formHelper.validTimespans('00:00:01,000', '00:00:02,000', 10);
      expect(result.valid).toBe(true);
    });
    test('returns false for invalid time format without colons', () => {
      const result = formHelper.validTimespans('000001.000', '000003.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid begin time format');
    });
    test('returns false for invalid time with correct format with colons', () => {
      const result = formHelper.validTimespans('.:,:.', '0:0:9', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid begin time format');
    });
    test('returns true for valid time with correct format with colons', () => {
      const result = formHelper.validTimespans('0:0:0', '0:0:9', 10);
      expect(result.valid).toBe(true);
    });
    test('returns false for invalid non-string time format', () => {
      const result = formHelper.validTimespans(30, '000003.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid begin time format');
    });
    test('returns false for invalid time format with a space character', () => {
      const result = formHelper.validTimespans('00:0 :00.000', '00:00:0a.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid begin time format');
    });
    test('returns false for invalid time format with invalid characters', () => {
      const result = formHelper.validTimespans('00:0):00.000', '00:00:0a.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid begin time format');
    });
    test('returns false for invalid end format', () => {
      const result = formHelper.validTimespans('00:00:01.000', '00:0s:02.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Invalid end time format');
    });
    test('returns false for begin time overlapping end time', () => {
      const result = formHelper.validTimespans('00:00:02.000', '00:00:01.000', 10);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('Begin time must start before end time');
    });
    test('returns true for end time overlapping an existing timespan (overlapping now allowed)', () => {
      const result = formHelper.validTimespans('00:00:07.000', '00:00:08.300', 10);
      expect(result.valid).toBe(true);
    });
    test('returns true for begin time overlapping an existing timespan (overlapping now allowed)', () => {
      const result = formHelper.validTimespans('00:00:03.000', '00:00:04.000', 10);
      expect(result.valid).toBe(true);
    });
    test('returns false for end time > duration', () => {
      const result = formHelper.validTimespans('00:00:01.000', '00:00:20.000', 1, []);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch('End time overlaps duration');
    });
  });
}); 
