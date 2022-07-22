import React from 'react';
import { cleanup, fireEvent, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import StructureOutputContainer from '../StructureOutputContainer';
import {
  renderWithRedux,
  testSmData,
} from '../../services/testing-helpers';
import { wrapInTestContext } from 'react-dnd-test-utils';
import mockAxios from 'axios';

const mockPeaks = jest.genMockFromModule('peaks.js');
mockPeaks.init = jest.fn((options) => {
  return {
    options: options,
  };
});

// Set up Redux store for tests
let initialState = {
  forms: {
    structureInfo: {
      structureSaved: true,
    },
    editingDisabled: false,
    alerts: [],
  },
  structuralMetadata: { smData: testSmData },
  manifest: {
    structure: testSmData,
    manifestFetched: true
  }
};

const mockStructureIsSaved = jest.fn();

// Wrap the component in DnD context
let StructureOutputContext = null;

beforeEach(() => {
  StructureOutputContext = wrapInTestContext(StructureOutputContainer);
});

afterEach(cleanup);

describe('StructureOutputContainer component', () => {
  test('renders successfully', () => {
    const { getByTestId, queryAllByTestId, getAllByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      {
        initialState,
      }
    );
    expect(getByTestId('structure-output-section')).toBeInTheDocument();
    expect(queryAllByTestId('list-item').length).toBeGreaterThan(0);
    expect(getAllByTestId('heading-label')[0].innerHTML).toEqual('Ima Title');
    expect(getByTestId('structure-save-button')).toBeInTheDocument();
  });

  test('saves structure successfully', async () => {
    mockAxios.post.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
      });
    });
    const { getByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      {
        initialState,
      }
    );
    fireEvent.click(getByTestId('structure-save-button'));
    await wait(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockStructureIsSaved).toHaveBeenCalledTimes(1);
    });
  });
});
