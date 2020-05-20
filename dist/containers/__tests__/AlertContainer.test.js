import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux } from '../../services/testing-helpers';
import AlertContainer from '../AlertContainer';

afterEach(cleanup);

const mockClearAlert = jest.fn();

test('AlertContainer does not render without props', () => {
  const { queryByTestId } = renderWithRedux(<AlertContainer />, {});
  expect(queryByTestId('alert-container')).not.toBeInTheDocument();
});

test('AlertContainer renders with props', () => {
  const props = {
    message: 'Error message',
    alertStyle: 'danger',
    clearAlert: mockClearAlert,
  };
  const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {});
  expect(getByTestId('alert-container')).toBeInTheDocument();
  expect(getByTestId('alert-message').innerHTML).toBe('Error message');
});

test('alert closes', () => {
  const props = {
    message: 'Success message',
    alertStyle: 'success',
    clearAlert: mockClearAlert,
  };
  const { container } = renderWithRedux(<AlertContainer {...props} />, {});
  const closeButton = container.querySelector('button');
  fireEvent.click(closeButton);
  expect(mockClearAlert).toHaveBeenCalledTimes(1);
});

test('alert closes when timed out', () => {
  const delay = 2000;
  const props = {
    message: 'Success message',
    alertStyle: 'success',
    delay: delay,
    type: 'SAVE_FEEDBACK',
    clearAlert: mockClearAlert,
  };

  const { getByTestId } = renderWithRedux(<AlertContainer {...props} />, {});

  setTimeout(() => {
    expect(getByTestId('alert-container')).not.toBeInTheDocument();
  }, 0);
});
