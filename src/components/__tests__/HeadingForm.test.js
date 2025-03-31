import React from 'react';
import { fireEvent, cleanup } from '@testing-library/react';
import HeadingForm from '../HeadingForm';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
};

afterEach(cleanup);

describe('HeadingForm component', () => {
  test('renders successfully', () => {
    const { getByTestId } = renderWithRedux(<HeadingForm />);
    expect(getByTestId('heading-form')).toBeInTheDocument();
  });

  describe('renders form with', () => {
    test('save button is disabled', () => {
      const { getByTestId } = renderWithRedux(<HeadingForm />);
      expect(getByTestId('heading-form-save-button')).toBeDisabled();
    });

    test('child options in dropdown menu', () => {
      const { container } = renderWithRedux(<HeadingForm />, {
        initialState,
      });
      const el = container.querySelector('#headingChildOf');
      expect(el.children.length).toBe(8);
      expect(el.children[1].value).toBe('123a-456b-789c-0d');
    });
  });

  describe('validates', () => {
    test('heading title', async () => {
      const { container, getByLabelText, getByTestId } = renderWithRedux(
        <HeadingForm />,
        {
          initialState,
        }
      );

      const titleInput = getByLabelText(/title/i);
      const formControl = getByTestId('heading-title-form-control');

      fireEvent.change(titleInput, {
        target: {
          value: 'abcde',
        },
      });
      expect(formControl.className.includes('is-valid')).toBeTruthy();

      fireEvent.change(titleInput, { target: { value: 'a' } });
      expect(formControl.className.includes('is-valid')).toBeFalsy();
      expect(formControl.className.includes('is-invalid')).toBeTruthy();
    });
    test('form with enabling save button', () => {
      const { getByLabelText, getByTestId, debug } = renderWithRedux(
        <HeadingForm />,
        {
          initialState,
        }
      );

      const titleInput = getByLabelText(/title/i);
      const submitButton = getByTestId('heading-form-save-button');
      const childOfSelect = getByLabelText(/child of/i);

      // Disabled by default
      expect(submitButton).toBeDisabled();

      // Make title valid
      fireEvent.change(titleInput, {
        target: { value: 'A title here' },
      });
      expect(submitButton).toBeDisabled();

      // Make child of valid
      fireEvent.change(childOfSelect, {
        target: { value: '123a-456b-789c-5d' },
      });
      expect(submitButton).toBeEnabled();

      // Make title invalid
      fireEvent.change(titleInput, { target: { value: 'z' } });
      expect(submitButton).toBeDisabled();
    });
  });
  describe('submits the form', () => {
    let utils;
    const onSubmitMock = jest.fn();

    beforeEach(() => {
      utils = renderWithRedux(<HeadingForm onSubmit={onSubmitMock} />, {
        initialState,
      });
      fireEvent.change(utils.getByLabelText(/title/i), {
        target: { value: 'A title here' },
      });
      fireEvent.change(utils.getByLabelText(/child of/i), {
        target: { value: '123a-456b-789c-5d' },
      });
      fireEvent.click(utils.getByTestId('heading-form-save-button'));
    });

    test('with correct data and payload structure', () => {
      const expectedPayload = {
        headingChildOf: '123a-456b-789c-5d',
        headingTitle: 'A title here',
      };

      expect(onSubmitMock).toBeCalledWith(expectedPayload);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    test('form clears after', () => {
      expect(utils.getByLabelText(/title/i).value).toBe('');
    });
  });
});
