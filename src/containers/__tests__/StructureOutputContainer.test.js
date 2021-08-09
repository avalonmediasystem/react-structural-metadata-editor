import React from 'react';
import { cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import StructureOutputContainer from '../StructureOutputContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import { wrapInTestContext } from 'react-dnd-test-utils';

const mockPeaks = jest.genMockFromModule('peaks.js');
mockPeaks.init = jest.fn((options) => {
  return {
    options: options,
  };
});

// Set up Redux store for tests
const initialState = {
  forms: {
    structureInfo: {
      structureRetrieved: true,
      structureStatus: null,
    },
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
    const { getByTestId } = renderWithRedux(
      <StructureOutputContext structureIsSaved={mockStructureIsSaved} />,
      {
        initialState,
      }
    );
    expect(getByTestId('structure-output-section')).toBeInTheDocument();
  });

  test('shows structure list when fetching structure.json is successful', () => {
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
          structureStatus: 401,
        },
      },
      structuralMetadata: {
        smData: testSmData,
        smDataIsValid: true,
      },
      peaksInstance: {
        peaks: mockPeaks.init(peaksOptions),
      },
    };
    rerenderWithRedux(<StructureOutputContext />, nextState);
    expect(getByTestId('alert-container')).toBeInTheDocument();
    expect(getByTestId('alert-message').innerHTML).toBe(
      "You're not authorized to access this resource."
    );
  });

  describe('saving structure back to server', () => {
    let structureContainer, saveButton;
    beforeEach(() => {
      structureContainer = renderWithRedux(
        <StructureOutputContext
          baseURL={'https://example.com'}
          masterFileID={'12zd9s459'}
          structureIsSaved={mockStructureIsSaved}
        />,
        { initialState }
      );
      saveButton = structureContainer.getByTestId('structure-save-button');
    });

    describe('save request is successful', () => {
      beforeEach(() => {
        mockAxios.post.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
          });
        });

        fireEvent.click(saveButton);
      });

      test('shows success alert', async () => {
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
          expect(
            structureContainer.getByTestId('alert-message').innerHTML
          ).toBe('Saved successfully.');
        });
      });

      test('alert closes after 2000ms', async () => {
        await wait(() => {
          expect(
            structureContainer.getByTestId('alert-container')
          ).toBeInTheDocument();
        });

        setTimeout(() => {
          expect(
            structureContainer.getByTestId('alert-container')
          ).not.toBeInTheDocument();
        }, 2000);
      });

      test('alert closes when structure is edited again', async () => {
        await wait(() => {
          expect(
            structureContainer.getByTestId('alert-container')
          ).toBeInTheDocument();

          fireEvent.click(
            structureContainer.queryAllByTestId('list-item-edit-btn')[0]
          );
        });

        expect(
          structureContainer.queryByTestId('alert-container')
        ).not.toBeInTheDocument();
      });
    });

    test('save request is failing', async () => {
      mockAxios.post.mockImplementationOnce(() => {
        return Promise.reject({
          response: {
            status: 404,
          },
        });
      });

      fireEvent.click(saveButton);

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
          'Requested data is not available.'
        );
      });
    });
  });
});
