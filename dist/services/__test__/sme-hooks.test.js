import React, { useEffect } from 'react';
import { nestedTestSmData, renderWithRedux, testSmData } from '../testing-helpers';
import Peaks from 'peaks';
import * as hooks from "../sme-hooks";
import { act } from '@testing-library/react';

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

  describe('useTextEditor', () => {
    const resultRef = { current: null };
    const renderHook = () => {
      const UIComponent = () => {
        const results = hooks.useTextEditor();
        useEffect(() => {
          resultRef.current = results;
        }, [results]);
        return <div></div>;
      };
      return UIComponent;
    };

    describe('formatJson()', () => {
      test('formats JSON with 2-space indentation', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = { type: 'div', label: 'Test', items: [{ type: 'span', label: 'Child' }] };

        const formatted = resultRef.current.formatJson(data);
        expect(formatted).toContain('  ');
        expect(formatted).toContain('"type": "div"');
        expect(formatted).toContain('"label": "Test"');
      });

      test('moves items property to the end of objects', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = { items: [{ type: 'span' }], type: 'div', label: 'Test' };

        const formatted = resultRef.current.formatJson(data);
        const typeIndex = formatted.indexOf('"type"');
        const itemsIndex = formatted.indexOf('"items"');

        // items should come after type
        expect(itemsIndex).toBeGreaterThan(typeIndex);
      });

      test('returns error message for invalid data', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const circularData = {};
        circularData.self = circularData; // Create circular reference

        const formatted = resultRef.current.formatJson(circularData);
        expect(formatted).toBe('Error formatting JSON structure..');
      });
    });

    describe('sanitizeDisplayedText()', () => {
      test('removes active, timeRange, nestedSpan, and valid properties', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          id: 'test-id', type: 'span', label: 'Test', active: false,
          timeRange: { start: 0, end: 10 }, nestedSpan: true, valid: true
        };

        const sanitized = resultRef.current.sanitizeDisplayedText(data);

        expect(sanitized).toHaveProperty('id');
        expect(sanitized).toHaveProperty('type');
        expect(sanitized).toHaveProperty('label');
        expect(sanitized).not.toHaveProperty('active');
        expect(sanitized).not.toHaveProperty('timeRange');
        expect(sanitized).not.toHaveProperty('nestedSpan');
        expect(sanitized).not.toHaveProperty('valid');
      });

      test('keeps id property in sanitized output', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = { id: '123a-456b-789c-1d', type: 'span', label: 'Test', active: false };

        const sanitized = resultRef.current.sanitizeDisplayedText(data);
        expect(sanitized.id).toBe('123a-456b-789c-1d');
      });

      test('removes empty items arrays in headings', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = { type: 'div', label: 'Test', items: [] };

        const sanitized = resultRef.current.sanitizeDisplayedText(data);
        expect(sanitized).not.toHaveProperty('items');
      });

      test('keeps non-empty items arrays in headings', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          type: 'div', label: 'Parent',
          items: [{ type: 'span', label: 'Child' }]
        };

        const sanitized = resultRef.current.sanitizeDisplayedText(data);
        expect(sanitized).toHaveProperty('items');
        expect(sanitized.items).toHaveLength(1);
      });

      test('recursively sanitizes nested items', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          type: 'div', label: 'Parent', active: true,
          items: [{
            type: 'span', label: 'Child', valid: true,
            timeRange: { start: 0, end: 10 }
          }]
        };

        const sanitized = resultRef.current.sanitizeDisplayedText(data);
        expect(sanitized.items[0]).not.toHaveProperty('valid');
        expect(sanitized.items[0]).not.toHaveProperty('timeRange');
        expect(sanitized.items[0]).toHaveProperty('type');
        expect(sanitized.items[0]).toHaveProperty('label');
      });

      test('returns null for null input', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const sanitized = resultRef.current.sanitizeDisplayedText(null);
        expect(sanitized).toBeNull();
      });
    });

    describe('restoreRemovedProps()', () => {
      test('preserves existing id fields', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          id: 'existing-id', type: 'span', label: 'Test',
          begin: '00:00:00.000', end: '00:00:10.000'
        };

        act(() => {
          const restored = resultRef.current.restoreRemovedProps(data);
          expect(restored.id).toBe('existing-id');
        });
      });

      test('generates new UUID for items without id', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          type: 'span', label: 'Test',
          begin: '00:00:00.000', end: '00:00:10.000'
        };

        act(() => {
          const restored = resultRef.current.restoreRemovedProps(data);
          expect(restored.id).toBeDefined();
          expect(restored.id)
            .toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        });
      });

      test('recursively restores ids in nested items', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          type: 'div',
          label: 'Parent',
          items: [
            { type: 'span', label: 'Child 1', begin: '00:00:00.000', end: '00:00:05.000' },
            { id: 'existing-child-id', type: 'span', label: 'Child 2', begin: '00:00:05.000', end: '00:00:10.000' }
          ]
        };

        act(() => {
          const restored = resultRef.current.restoreRemovedProps(data);
          expect(restored.id).toBeDefined();
          expect(restored.items[0].id).toBeDefined();
          expect(restored.items[0].id).toMatch(/^[0-9a-f-]{36}$/);
          expect(restored.items[1].id).toBe('existing-child-id');
        });
      });

      test('handles arrays of items', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const data = {
          type: 'div',
          label: 'Parent',
          items: [
            { type: 'span', label: 'Child 1', begin: '00:00:00.000', end: '00:00:05.000' },
            { type: 'span', label: 'Child 2', begin: '00:00:05.000', end: '00:00:10.000' },
            { type: 'span', label: 'Child 3', begin: '00:00:10.000', end: '00:00:15.000' }
          ]
        };

        act(() => {
          const restored = resultRef.current.restoreRemovedProps(data);
          expect(restored.items).toHaveLength(3);
          restored.items.forEach(item => {
            expect(item.id).toBeDefined();
            expect(item.id).toMatch(/^[0-9a-f-]{36}$/);
          });
        });
      });
    });

    describe('injectTemplate', () => {
      const spanTemplate = { type: 'span', label: '', begin: '', end: '' };
      const mockView = {
        current: {
          state: {
            selection: { main: { head: 0 } }
          },
          dispatch: jest.fn(),
          focus: jest.fn()
        }
      };
      test('adds id to template object', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        resultRef.current.injectTemplate(mockView, spanTemplate);
        expect(spanTemplate.id).toBeDefined();
        expect(spanTemplate.id).toMatch(/^[0-9a-f-]{36}$/);
      });

      test('dispatches insert change at cursor position', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        const positionedMockView = {
          current: {
            ...mockView.current,
            state: { selection: { main: { head: 100 } } },
          }
        };

        resultRef.current.injectTemplate(positionedMockView, spanTemplate);

        expect(mockView.current.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            changes: expect.objectContaining({
              from: 100,
              insert: expect.stringContaining('"type": "span"')
            })
          })
        );
      });

      test('positions cursor inside label value field', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        resultRef.current.injectTemplate(mockView, spanTemplate);

        // Dispatch is called twice; to insert template and place cursor
        expect(mockView.current.dispatch).toHaveBeenCalledTimes(2);
        const secondCall = mockView.current.dispatch.mock.calls[1][0];
        expect(secondCall).toHaveProperty('selection');
        expect(secondCall.selection).toHaveProperty('anchor');
      });

      test('focuses the editor after injection', () => {
        const CustomComponent = renderHook();
        renderWithRedux(<CustomComponent />, { initialState });

        resultRef.current.injectTemplate(mockView, spanTemplate);
        expect(mockView.current.focus).toHaveBeenCalled();
      });
    });
  });
});
