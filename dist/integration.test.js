import React from 'react';
import { cleanup, wait, fireEvent, queryByText } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { wrapInTestContext } from 'react-dnd-test-utils';
import StructureOutputContainer from './containers/StructureOutputContainer';
import ButtonSection from './components/ButtonSection';
import { renderWithRedux, testSmData } from './services/testing-helpers';
import Peaks from 'peaks';

// Set up a redux store for the tests
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
};

let peaksInst = null;
Peaks.init(peaksOptions, (err, peaks) => {
  peaksInst = peaks;
});

const initialState = {
  forms: {
    waveformRetrieved: true,
    streamInfo: {
      streamMediaError: false,
      streamMediaLoading: false,
    },
    structureInfo: {
      structureRetrieved: true,
    },
    alerts: [],
  },
  peaksInstance: {
    peaks: peaksInst,
    duration: 1738.945,
  },
  manifest: { manifestFetched: true },
  structuralMetadata: { smData: testSmData },
};
const mockStructureIsSaved = jest.fn();
const props = {
  structureIsSaved: mockStructureIsSaved,
  canvasIndex: 0,
  manifestURL: 'https://example.com/manifest.json',
  structureURL: 'https://example.com/structure.json'
};

describe('ButtonSection/StructureOutputContainer renders', () => {
  // Wrap the component in DnD context
  let StructureOutputContext = null;

  beforeEach(() => {
    StructureOutputContext = wrapInTestContext(StructureOutputContainer);
  });
  afterEach(() => {
    cleanup();
  });

  test('the structure tree when a new timespan is added', () => {
    let app = renderWithRedux(
      <>
        <ButtonSection />
        <StructureOutputContext {...props} />
      </>, {
      initialState,
    });

    // Before making changes
    expect(app.getByTestId('structure-output-list')).toBeInTheDocument();
    expect(app.getByTestId('add-timespan-button')).toBeInTheDocument();
    expect(app.queryByTestId('structure-save-button')).toBeInTheDocument();

    /* Start adding a new timespan */
    const addTimespanBtn = app.getByTestId('add-timespan-button');
    fireEvent.click(addTimespanBtn);

    // Begin Time and End Time is already filled with default values
    // and title is empty
    expect(app.getByTestId('timespan-form-begintime').value).toBe(
      '00:00:00.000'
    );
    expect(app.getByTestId('timespan-form-endtime').value).toBe(
      '00:00:03.321'
    );
    expect(app.getByTestId('timespan-form-title').value).toBe('');
    // Change the title of the timespan
    fireEvent.change(app.getByTestId('timespan-form-title'),
      {
        target: { value: 'New Timespan' }
      }
    );
    expect(app.getByTestId('timespan-form-title').value).toBe('New Timespan');
    // Make the new element child of the root element
    fireEvent.change(app.getByTestId('timespan-form-childof'), {
      target: { value: '123a-456b-789c-1d' },
    });
    // Save the new timespan
    fireEvent.click(app.getByTestId('timespan-form-save-button'));
    /* End adding a new timespan */

    // Check the first element since new timespan was inserted to the
    // top of the structure
    expect(
      app.queryAllByTestId('timespan-label')[0].innerHTML).toEqual(
        ' New Timespan (00:00:00.000 - 00:00:03.321)'
      );
  });
});
