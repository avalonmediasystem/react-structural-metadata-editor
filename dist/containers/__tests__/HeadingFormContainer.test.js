import React from 'react';
import HeadingFormContainer from '../HeadingFormContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import { fireEvent } from '@testing-library/dom';

// Set up Redux store for tests
const initialState = {
  structuralMetadata: { smData: testSmData },
  peaksInstance: { duration: 100 }
};

describe('HeadingFormContainer', () => {
  test('renders without props', () => {
    const { getByTestId } = renderWithRedux(<HeadingFormContainer />);
    expect(getByTestId('heading-form')).toBeInTheDocument();
    expect(getByTestId('heading-form')).toHaveTextContent('Save');
    expect(getByTestId('heading-form-save-button')).toBeDisabled();
    expect(getByTestId('heading-form')).toHaveTextContent('Cancel');
  });

  test('renders with props', () => {
    const { getByTestId } = renderWithRedux(<HeadingFormContainer />, {
      initialState
    });
    expect(getByTestId('heading-form')).toBeInTheDocument();
    expect(getByTestId('heading-form')).toHaveTextContent('Save');
    expect(getByTestId('heading-form-save-button')).toBeDisabled();
    expect(getByTestId('heading-form')).toHaveTextContent('Cancel');
  });

  test('renders with initialState', () => {
    const { getByTestId } = renderWithRedux(<HeadingFormContainer cancelClick={jest.fn()} />, {
      initialState
    });
    expect(getByTestId('heading-form')).toBeInTheDocument();
    expect(getByTestId('heading-form')).toHaveTextContent('Save');
    expect(getByTestId('heading-form-save-button')).toBeDisabled();
    expect(getByTestId('heading-form')).toHaveTextContent('Cancel');
  });

  test('calls cancelClick when cancel button is clicked', () => {
    const mockCancelClick = jest.fn();
    const { getByText } = renderWithRedux(<HeadingFormContainer cancelClick={mockCancelClick} />, { initialState });

    fireEvent.click(getByText('Cancel'));
    expect(mockCancelClick).toHaveBeenCalled();
  });
});
