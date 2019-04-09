import React from 'react';
import { PureWaveformContainer } from './WaveformContainer';
import { testMetadataStructure } from '../test/TestStructure';
import { shallow } from 'enzyme';
import mockAxios from 'axios';

describe('WaveformContainer class', () => {
  let props,
    initForms = {
      editingDisabled: false,
      structureRetrieved: false,
      waveformRetrieved: false
    };
  beforeEach(() => {
    props = {
      smData: testMetadataStructure,
      forms: initForms,
      initPeaks: jest.fn(),
      handleWaveformFile: jest.fn(code => {
        if (code === 0) {
          initForms.waveformRetrieved = true;
        }
      })
    };
  });

  test('component mounts without crashing', () => {
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.resolve({
        request: {
          responseURL: 'http://localhost/test/TestWaveform.json'
        }
      });
    });
    const pureWrapper = shallow(<PureWaveformContainer {...props} />);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(pureWrapper.instance()).toBeDefined();

    setImmediate(() => {
      expect(pureWrapper.find('Waveform')).toBeDefined();
      expect(pureWrapper.instance().props.forms.waveformRetrieved).toBeTruthy();
      expect(pureWrapper.instance().state.hasError).toBeFalsy();
      expect(pureWrapper.instance().state.alertObj).toBeNull();
    });
  });

  test('component renders AlertContainer when an error occurs in the API call', () => {
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.reject({
        response: {
          status: 401
        }
      });
    });
    const badWrapper = shallow(<PureWaveformContainer {...props} />);

    setImmediate(() => {
      expect(badWrapper.instance().state.alertObj.alertStyle).toBe('danger');
      expect(badWrapper.instance().state.alertObj.message).toBe(
        'Unauthorized to access the masterfile'
      );
      expect(badWrapper.instance().state.hasError).toBeTruthy();
    });
  });
});
