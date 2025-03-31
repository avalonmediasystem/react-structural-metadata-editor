import React from 'react';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../../services/testing-helpers';
import AlertContainer from '../AlertContainer';

afterEach(cleanup);

const mockRemoveAlert = jest.fn();

const delay = 2000;
const initialState = {
  forms: {
    alerts: [
      {
        alertStyle: 'danger',
        message: 'Error message',
        id: '1234-5667-8901-be1g3',
        persistent: false,
        delay: delay,
      },
    ],
  },
};

const props = {
  removeAlert: mockRemoveAlert,
};

describe('AlertContainer component', () => {
  test('does not render without props', () => {
    const { queryByTestId } = renderWithRedux(<AlertContainer />, {});
    expect(queryByTestId('alert-container')).not.toBeInTheDocument();
  });

  test('renders successfully with props', () => {
    const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {
      initialState,
    });
    expect(getByTestId('alert-container')).toBeInTheDocument();
    expect(getByTestId('alert-message').innerHTML).toBe('Error message');
  });

  test('closes alert when close button is pressed', () => {
    const { container } = renderWithRedux(<AlertContainer {...props} />, {
      initialState,
    });
    const closeButton = container.querySelector('button');
    fireEvent.click(closeButton);
    expect(mockRemoveAlert).toHaveBeenCalledTimes(1);
  });

  test('alert closes when timed out', () => {
    const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {
      initialState,
    });

    expect(getByTestId('alert-container')).toBeInTheDocument();
    expect(getByTestId('alert-message').innerHTML).toBe('Error message');
    setTimeout(() => {
      expect(getByTestId('alert-container')).not.toBeInTheDocument();
    }, delay);
  });
});
