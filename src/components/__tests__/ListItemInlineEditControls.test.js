import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import ListItemInlineEditControls from '../ListItemInlineEditControls';
import { render } from 'react-testing-library';

afterEach(cleanup);

const handleSaveClickMock = jest.fn();
const handleCancelClickMock = jest.fn();

test('ListItemInlineEditControls component renders', () => {
  const { getByTestId } = render(<ListItemInlineEditControls />);
  expect(getByTestId('inline-form-controls')).toBeInTheDocument();
});

test('renders with props', () => {
  const props = {
    formIsValid: true,
    handleSaveClick: handleSaveClickMock,
    handleCancelClick: handleCancelClickMock
  };
  const { getByTestId } = render(<ListItemInlineEditControls {...props} />);
  expect(getByTestId('inline-form-controls')).toBeInTheDocument();

  expect(getByTestId('inline-form-save-button')).toBeInTheDocument();
  expect(getByTestId('inline-form-cancel-button')).toBeInTheDocument();
});

test('save button is disabled/enabled when form is invalid/valid and cancel button is enabled regardless', () => {
  const props = {
    formIsValid: false,
    handleSaveClick: handleSaveClickMock,
    handleCancelClick: handleCancelClickMock
  };
  const { rerender, getByTestId } = render(
    <ListItemInlineEditControls {...props} />
  );

  expect(getByTestId('inline-form-save-button')).toBeDisabled();
  expect(getByTestId('inline-form-cancel-button')).toBeEnabled();

  const nextProps = {
    formIsValid: true,
    handleSaveClick: handleSaveClickMock,
    handleCancelClick: handleCancelClickMock
  };

  rerender(<ListItemInlineEditControls {...nextProps} />);

  expect(getByTestId('inline-form-save-button')).toBeEnabled();
  expect(getByTestId('inline-form-cancel-button')).toBeEnabled();
});

describe('close inline form', () => {
  let props, utils;
  beforeEach(() => {
    props = {
      formIsValid: true,
      handleSaveClick: handleSaveClickMock,
      handleCancelClick: handleCancelClickMock
    };
    utils = render(<ListItemInlineEditControls {...props} />);
  });

  test('click save button', () => {
    fireEvent.click(utils.getByTestId('inline-form-save-button'));
    expect(handleSaveClickMock).toHaveBeenCalledTimes(1);
  });

  test('click cancel button', () => {
    fireEvent.click(utils.getByTestId('inline-form-cancel-button'));
    expect(handleCancelClickMock).toHaveBeenCalledTimes(1);
  });
});
