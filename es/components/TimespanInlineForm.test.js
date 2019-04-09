import React from 'react';
import { cloneDeep } from 'lodash';
import TimespanInlineForm, {
  PureTimespanInlineForm
} from './TimespanInlineForm';
import { shallow, mount } from 'enzyme';
import { testMetadataStructure } from '../test/TestStructure';
import Peaks from 'peaks';

describe('TimespanInlineForm component', () => {
  let wrapper, props;
  let options = {
    container: null,
    mediaElement: null,
    dataUri: null,
    dataUriDefaultFormat: 'json',
    keyboard: true,
    _zoomLevelIndex: 0,
    _zoomLevels: [512, 1024, 2048, 4096]
  };
  beforeEach(() => {
    const peaks = { peaks: Peaks.init(options) };
    props = {
      peaksInstance: peaks,
      smData: testMetadataStructure,
      segment: {
        startTime: 11.23,
        endTime: 480,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#FBB040',
        editable: true
      },
      activateSegment: jest.fn(),
      revertSegment: jest.fn(() => {}),
      saveSegment: jest.fn(),
      updateSegment: jest.fn(() => {}),
      changeSegment: jest.fn(),
      cancelFn: jest.fn()
    };
    wrapper = shallow(<TimespanInlineForm {...props} />);
  });

  test('renders without crashing', () => {
    expect(wrapper.find('#timespanTitle')).toBeDefined();
    expect(wrapper.find('#beginTime')).toBeDefined();
    expect(wrapper.find('#endTime')).toBeDefined();
    expect(wrapper.instance().props.smData).toEqual(testMetadataStructure);
  });

  describe('tests the pure TimespanInlineForm component', () => {
    let pureWrapper, item;
    beforeAll(() => {
      item = {
        id: '123a-456b-789c-4d'
      };
      pureWrapper = mount(<PureTimespanInlineForm {...props} item={item} />);
    });

    test('mounts pure component without crashing', () => {
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:11.23');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');
      expect(pureWrapper.instance().state.timespanTitle).toBe('Segment 1.2');
      expect(pureWrapper.instance().state.clonedSegment).toEqual({
        startTime: 11.23,
        endTime: 480,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#2A5459'
      });
      expect(pureWrapper.instance().state.isTyping).toBeFalsy();
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
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:11.23');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');

      // Simulate input feild
      pureWrapper
        .find('FormControl')
        .at(1)
        .simulate('change', {
          target: { id: 'beginTime', value: '00:00:10.45' }
        });

      // // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:10.45');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');
    });

    test('changing segment fires componentWillRecieveProps()', () => {
      // Test previous state values
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:10.45');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');
      // Change props
      const newSegment = {
        startTime: 10.33,
        endTime: 480,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#FBB040',
        editable: true
      };
      let newPeaks = cloneDeep(pureWrapper.instance().props.peaksInstance);
      newPeaks.peaks.segments.removeById('123a-456b-789c-4d');
      newPeaks.peaks.segments.add(newSegment);
      const newProps = {
        ...props,
        segment: newSegment,
        peaksInstance: newPeaks
      };
      // Set new props
      pureWrapper.setProps({
        ...newProps
      });
      // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:10.33');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');
    });

    test('changing end time to an invalid time fires componentWillRecieveProps()', () => {
      // Test previous state values
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:10.33');
      expect(pureWrapper.instance().state.endTime).toBe('00:08:00.00');
      // Change props
      const newSegment = {
        startTime: 10.33,
        endTime: 543.24,
        id: '123a-456b-789c-4d',
        labelText: 'Segment 1.2',
        color: '#FBB040',
        editable: true
      };
      let newPeaks = cloneDeep(pureWrapper.instance().props.peaksInstance);
      newPeaks.peaks.segments.removeById('123a-456b-789c-4d');
      newPeaks.peaks.segments.add(newSegment);
      const newProps = {
        ...props,
        segment: newSegment,
        peaksInstance: newPeaks
      };
      // Set new props
      pureWrapper.setProps({
        ...newProps
      });
      // Test state values after changing props
      expect(pureWrapper.instance().state.beginTime).toBe('00:00:10.33');
      expect(pureWrapper.instance().state.endTime).toBe('00:09:03.23');
    });
  });
});
