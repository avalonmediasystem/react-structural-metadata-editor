import React from 'react';
import Waveform, { PureWaveform } from '../components/Waveform';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Peaks from 'peaks';

const mockStore = configureStore([thunk]);

describe('Waveform component', () => {
  let store, peaks;
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
    peaks = Peaks.init(options);
    store = mockStore({
      peaksInstance: {
        peaks: peaks
      }
    });
  });

  test('renders Waveform without crashing', () => {
    const waveformContainer = React.createRef();
    const mediaPlayer = React.createRef();
    const wrapper = shallow(
      <Provider store={store}>
        <Waveform ref={waveformContainer} ref={mediaPlayer} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('#waveform-container')).toBeDefined();
    expect(wrapper.find('audio')).toBeDefined();
  });

  describe('tests Waveform component view', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(
        <Provider store={store}>
          <Waveform waveformRef={() => {}} mediaPlayerRef={() => {}} />
        </Provider>
      );
    });

    test('renders audio element with src attribute', () => {
      expect(wrapper.find('audio').instance().src).toBe(
        'http://localhost/utah_phillips_one.mp3'
      );
      expect(wrapper.find('audio').instance().controls).toBeTruthy();
    });

    test('renders props correctly', () => {
      expect(
        wrapper.find(Waveform).instance().props.mediaPlayerRef
      ).toBeDefined();
      expect(wrapper.find(Waveform).instance().props.waveformRef).toBeDefined();
    });

    test('renders waveform control buttons', () => {
      expect(
        wrapper
          .find('Button')
          .at(0)
          .instance().props.className
      ).toBe('glyphicon glyphicon-zoom-in');

      expect(
        wrapper
          .find('Button')
          .at(1)
          .instance().props.className
      ).toBe('glyphicon glyphicon-zoom-out');
    });
  });

  test('tests zoom in button click', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Waveform waveformRef={() => {}} mediaPlayerRef={() => {}} />
      </Provider>
    );

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom
        ._zoomLevelIndex
    ).toEqual(2);

    wrapper
      .find('Button')
      .at(0)
      .simulate('click');

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom
        ._zoomLevelIndex
    ).toEqual(1);

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom.zoomIn
    ).toHaveBeenCalledTimes(1);
  });

  test('tests zoom out button click', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Waveform waveformRef={() => {}} mediaPlayerRef={() => {}} />
      </Provider>
    );

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom
        ._zoomLevelIndex
    ).toEqual(2);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click');

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom
        ._zoomLevelIndex
    ).toEqual(3);

    expect(
      wrapper.instance().props.store.getState().peaksInstance.peaks.zoom.zoomOut
    ).toHaveBeenCalledTimes(1);
  });

  test('tests input form for change event', () => {
    const wrapper = mount(
      <PureWaveform
        waveformRef={() => {}}
        mediaPlayerRef={() => {}}
        peaksInstance={peaks}
      />
    );

    expect(wrapper.find('FormControl').instance().props.value).toEqual('');

    // Mock user input through form
    wrapper.find('FormControl').simulate('change', { target: { value: '36' } });

    expect(wrapper.find('FormControl').instance().props.value).toEqual('36');
  });

  test('tests seek time button click', () => {
    let peaksIns = { peaks: peaks };
    const wrapper = mount(
      <PureWaveform
        waveformRef={() => {}}
        mediaPlayerRef={() => {}}
        peaksInstance={peaksIns}
      />
    );

    // Update state
    wrapper.setState({ seekTime: '36' });

    // Test current time of player instance before clicking seek button
    expect(
      wrapper.instance().props.peaksInstance.peaks.player._mediaElement
        .currentTime
    ).toEqual(0);

    wrapper
      .find('Button')
      .at(2)
      .simulate('click');

    // Test current time of the player instance after seek button is clicked
    expect(
      wrapper.instance().props.peaksInstance.peaks.player._mediaElement
        .currentTime
    ).toEqual(36);
  });
});
