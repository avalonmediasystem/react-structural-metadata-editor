import React from 'react';
import { cleanup, fireEvent } from '@testing-library/react';
import ListItemInlineEditControls from '../ListItemInlineEditControls';
import { render } from '@testing-library/react';

afterEach(cleanup);

const handleSaveClickMock = jest.fn();
const handleCancelClickMock = jest.fn();

describe('ListItemInlineEditControls component', () => {
  describe('renders', () => {
    test('without props', () => {
      const { getByTestId } = render(<ListItemInlineEditControls />);
      expect(getByTestId('inline-form-controls')).toBeInTheDocument();
    });

    test('with props', () => {
      const props = {
        formIsValid: true,
        handleSaveClick: handleSaveClickMock,
        handleCancelClick: handleCancelClickMock,
      };
      const { getByTestId } = render(<ListItemInlineEditControls {...props} />);
      expect(getByTestId('inline-form-controls')).toBeInTheDocument();

      expect(getByTestId('inline-form-save-button')).toBeInTheDocument();
      expect(getByTestId('inline-form-cancel-button')).toBeInTheDocument();
    });
  });

  describe('validates form', () => {
    test('and disbales/enables save button', () => {
      const props = {
        formIsValid: false,
        handleSaveClick: handleSaveClickMock,
        handleCancelClick: handleCancelClickMock,
      };
      const { rerender, getByTestId } = render(
        <ListItemInlineEditControls {...props} />
      );

      expect(getByTestId('inline-form-save-button')).toBeDisabled();
      expect(getByTestId('inline-form-cancel-button')).toBeEnabled();

      const nextProps = {
        formIsValid: true,
        handleSaveClick: handleSaveClickMock,
        handleCancelClick: handleCancelClickMock,
      };

      rerender(<ListItemInlineEditControls {...nextProps} />);

      expect(getByTestId('inline-form-save-button')).toBeEnabled();
      expect(getByTestId('inline-form-cancel-button')).toBeEnabled();
    });
  });

  describe('closes inline form', () => {
    let props, utils;
    beforeEach(() => {
      props = {
        formIsValid: true,
        handleSaveClick: handleSaveClickMock,
        handleCancelClick: handleCancelClickMock,
      };
      utils = render(<ListItemInlineEditControls {...props} />);
    });

    test('by clicking save button', () => {
      fireEvent.click(utils.getByTestId('inline-form-save-button'));
      expect(handleSaveClickMock).toHaveBeenCalledTimes(1);
    });

    test('by clicking cancel button', () => {
      fireEvent.click(utils.getByTestId('inline-form-cancel-button'));
      expect(handleCancelClickMock).toHaveBeenCalledTimes(1);
    });
  });
});
