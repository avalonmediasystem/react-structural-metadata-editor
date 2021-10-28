import * as types from '../actions/types';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { fromEvent } from 'rxjs';

const waveformUtils = new WaveformDataUtils();
const initialState = {
  peaks: {},
  events: {},
  segment: null,
  isDragging: false,
  startTimeChanged: null,
  duration: null,
  readyPeaks: false,
};
let newPeaks = null;
let updatedSegment = null;

const peaksInstance = (state = initialState, action) => {
  switch (action.type) {
    case types.INIT_PEAKS:
      let peaksInstance = action.peaksInstance;

      return {
        peaks: peaksInstance,
        events: {
          dragged: peaksInstance
            ? fromEvent(peaksInstance, 'segments.dragged')
            : null,
        },
        segment: { ...state.segment },
        duration: action.duration,
      };

    case types.PEAKS_READY:
      return {
        ...state,
        readyPeaks: action.payload,
      };

    case types.INSERT_SEGMENT:
      state.peaks.segments.add(
        waveformUtils.convertTimespanToSegment(action.payload)
      );
      newPeaks = waveformUtils.rebuildPeaks({ ...state.peaks });
      return {
        ...state,
        peaks: newPeaks,
      };

    case types.DELETE_SEGMENT:
      newPeaks = waveformUtils.deleteSegments(action.payload, {
        ...state.peaks,
      });
      return {
        ...state,
        peaks: waveformUtils.rebuildPeaks(newPeaks),
      };

    case types.ACTIVATE_SEGMENT:
      newPeaks = waveformUtils.activateSegment(
        action.payload,
        {
          ...state.peaks,
        },
        state.duration
      );
      return {
        ...state,
        peaks: newPeaks,
      };

    case types.INSERT_PLACEHOLDER:
      newPeaks = waveformUtils.addTempInvalidSegment(
        action.item,
        action.wrapperSpans,
        {
          ...state.peaks,
        },
        state.duration
      );
      return {
        ...state,
        peaks: newPeaks,
      };

    case types.SAVE_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(
        action.payload.clonedSegment,
        true,
        {
          ...state.peaks,
        }
      );
      let rebuiltPeaks = waveformUtils.saveSegment(action.payload, {
        ...newPeaks,
      });
      return {
        ...state,
        isDragging: false,
        peaks: rebuiltPeaks,
      };

    case types.REVERT_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload, false, {
        ...state.peaks,
      });
      return {
        ...state,
        isDragging: false,
        peaks: waveformUtils.revertSegment(action.payload, {
          ...newPeaks,
        }),
      };

    case types.UPDATE_SEGMENT:
      newPeaks = waveformUtils.updateSegment(action.segment, action.state, {
        ...state.peaks,
      });
      updatedSegment = newPeaks.segments.getSegment(action.segment.id);
      return {
        ...state,
        peaks: { ...newPeaks },
        segment: updatedSegment,
      };

    case types.IS_DRAGGING:
      return {
        ...state,
        segment: state.peaks.segments.getSegment(action.segmentID),
        startTimeChanged: action.startTimeChanged,
        isDragging: action.flag === 1 ? true : false,
      };

    case types.TEMP_INSERT_SEGMENT:
      newPeaks = waveformUtils.insertTempSegment(
        { ...state.peaks },
        state.duration
      );
      return {
        ...state,
        peaks: { ...newPeaks },
      };

    case types.TEMP_DELETE_SEGMENT:
      state.peaks.segments.removeById(action.payload);
      return { ...state };

    default:
      return state;
  }
};

export default peaksInstance;
