import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux } from '../../services/testing-helpers';
import AlertContainer from '../AlertContainer';

afterEach(cleanup);

const mockRemoveAlert = jest.fn();

describe('AlertContainer component', () => {
  test('does not render without props', () => {
    const { queryByTestId } = renderWithRedux(<AlertContainer />, {});
    expect(queryByTestId('alert-container')).not.toBeInTheDocument();
  });

  test('renders with props', () => {
    const props = {
      alerts: [
        {
          alertStyle: 'danger',
          message: 'Error message',
          id: '1234-5678-90ab',
        },
      ],
    };
    const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {});
    expect(getByTestId('alert-container')).toBeInTheDocument();
    expect(getByTestId('alert-message').innerHTML).toBe('Error message');
  });

  test('closes alert when close button is pressed', () => {
    const props = {
      alerts: [
        {
          alertStyle: 'success',
          message: 'Success message',
          id: '1234-5678-90ab',
          persistent: false,
        },
      ],
      removeAlert: mockRemoveAlert,
    };
    const { container } = renderWithRedux(<AlertContainer {...props} />, {});
    const closeButton = container.querySelector('button');
    fireEvent.click(closeButton);
    expect(mockRemoveAlert).toHaveBeenCalledTimes(1);
  });

  test('alert closes when timed out', () => {
    const delay = 2000;
    const props = {
      alerts: [
        {
          alertStyle: 'success',
          message: 'Success message',
          id: '1234-5678-90ab',
          delay: delay,
          persistent: false,
        },
      ],
    };

    const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {});

    setTimeout(() => {
      expect(getByTestId('alert-container')).not.toBeInTheDocument();
    }, delay);
  });
});
