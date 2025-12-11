import React, { useEffect } from 'react';
import { nestedTestSmData, renderWithRedux, testSmData } from '../testing-helpers';
import Peaks from 'peaks';
import * as hooks from "../sme-hooks";

describe('sme-hooks', () => {
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
  let initialState = null;

  beforeAll(() => {
    Peaks.init(peaksOptions, (_err, peaks) => {
      peaksInst = peaks;
    });
  });

  beforeEach(() => {
    // Refresh Redux store for each test
    initialState = {
      structuralMetadata: {
        smData: testSmData,
        smDataIsValid: false,
      },
      manifest: {
        manifestFetched: true
      },
      peaksInstance: {
        peaks: peaksInst,
        readyPeaks: true,
      }
    };
  });

  describe('useFindNeighborSegments', () => {
    const resultRef = { current: null };
    const renderHook = (props = {}) => {
      const UIComponent = () => {
        const results = hooks.useFindNeighborSegments({
          ...props
        });
        useEffect(() => {
          resultRef.current = results;
        }, [results]);
        return (
          <div></div>
        );
      };
      return UIComponent;
    };

    describe('with non-nested structure', () => {
      test('returns prevSibling = null for first segment', () => {
        const CustomComponent = renderHook({
          segment: {
            _startTime: 3.321, _endTime: 10.321,
            _id: '123a-456b-789c-3d', labelText: 'Segment 1.1',
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.prevSiblingRef.current).toBeNull();
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.2');
      });

      test('returns nextSibling = null for last segment', () => {
        const CustomComponent = renderHook({
          segment: {
            _startTime: 543.241, _endTime: 900.001,
            _id: '123a-456b-789c-8d', labelText: 'Segment 2.1',
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).toBeNull();
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.2');
      });

      test('returns both siblings for a middle segment', () => {
        const CustomComponent = renderHook({
          segment: {
            _startTime: 11.231, _endTime: 480.001,
            _id: '123a-456b-789c-4d', labelText: 'Segment 1.2',
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 2.1');
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.1');
      });

      test('returns parentTimespan = null for segment', () => {
        const CustomComponent = renderHook({
          segment: {
            _startTime: 3.321,
            _endTime: 10.321,
            _id: '123a-456b-789c-3d',
            labelText: 'Segment 1.1',
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.parentTimespanRef.current).toBeNull();
      });
    });

    describe('with nested structure', () => {
      beforeEach(() => {
        // Refresh Redux store for each test
        initialState = {
          structuralMetadata: {
            smData: nestedTestSmData,
            smDataIsValid: false,
          },
          manifest: {
            manifestFetched: true
          },
          peaksInstance: {
            peaks: peaksInst,
            readyPeaks: true,
          }
        };
      });

      describe('for existing segments', () => {
        test('returns prevSibling = null for first segment', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 3.321, _endTime: 10.321,
              _id: '123a-456b-789c-2d', labelText: 'Segment 1.1',
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.prevSiblingRef.current).toBeNull();
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.2');
        });

        test('returns nextSibling = null for last segment', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 720.231, _endTime: 790.001,
              _id: '123a-456b-789c-8d', labelText: 'Segment 2.1.2'
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.nextSiblingRef.current).toBeNull();
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 2.1.1');
        });

        test('returns both siblings for middle segment', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 60.231, _endTime: 480.001,
              _id: '123a-456b-789c-3d', labelText: 'Segment 1.2'
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.1');
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 2.1');
        });

        test('returns both siblings and parent for a nested child segment', () => {
          // Current segment: first child of 'Segment 2.1' timespan
          const CustomComponent = renderHook({
            segment: {
              _startTime: 550.241, _endTime: 660.321,
              _id: '123a-456b-789c-7d', labelText: 'Segment 2.1.1',
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.parentTimespanRef.current).not.toBeNull();
          expect(resultRef.current.parentTimespanRef.current.label).toEqual('Segment 2.1');
        });

        test('returns parentTimespan = null for non-nested segment', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 3.321,
              _endTime: 10.321,
              _id: '123a-456b-789c-2d',
              labelText: 'Segment 1.1',
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.parentTimespanRef.current).toBeNull();
        });
      });

      describe('for new segments', () => {
        test('returns prevSibling = null for a temp-segment at the start', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 0.0, _endTime: 3.321,
              _id: 'temp-segment', labelText: 'First Segment',
              parentId: null,
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.prevSiblingRef.current).toBeNull();
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.1');
        });

        test('returns nextSibling = null for a temp-segment at the end', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 790.002, _endTime: 795.002,
              _id: 'temp-segment', labelText: 'Last Segment'
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.nextSiblingRef.current).toBeNull();
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 2.1.2');
        });

        test('returns both siblings for a temp-segment at the middle', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 10.321, _endTime: 60.231,
              _id: 'temp-segment', labelText: 'Middle Segment'
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.1');
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.2');
        });

        test('returns both siblings and parent for a temp-segment inside a parent in between its children', () => {
          // Current segment: middle child of 'Segment 2.1' timespan
          const CustomComponent = renderHook({
            segment: {
              _startTime: 660.321, _endTime: 720.231,
              _id: 'temp-segment', labelText: 'Middle Child Segment',
              parentId: '123a-456b-789c-6d'
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
          expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 2.1.2');
          expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
          expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 2.1.1');
          expect(resultRef.current.parentTimespanRef.current).not.toBeNull();
          expect(resultRef.current.parentTimespanRef.current.label).toEqual('Segment 2.1');
        });

        test('returns parentTimespan = null for non-nested segment', () => {
          const CustomComponent = renderHook({
            segment: {
              _startTime: 480.001, _endTime: 540.241,
              _id: 'temp-segment', labelText: 'Middle Segment',
            }
          });
          renderWithRedux(<CustomComponent />, { initialState });
          expect(resultRef.current.parentTimespanRef.current).toBeNull();
        });

      });
    });
  });

  describe('useFindNeighborTimespans', () => {
    const resultRef = { current: null };
    const renderHook = (props = {}) => {
      const UIComponent = () => {
        const results = hooks.useFindNeighborTimespans({
          ...props
        });
        useEffect(() => {
          resultRef.current = results;
        }, [results]);
        return (
          <div></div>
        );
      };
      return UIComponent;
    };

    describe('with non-nested structure', () => {
      test('returns prevSibling = null for first segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
            begin: '00:00:03.321', end: '00:00:10.321',
            valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.prevSiblingRef.current).toBeNull();
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.2');
      });

      test('returns nextSibling = null for last segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
            begin: '00:09:03.241', end: '00:15:00.001',
            valid: true,
            timeRange: { start: 543.241, end: 900.001 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).toBeNull();
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.2');
      });

      test('returns both siblings for a middle segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
            begin: '00:00:11.231', end: '00:08:00.001',
            valid: true,
            timeRange: { start: 11.231, end: 480.001 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 2.1');
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.1');
      });

      test('returns parentTimespan = null for segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
            begin: '00:00:03.321', end: '00:00:10.321',
            valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.parentTimespanRef.current).toBeNull();
      });
    });

    describe('with nested structure', () => {
      beforeEach(() => {
        // Refresh Redux store for each test
        initialState = {
          structuralMetadata: {
            smData: nestedTestSmData,
            smDataIsValid: false,
          },
          manifest: {
            manifestFetched: true
          }
        };
      });

      test('returns prevSibling = null for first segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-2d',
            begin: '00:00:03.321', end: '00:00:10.321',
            valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.prevSiblingRef.current).toBeNull();
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 1.2');
      });

      test('returns nextSibling = null for last segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 2.1.2', id: '123a-456b-789c-8d',
            begin: '00:12:00.231', end: '00:13:00.001',
            valid: true, nestedSpan: true,
            timeRange: { start: 720.231, end: 790.001 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).toBeNull();
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 2.1.1');
      });

      test('returns both siblings for middle segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-3d',
            begin: '00:01:00.231', end: '00:08:00.001',
            valid: true,
            timeRange: { start: 60.231, end: 480.001 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.prevSiblingRef.current.label).toEqual('Segment 1.1');
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.nextSiblingRef.current.label).toEqual('Segment 2.1');
      });

      test('returns both siblings and parent for a nested child segment', () => {
        // Current segment: first child of 'Segment 2.1' timespan
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d',
            begin: '00:09:10.241', end: '00:10:00.321',
            valid: true, nestedSpan: true,
            timeRange: { start: 550.241, end: 660.321 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.nextSiblingRef.current).not.toBeNull();
        expect(resultRef.current.prevSiblingRef.current).not.toBeNull();
        expect(resultRef.current.parentTimespanRef.current).not.toBeNull();
        expect(resultRef.current.parentTimespanRef.current.label).toEqual('Segment 2.1');
      });

      test('returns parentTimespan = null for non-nested segment', () => {
        const CustomComponent = renderHook({
          item: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-2d',
            begin: '00:00:03.321', end: '00:00:10.321',
            valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        });
        renderWithRedux(<CustomComponent />, { initialState });
        expect(resultRef.current.parentTimespanRef.current).toBeNull();
      });
    });
  });

  describe('useTimespanFormValidation', () => {
    const resultRef = { current: null };
    const renderHook = (props = {}) => {
      const UIComponent = () => {
        const results = hooks.useTimespanFormValidation({
          ...props
        });
        useEffect(() => {
          resultRef.current = results;
        }, [results]);
        return (
          <div></div>
        );
      };
      return UIComponent;
    };

    test('returns valid when times are valid without neighbors', () => {
      const CustomComponent = renderHook({
        beginTime: '00:15:00.000', endTime: '00:18:00.000',
        neighbors: {
          prevSiblingRef: { current: null },
          nextSiblingRef: { current: null },
          parentTimespanRef: { current: null }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(true);
      expect(resultRef.current.isEndValid).toBe(true);
      expect(resultRef.current.formIsValid).toBe(true);
    });

    test('returns valid when times are valid with neighbors', () => {
      const CustomComponent = renderHook({
        beginTime: '00:00:11.000', endTime: '00:08:00.000',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:00:03.321', end: '00:00:10.321' } },
          nextSiblingRef: { current: { begin: '00:09:03.241', end: '00:15:00.001' } },
          parentTimespanRef: { current: null }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(true);
      expect(resultRef.current.isEndValid).toBe(true);
      expect(resultRef.current.formIsValid).toBe(true);
    });

    test('returns invalid when begin time overlaps previous sibling', () => {
      const CustomComponent = renderHook({
        beginTime: '00:00:00.000', endTime: '00:08:00.000',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:00:03.321', end: '00:00:10.321' } },
          nextSiblingRef: { current: { begin: '00:09:03.241', end: '00:15:00.001' } },
          parentTimespanRef: { current: null }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(false);
      expect(resultRef.current.isEndValid).toBe(true);
      expect(resultRef.current.formIsValid).toBe(false);
    });

    test('returns invalid when end time overlaps next sibling', () => {
      const CustomComponent = renderHook({
        beginTime: '00:00:11.000', endTime: '00:10:00.000',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:00:03.321', end: '00:00:10.321' } },
          nextSiblingRef: { current: { begin: '00:09:03.241', end: '00:15:00.001' } },
          parentTimespanRef: { current: null }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(true);
      expect(resultRef.current.isEndValid).toBe(false);
      expect(resultRef.current.formIsValid).toBe(false);
    });

    test('returns invalid when begin time exceeds parent\'s start', () => {
      const CustomComponent = renderHook({
        beginTime: '00:09:00.000', endTime: '00:10:00.321',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:01:00.231', end: '00:08:00.001' } },
          nextSiblingRef: { current: { begin: '00:12:00.231', end: '00:13:00.001' } },
          parentTimespanRef: { current: { begin: '00:09:00.241', end: '00:15:00.001' } }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(false);
      expect(resultRef.current.isEndValid).toBe(true);
      expect(resultRef.current.formIsValid).toBe(false);
    });

    test('returns invalid when start time exceeds nested sibling\'s end', () => {
      const CustomComponent = renderHook({
        beginTime: '00:07:01.000', endTime: '00:12:00.000',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:01:00.231', end: '00:08:00.001' } },
          nextSiblingRef: { current: { begin: '00:12:00.231', end: '00:13:00.001' } },
          parentTimespanRef: { current: { begin: '00:09:00.241', end: '00:15:00.001' } }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(false);
      expect(resultRef.current.isEndValid).toBe(true);
      expect(resultRef.current.formIsValid).toBe(false);
    });

    test('returns invalid when end time exceeds parent\'s end', () => {
      const CustomComponent = renderHook({
        beginTime: '00:12:01.000', endTime: '00:16:00.321',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:01:00.231', end: '00:08:00.001' } },
          nextSiblingRef: { current: { begin: '00:12:00.231', end: '00:13:00.001' } },
          parentTimespanRef: { current: { begin: '00:09:00.241', end: '00:15:00.001' } }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(true);
      expect(resultRef.current.isEndValid).toBe(false);
      expect(resultRef.current.formIsValid).toBe(false);
    });

    test('returns invalid when end time exceeds nested sibling\'s start', () => {
      const CustomComponent = renderHook({
        beginTime: '00:11:01.000', endTime: '00:12:00.321',
        neighbors: {
          prevSiblingRef: { current: { begin: '00:01:00.231', end: '00:08:00.001' } },
          nextSiblingRef: { current: { begin: '00:12:00.231', end: '00:13:00.001' } },
          parentTimespanRef: { current: { begin: '00:09:00.241', end: '00:15:00.001' } }
        },
        timespanTitle: 'Valid title'
      });

      renderWithRedux(<CustomComponent />, { initialState });
      expect(resultRef.current.isBeginValid).toBe(true);
      expect(resultRef.current.isEndValid).toBe(false);
      expect(resultRef.current.formIsValid).toBe(false);
    });
  });
});
