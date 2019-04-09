import React from 'react';
import { PureButtonSection } from './ButtonSection';
import { shallow } from 'enzyme';
import { testMetadataStructure } from '../test/TestStructure';
import Peaks from 'peaks';
import WaveformDataUtils from '../services/WaveformDataUtils';

const waveformUtils = new WaveformDataUtils();

describe('ButtonSection component', () => {
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
    let initforms = {
      editingDisabled: false,
      structureRetrieved: true,
      waveformRetrieved: true
    };
    props = {
      peaksInstance: peaks,
      smData: testMetadataStructure,
      forms: initforms,
      createTempSegment: jest.fn(() => {
        waveformUtils.insertTempSegment(peaks.peaks);
      }),
      handleEditingTimespans: jest.fn(code => {
        if (code === 0) {
          initforms.editingDisabled = true;
        } else {
          initforms.editingDisabled = false;
        }
      })
    };
    wrapper = shallow(<PureButtonSection {...props} />);
  });

  test('component renders without crashing', () => {
    const {
      headingOpen,
      timespanOpen,
      isInitializing,
      initSegment,
      alertObj,
      disabled
    } = wrapper.instance().state;
    expect(wrapper).toMatchSnapshot();
    expect(headingOpen).toBeFalsy();
    expect(timespanOpen).toBeFalsy();
    expect(isInitializing).toBeTruthy();
    expect(initSegment).toBeNull();
    expect(alertObj).toBeNull();
    expect(disabled).toBeTruthy();
    expect(wrapper.find('Button').at(0)).toBeDefined();
  });

  test('component render null when structureRetrieved & waveformRetrieved are false', () => {
    const newProps = {
      ...props,
      forms: {
        structureRetrieved: false,
        waveformRetrieved: false
      }
    };
    // Set props which re-renders the component
    wrapper.setProps({
      ...newProps
    });
    // Component is null when both structure & waveform master files are not retrieved
    expect(wrapper.type()).toBeNull();
  });

  test('component render null when either structureRetrieved or waveformRetrieved is false', () => {
    const newProps = {
      ...props,
      forms: {
        structureRetrieved: true,
        waveformRetrieved: false
      }
    };
    // Set props which re-renders the component
    wrapper.setProps({
      ...newProps
    });
    // Component is null when both structure & waveform master files are not retrieved
    expect(wrapper.type()).toBeNull();
  });

  test('tests Add a Heading', () => {
    const addheading = wrapper.find('Button').at(0);
    addheading.simulate('click');

    expect(wrapper.instance().props.forms.editingDisabled).toBeTruthy();

    expect(wrapper.instance().state.headingOpen).toBeTruthy();
    expect(wrapper.instance().state.timespanOpen).toBeFalsy();
    expect(wrapper.instance().state.disabled).toBeFalsy();
  });

  test('tests Add a Timespan', () => {
    // Move the playhead to a time within an existing segment
    wrapper.instance().props.peaksInstance.peaks.player.seek(450);

    const addSpan = wrapper.find('Button').at(1);
    addSpan.simulate('click');

    expect(wrapper.instance().props.createTempSegment).toHaveBeenCalled();
    expect(wrapper.instance().props.forms.editingDisabled).toBeTruthy();

    expect(wrapper.instance().state.timespanOpen).toBeTruthy();
    expect(wrapper.instance().state.headingOpen).toBeFalsy();
    expect(wrapper.instance().state.disabled).toBeFalsy();
    expect(wrapper.instance().state.initSegment).toEqual({
      id: 'temp-segment',
      startTime: 480.01,
      endTime: 540.01,
      editable: true,
      color: '#FBB040'
    });
  });

  test('tests Add a Timespan when there is no space to add a new timespan', () => {
    const { peaks } = wrapper.instance().props.peaksInstance;
    // Prep work: add segments to reach the end of the file
    peaks.segments.add([
      {
        startTime: 900.01,
        endTime: 1200.99,
        id: '123a-456b-789c-9d',
        editable: true,
        color: '#FBB040'
      },
      {
        startTime: 1201,
        endTime: 1738.95,
        id: '123a-456b-789c-10d',
        editable: true,
        color: '#FBB040'
      }
    ]);
    // Move the playhead to a time within an existing segment
    peaks.player.seek(1200);
    wrapper
      .find('Button')
      .at(1)
      .simulate('click');

    expect(wrapper.instance().props.forms.editingDisabled).toBeTruthy();

    expect(wrapper.instance().state.disabled).toBeFalsy();
    expect(wrapper.instance().state.alertObj.alertStyle).toEqual('warning');
    expect(wrapper.instance().state.alertObj.message).toEqual(
      'Time ahead has timespans reaching the end of media file, there is no available time to insert a new timespan'
    );
    expect(wrapper.instance().state.timespanOpen).toBeFalsy();
  });
});
