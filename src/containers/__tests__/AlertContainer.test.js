import React from 'react';
import { cleanup, render, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import AlertContainer from '../AlertContainer';

afterEach(cleanup);

const mockClearAlert = jest.fn();

test('AlertContainer does not render without props', () => {
  const { queryByTestId } = render(<AlertContainer />);
  expect(queryByTestId('alert-container')).not.toBeInTheDocument();
});

test('AlertContainer renders with props', () => {
  const props = {
    message: 'Error message',
    alertStyle: 'danger',
    clearAlert: mockClearAlert
  };
  const { getByTestId } = render(<AlertContainer {...props} />);
  expect(getByTestId('alert-container')).toBeInTheDocument();
  expect(getByTestId('alert-message').innerHTML).toBe('Error message');
});

test('alert closes', () => {
  const props = {
    message: 'Success message',
    alertStyle: 'success',
    clearAlert: mockClearAlert
  };
  const { container } = render(<AlertContainer {...props} />);
  const closeButton = container.querySelector('button');
  fireEvent.click(closeButton);
  expect(mockClearAlert).toHaveBeenCalledTimes(1);
});
