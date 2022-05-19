import React from 'react';
import { fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import HeadingInlineForm from '../HeadingInlineForm';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
};

const validItem = {
  type: 'div',
  label: 'Sub-Segment 1.1',
  id: '123a-456b-789c-2d',
  items: [],
};

const invalidItem = {
  type: 'div',
  label: 'A ',
  id: '123a-456b-789c-9d',
  items: [],
};

afterEach(cleanup);

describe('HeadingInlineForm component', () => {
  test('renders successfully', () => {
    const { getByTestId } = renderWithRedux(
      <HeadingInlineForm item={validItem} />,
      {
        initialState,
      }
    );
    expect(getByTestId('heading-inline-form')).toBeInTheDocument();
  });

  describe('validates form', () => {
    test('when existing heading is valid', () => {
      const { getByLabelText, getByTestId } = renderWithRedux(
        <HeadingInlineForm item={validItem} />,
        { initialState }
      );

      const titleInput = getByLabelText(/title/i);
      const formControl = getByTestId('inline-heading-title-form-control');

      expect(titleInput.value).toBe('Sub-Segment 1.1');
      expect(formControl.className.includes('is-valid')).toBeTruthy();
    });

    test('when existing heading is invalid', () => {
      const { getByLabelText, getByTestId } = renderWithRedux(
        <HeadingInlineForm item={invalidItem} />,
        { initialState }
      );

      const titleInput = getByLabelText(/title/i);
      const formControl = getByTestId('inline-heading-title-form-control');

      expect(titleInput.value).toBe('A ');
      expect(formControl.className.includes('is-invalid')).toBeTruthy();
    });

    test('when changing heading', () => {
      const { getByLabelText, getByTestId } = renderWithRedux(
        <HeadingInlineForm item={validItem} />,
        { initialState }
      );

      const titleInput = getByLabelText(/title/i);
      const formControl = getByTestId('inline-heading-title-form-control');

      fireEvent.change(titleInput, {
        target: {
          value: 'New heading',
        },
      });
      expect(formControl.className.includes('is-valid')).toBeTruthy();

      fireEvent.change(titleInput, {
        target: {
          value: 'T',
        },
      });
      expect(formControl.className.includes('is-valid')).toBeFalsy();
      expect(formControl.className.includes('is-invalid')).toBeTruthy();
    });

    test('enables save button when form is valid', () => {
      const { getByLabelText, getByTestId } = renderWithRedux(
        <HeadingInlineForm item={invalidItem} />,
        { initialState }
      );

      const titleInput = getByLabelText(/title/i);
      const saveButton = getByTestId('inline-form-save-button');

      // Disabled initially with existing invalid title
      expect(saveButton).toBeDisabled();

      fireEvent.change(titleInput, {
        target: { value: 'New Heading' },
      });
      expect(saveButton).toBeEnabled();
    });
  });

  describe('closes form', () => {
    let utils;
    const saveFnMock = jest.fn();
    const cancelFnMock = jest.fn();

    beforeEach(() => {
      utils = renderWithRedux(
        <HeadingInlineForm
          item={invalidItem}
          saveFn={saveFnMock}
          cancelFn={cancelFnMock}
        />,
        { initialState }
      );
      fireEvent.change(utils.getByLabelText(/title/i), {
        target: { value: 'New Heading' },
      });
    });

    test('by saving the correct values', () => {
      fireEvent.click(utils.getByTestId('inline-form-save-button'));
      expect(saveFnMock).toBeCalledWith('123a-456b-789c-9d', {
        headingTitle: 'New Heading',
      });
      expect(saveFnMock).toHaveBeenCalledTimes(1);
    });
    test('by cancelling', () => {
      fireEvent.click(utils.getByTestId('inline-form-cancel-button'));
      expect(cancelFnMock).toHaveBeenCalledTimes(1);
    });
  });
});
