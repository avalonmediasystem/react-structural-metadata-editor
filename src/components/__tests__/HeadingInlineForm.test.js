import React from 'react';
import { fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import HeadingInlineForm from '../HeadingInlineForm';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

const initialState = {
  structuralMetadata: {
    smData: testSmData
  }
};

const validItem = {
  type: 'div',
  label: 'Sub-Segment 1.1',
  id: '123a-456b-789c-2d',
  items: []
};

const invalidItem = {
  type: 'div',
  label: 'A ',
  id: '123a-456b-789c-9d',
  items: []
};

afterEach(cleanup);

test('the HeadingInlineForm renders', () => {
  const { getByTestId } = renderWithRedux(
    <HeadingInlineForm item={validItem} />,
    {
      initialState
    }
  );
  expect(getByTestId('heading-inline-form')).toBeInTheDocument();
});

describe('heading title input shows proper validation messages', () => {
  test('existing heading is valid', () => {
    const { getByLabelText, getByTestId } = renderWithRedux(
      <HeadingInlineForm item={validItem} />,
      { initialState }
    );

    const titleInput = getByLabelText(/title/i);
    const formGroup = getByTestId('inline-heading-title-form-group');

    expect(titleInput.value).toBe('Sub-Segment 1.1');
    expect(formGroup.classList.contains('has-success')).toBeTruthy();
  });

  test('existing heading is invalid', () => {
    const { getByLabelText, getByTestId } = renderWithRedux(
      <HeadingInlineForm item={invalidItem} />,
      { initialState }
    );

    const titleInput = getByLabelText(/title/i);
    const formGroup = getByTestId('inline-heading-title-form-group');

    expect(titleInput.value).toBe('A ');
    expect(formGroup.classList.contains('has-error')).toBeTruthy();
  });

  test('changing heading', () => {
    const { getByLabelText, getByTestId } = renderWithRedux(
      <HeadingInlineForm item={validItem} />,
      { initialState }
    );

    const titleInput = getByLabelText(/title/i);
    const formGroup = getByTestId('inline-heading-title-form-group');

    fireEvent.change(titleInput, {
      target: {
        value: 'New heading'
      }
    });
    expect(formGroup.classList.contains('has-success')).toBeTruthy();

    fireEvent.change(titleInput, {
      target: {
        value: 'T'
      }
    });
    expect(formGroup.classList.contains('has-success')).toBeFalsy();
    expect(formGroup.classList.contains('has-error')).toBeTruthy();
  });
});

test('save button is enabled only when form is valid', () => {
  const { getByLabelText, getByTestId } = renderWithRedux(
    <HeadingInlineForm item={invalidItem} />,
    { initialState }
  );

  const titleInput = getByLabelText(/title/i);
  const saveButton = getByTestId('inline-form-save-button');

  // Disabled initially with existing invalid title
  expect(saveButton).toBeDisabled();

  fireEvent.change(titleInput, {
    target: { value: 'New Heading' }
  });
  expect(saveButton).toBeEnabled();
});

describe('submitting the inline heading form', () => {
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
      target: { value: 'New Heading' }
    });
  });

  test('saves the correct values', () => {
    fireEvent.click(utils.getByTestId('inline-form-save-button'));
    expect(saveFnMock).toBeCalledWith('123a-456b-789c-9d', {
      headingTitle: 'New Heading'
    });
    expect(saveFnMock).toHaveBeenCalledTimes(1);
  });
  test('cancel the form', () => {
    fireEvent.click(utils.getByTestId('inline-form-cancel-button'));
    expect(cancelFnMock).toHaveBeenCalledTimes(1);
  });
});
