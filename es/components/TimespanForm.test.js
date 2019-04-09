import React from 'react';
import { cloneDeep } from 'lodash';
import TimespanForm, { PureTimespanForm } from './TimespanForm';
import { shallow, mount } from 'enzyme';
import {
  testMetadataStructure,
  testEmptyHeaderAfter
} from '../test/TestStructure';
import Peaks from 'peaks';

describe('TimespanForm component', () => {
  let wrapper, props, peaks;
  let options = {
    container: null,
    mediaElement: null,
    dataUri: null,
    dataUriDefaultFormat: 'json',
    keyboard: true,
    _zoomLevelIndex: 0,
    _zoomLevels: [512, 1024, 2048, 4096]
  };
  beforeAll(() => {
    peaks = { peaks: Peaks.init(options) };
    props = {
      peaksInstance: peaks,
      smData: testEmptyHeaderAfter, // initially mount with a different structure
      segment: {},
      updateSegment: jest.fn()
    };
    wrapper = shallow(<TimespanForm {...props} />);
  });

  test('renders without crashing', () => {
    expect(wrapper.find('#timespanTitle')).toBeDefined();
    expect(wrapper.find('#beginTime')).toBeDefined();
    expect(wrapper.find('#endTime')).toBeDefined();
    expect(wrapper.instance().props.smData).toEqual(testEmptyHeaderAfter);
  });

  describe('tests the pure TimespanForm component', () => {
    let pureWrapper, initSegment, isInitializing, timespanOpen;
    beforeAll(() => {
      initSegment = {
        startTime: 900.01,
        endTime: 960.01,
        id: 'temp-segment',
        color: '#FBB040',
        editable: true
      };
      isInitializing = true;
      timespanOpen = false;
      pureWrapper = mount(
        <PureTimespanForm
          {...props}
          updateInitialize={jest.fn()}
          initSegment={initSegment}
          isInitializing={isInitializing}
          timespanOpen={timespanOpen}
          onSubmit={jest.fn()}
          cancelClick={jest.fn()}
        />
      );
    });

    test('mounts pure component without crashing', () => {
      const {
        beginTime,
        endTime,
        timespanTitle,
        timespanChildOf,
        validHeadings,
        isTyping
      } = pureWrapper.instance().state;
      expect(beginTime).toBe('');
      expect(endTime).toBe('');
      expect(timespanTitle).toBe('');
      expect(timespanChildOf).toBe('');
      expect(validHeadings).toEqual([]);
      expect(isTyping).toBeFalsy();
      expect(pureWrapper.instance().allSpans).toHaveLength(1);
    });

    test('updates component with correct props fires componentDidUpdate()', () => {
      pureWrapper.setProps({
        ...props,
        smData: testMetadataStructure,
        peaksInstance: peaks
      });
      expect(pureWrapper.instance().allSpans).toHaveLength(3);
      expect(pureWrapper.instance().allSpans).toContainEqual({
        type: 'span',
        label: 'Segment 1.2',
        id: '123a-456b-789c-4d',
        begin: '00:00:11.23',
        end: '00:08:00.00'
      });
    });

    test('mounts component with correct values fires componentWillReceiveProps()', () => {
      initSegment = {
        startTime: 900.01,
        endTime: 960.01,
        id: 'temp-segment',
        color: '#FBB040',
        editable: true
      };
      let newPeaks = pureWrapper.instance().props.peaksInstance;
      newPeaks.peaks.segments.add(initSegment);
      pureWrapper.setProps({
        ...pureWrapper.instance().props,
        initSegment: initSegment,
        timespanOpen: true,
        peaksInstance: newPeaks,
        segment: initSegment
      });
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:00.01');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:00.01');
    });

    test('tests form input change for timespanTitle form', () => {
      pureWrapper
        .find('FormControl')
        .at(0)
        .simulate('change', {
          target: { id: 'timespanTitle', value: 'Sample segment' }
        });
      expect(
        pureWrapper
          .find('FormControl')
          .at(0)
          .instance().props.value
      ).toBe('Sample segment');
      expect(pureWrapper.instance().state.timespanTitle).toBe('Sample segment');
    });

    test('tests form input for beginTime form', () => {
      // Test previous state values
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:00.01');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:00.01');

      // Simulate input feild
      pureWrapper
        .find('FormControl')
        .at(1)
        .simulate('change', {
          target: { id: 'beginTime', value: '00:15:20.99' }
        });

      // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:20.99');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:00.01');
    });

    test('tests select from Child of options', () => {
      expect(pureWrapper.instance().state.timespanChildOf).toBe('');
      pureWrapper
        .find('FormControl')
        .at(3)
        .simulate('change', { target: { value: 'Sub-Segment 2.1' } });
      expect(pureWrapper.instance().state.timespanChildOf).toBe(
        'Sub-Segment 2.1'
      );
    });

    test('changing segment fires componentWillRecieveProps()', () => {
      // Test previous state values
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:20.99');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:00.01');
      // Change props
      const newSegment = {
        startTime: 920.99,
        endTime: 965.01,
        id: 'temp-segment',
        color: '#FBB040',
        editable: true
      };
      let newPeaks = cloneDeep(pureWrapper.instance().props.peaksInstance);
      newPeaks.peaks.segments.removeById('temp-segment');
      newPeaks.peaks.segments.add(newSegment);
      const newProps = {
        ...pureWrapper.instance().props,
        segment: newSegment,
        peaksInstance: newPeaks,
        isInitializing: false
      };
      // Set new props
      pureWrapper.setProps({
        ...newProps
      });
      // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:20.99');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:05.01');
      expect(pureWrapper.instance().state.validHeadings).toHaveLength(1);
    });

    test('changing segment beginTime to an invalid value fires componentWillRecieveProps()', () => {
      // Test previous state values
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:20.99');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:05.01');
      // Change props
      const newSegment = {
        startTime: 899.99,
        endTime: 965.01,
        id: 'temp-segment',
        color: '#FBB040',
        editable: true
      };
      let newPeaks = cloneDeep(pureWrapper.instance().props.peaksInstance);
      newPeaks.peaks.segments.removeById('temp-segment');
      newPeaks.peaks.segments.add(newSegment);
      const newProps = {
        ...pureWrapper.instance().props,
        segment: newSegment,
        peaksInstance: newPeaks,
        isInitializing: false
      };
      // Set new props
      pureWrapper.setProps({
        ...newProps
      });
      // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:15:00.01');
      expect(pureWrapper.instance().state.endTime).toBe('00:16:05.01');
      expect(pureWrapper.instance().state.validHeadings).toHaveLength(1);
    });

    test('tests save button when form is valid', () => {
      expect(pureWrapper.instance().state.validHeadings).toHaveLength(1);
      expect(pureWrapper.instance().state.timespanChildOf).toBe(
        'Sub-Segment 2.1'
      );
      expect(pureWrapper.instance().formIsValid()).toBeTruthy();
    });

    test('tests save button when form is valid', () => {
      // Change begin time to an invalid value
      pureWrapper
        .find('FormControl')
        .at(1)
        .simulate('change', {
          target: { id: 'beginTime', value: '00:14:59.99' }
        });
      expect(pureWrapper.instance().state.validHeadings).toHaveLength(0);
      expect(pureWrapper.instance().formIsValid()).toBeFalsy();
    });
  });
});
