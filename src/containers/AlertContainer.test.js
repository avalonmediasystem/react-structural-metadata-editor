import React from 'react';
import { shallow } from 'enzyme';
import AlertContainer from './AlertContainer';

describe('AlertContainer', () => {
  let props, mockClearAlert;
  beforeEach(() => {
    props = {
      message: 'Ima test message',
      alertStyle: 'warning',
      clearAlert: jest.fn()
    };

    mockClearAlert = jest.fn(() => {
      props = null;
    });
  });
  it('renders without crashing', () => {
    const wrapper = shallow(<AlertContainer {...props} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
  });

  it('closes when state updates to not display the alert message', () => {
    props.clearAlert = mockClearAlert();
    const wrapper = shallow(<AlertContainer {...props} />);
    wrapper.setState({ show: false });
    expect(wrapper.find('Alert')).toHaveLength(0);
    expect(props).toBeNull();
  });
});
