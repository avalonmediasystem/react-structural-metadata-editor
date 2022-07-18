import React from 'react';
import { cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import StructureOutputContainer from '../StructureOutputContainer';
import {
  renderWithRedux,
  testSmData,
} from '../../services/testing-helpers';
import { wrapInTestContext } from 'react-dnd-test-utils';

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
  structuralMetadata: {
    smData: testSmData,
    smDataIsValid: true,
  },
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
    initialState = {
      ...initialState,
      manifest: {
        manifestFetched: true,
        structure: testSmData
      }
    };
    const { getByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      {
        initialState,
      }
    );
    expect(getByTestId('structure-output-section')).toBeInTheDocument();
  });

  test('shows structure list when manifest has structure', () => {
    initialState = {
      ...initialState,
      manifest: {
        manifestFetched: true,
        structure: testSmData
      }
    };
    const { getByTestId, queryByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      { initialState }
    );

    expect(getByTestId('structure-output-list')).toBeInTheDocument();
    expect(getByTestId('structure-save-button')).toBeInTheDocument();
    // Alert is not present in the DOM
    expect(queryByTestId('alert-container')).not.toBeInTheDocument();
  });

  test('doesn\'t show structure list when manifest doesn\'t have structure', () => {
    initialState = {
      ...initialState,
      manifest: {
        manifestFetched: true,
        structure: null
      }
    };
    const { queryByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      { initialState }
    );

    expect(queryByTestId('structure-output-list')).not.toBeInTheDocument();
    expect(queryByTestId('structure-save-button')).not.toBeInTheDocument();
    // Alert is not present in the DOM
    expect(queryByTestId('alert-container')).not.toBeInTheDocument();
  });
});
