/**
 * This test is written for reference for mocking third party libraries
 * and does not do any real testing of the app.
 */

import mockAxios from 'axios';
import APIUtils from './Utils';

describe('Tests Utils module', () => {
  const waveformUrl = 'http://mockurl.com';
  const apiUtils = new APIUtils();

  test('axios get request', () => {
    mockAxios.get.mockImplementationOnce(() => {
      Promise.resolve({
        request: {
          responseURL: waveformUrl
        }
      });
    });
    apiUtils.getRequest('waveform.json');
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });
  test('axios post request', () => {
    apiUtils.postRequest('waveform.json', {});
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
