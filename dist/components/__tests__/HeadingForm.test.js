import React from 'react';
import { fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import HeadingForm from '../HeadingForm';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

const initialState = {
  smData: testSmData
};

afterEach(cleanup);

test('the HeadingForm renders', () => {
  const { getByTestId } = renderWithRedux(<HeadingForm />);
  expect(getByTestId('heading-form')).toBeInTheDocument();
});

test('save button is disabled at initial render', () => {
  const { getByTestId } = renderWithRedux(<HeadingForm />);
  expect(getByTestId('heading-form-save-button')).toBeDisabled();
});

test('select child options are available in dropdown', () => {
  const { container, getByTestId } = renderWithRedux(<HeadingForm />, {
    initialState
  });
  const el = container.querySelector('#headingChildOf');
  expect(el.children.length).toBe(8);
  expect(el.children[1].value).toBe('123a-456b-789c-0d');
});

test('heading title input shows proper validation messages', async () => {
  const { container, getByLabelText, getByTestId, debug } = renderWithRedux(
    <HeadingForm />,
    {
      initialState
    }
  );

  const titleInput = getByLabelText(/title/i);
  const formGroup = getByTestId('heading-title-form-group');

  fireEvent.change(titleInput, {
    target: {
      value: 'abcde'
    }
  });
  expect(formGroup.classList.contains('has-success'));

  fireEvent.change(titleInput, { target: { value: 'a' } });
  expect(formGroup.classList.contains('has-success')).toBeFalsy();
  expect(formGroup.classList.contains('has-error')).toBeTruthy();
});

test('Save button has enabled state only when heading form is valid', () => {
  const { getByLabelText, getByTestId, debug } = renderWithRedux(
    <HeadingForm />,
    {
      initialState
    }
  );

  const titleInput = getByLabelText(/title/i);
  const submitButton = getByTestId('heading-form-save-button');
  const childOfSelect = getByLabelText(/child of/i);

  // Disabled by default
  expect(submitButton).toBeDisabled();

  // Make title valid
  fireEvent.change(titleInput, {
    target: { value: 'A title here' }
  });
  expect(submitButton).toBeDisabled();

  // Make child of valid
  fireEvent.change(childOfSelect, {
    target: { value: '123a-456b-789c-5d' }
  });
  expect(submitButton).toBeEnabled();

  // Make title invalid
  fireEvent.change(titleInput, { target: { value: 'z' } });
  expect(submitButton).toBeDisabled();
});

describe('submitting the form', () => {
  let utils;
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    utils = renderWithRedux(<HeadingForm onSubmit={onSubmitMock} />, {
      initialState
    });
    fireEvent.change(utils.getByLabelText(/title/i), {
      target: { value: 'A title here' }
    });
    fireEvent.change(utils.getByLabelText(/child of/i), {
      target: { value: '123a-456b-789c-5d' }
    });
    fireEvent.click(utils.getByTestId('heading-form-save-button'));
  });

  test('submits the correct data and payload structure', () => {
    const expectedPayload = {
      headingChildOf: '123a-456b-789c-5d',
      headingTitle: 'A title here'
    };

    expect(onSubmitMock).toBeCalledWith(expectedPayload);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  test('clears out the form after submitting', () => {
    expect(utils.getByLabelText(/title/i).value).toBe('');
  });
});
