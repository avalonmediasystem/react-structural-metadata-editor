import React from 'react';
import { cleanup, fireEvent, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import StructureOutputContainer from '../StructureOutputContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import { wrapInTestContext } from 'react-dnd-test-utils';
import mockAxios from 'axios';

const mockPeaks = jest.genMockFromModule('peaks.js');
mockPeaks.init = jest.fn(options => {
  return {
    options: options
  };
});

const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096]
};
// Set up Redux store for tests
const initialState = {
  forms: {
    structureInfo: {
      structureRetrieved: true,
      structureStatus: null
    }
  },
  structuralMetadata: {
    smData: testSmData
  }
};
const mockStructureIsSaved = jest.fn();

// Wrap the component in DnD context
let StructureOutputContext = null;

beforeEach(() => {
  StructureOutputContext = wrapInTestContext(StructureOutputContainer);
});

afterEach(cleanup);

test('StructureOutputContainer renders', () => {
  const { getByTestId } = renderWithRedux(
    <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
    {
      initialState
    }
  );
  expect(getByTestId('structure-output-section')).toBeInTheDocument();
});

test('shows structure list when there fetching structure.json is successful', () => {
  const { getByTestId, queryByTestId } = renderWithRedux(
    <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
    { initialState }
  );

  expect(getByTestId('structure-output-list')).toBeInTheDocument();
  expect(getByTestId('structure-save-button')).toBeInTheDocument();
  // Alert is not present in the DOM
  expect(queryByTestId('alert-container')).not.toBeInTheDocument();
});

test('shows an error message when there is an error in fetching structure.json', () => {
  const { rerenderWithRedux, getByTestId } = renderWithRedux(
    <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
    { initialState }
  );
  const nextState = {
    forms: {
      structureInfo: {
        structureRetrieved: false,
        structureStatus: 401
      }
    },
    structuralMetadata: {
      smData: testSmData
    },
    peaksInstance: {
      peaks: mockPeaks.init(peaksOptions)
    }
  };
  rerenderWithRedux(<StructureOutputContext />, nextState);
  expect(getByTestId('alert-container')).toBeInTheDocument();
  expect(getByTestId('alert-message').innerHTML).toBe(
    "You're not authorized to access this resource."
  );
});

describe('saving structure back to server', () => {
  let structureContainer;
  beforeEach(() => {
    structureContainer = renderWithRedux(
      <StructureOutputContext
        baseURL={'https://example.com'}
        masterFileID={'12zd9s459'}
        structureIsSaved={mockStructureIsSaved}
      />,
      { initialState }
    );
  });

  test('is successful', async () => {
    mockAxios.post.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200
      });
    });

    fireEvent.click(structureContainer.getByTestId('structure-save-button'));

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://example.com/master_files/12zd9s459/structure.json',
      { json: testSmData[0] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    await wait(() => {
      expect(
        structureContainer.getByTestId('alert-container')
      ).toBeInTheDocument();
      expect(structureContainer.getByTestId('alert-message').innerHTML).toBe(
        'Saved successfully.'
      );
    });
  });

  test('is failing', async () => {
    mockAxios.post.mockImplementationOnce(() => {
      return Promise.reject({
        response: {
          status: 404
        }
      });
    });

    fireEvent.click(structureContainer.getByTestId('structure-save-button'));

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://example.com/master_files/12zd9s459/structure.json',
      { json: testSmData[0] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    await wait(() => {
      expect(
        structureContainer.getByTestId('alert-container')
      ).toBeInTheDocument();
      expect(structureContainer.getByTestId('alert-message').innerHTML).toBe(
        'Requested data not available.'
      );
    });
  });
});
