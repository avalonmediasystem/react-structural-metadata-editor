function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { getValidationBeginState, getValidationEndState, getValidationTitleState, isTitleValid, validTimespans } from '../services/form-helper';
import * as peaksActions from '../actions/peaks-instance';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { isEqual } from 'lodash';

var structuralMetadataUtils = new StructuralMetadataUtils();
var waveformDataUtils = new WaveformDataUtils();

var TimespanForm = function (_Component) {
  _inherits(TimespanForm, _Component);

  function TimespanForm(props) {
    _classCallCheck(this, TimespanForm);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.buildHeadingsOptions = function () {
      var smData = _this.props.smData;

      var newSpan = {
        begin: _this.state.beginTime,
        end: _this.state.endTime
      };

      // Get spans in overall span list which fall before and after the new span
      var wrapperSpans = structuralMetadataUtils.findWrapperSpans(newSpan, _this.allSpans);

      // Get all valid div headings
      var validHeadings = structuralMetadataUtils.getValidHeadings(wrapperSpans, smData);

      // Update state with valid headings
      _this.setState({ validHeadings: validHeadings });
    };

    _this.clearHeadingOptions = function () {
      _this.setState({
        validHeadings: []
      });
    };

    _this.handleInputChange = function (e) {
      var _this$setState;

      _this.setState((_this$setState = {}, _this$setState[e.target.id] = e.target.value, _this$setState), _this.updateChildOfOptions());
    };

    _this.handleSubmit = function (e) {
      e.preventDefault();
      var _this$state = _this.state,
          beginTime = _this$state.beginTime,
          endTime = _this$state.endTime,
          timespanChildOf = _this$state.timespanChildOf,
          timespanTitle = _this$state.timespanTitle;


      _this.props.cancelClick();
      _this.props.onSubmit({
        beginTime: beginTime,
        endTime: endTime,
        timespanChildOf: timespanChildOf,
        timespanTitle: timespanTitle
      });

      // Clear form values
      _this.clearFormValues();
    };

    _this.handleTimeChange = function (e, callback) {
      var _this$setState2;

      // Update waveform segment with user inputs in the form
      _this.setState({ isTyping: true });

      _this.setState((_this$setState2 = {}, _this$setState2[e.target.id] = e.target.value, _this$setState2), function () {
        callback();
        _this.updateChildOfOptions();
        var _this$props = _this.props,
            initSegment = _this$props.initSegment,
            peaksInstance = _this$props.peaksInstance;

        var segment = peaksInstance.peaks.segments.getSegment(initSegment.id);
        if (_this.localValidTimespans().valid) {
          _this.props.updateSegment(segment, _this.state);
        }
      });
    };

    _this.handleCancelClick = function () {
      _this.props.cancelClick();
    };

    _this.handleChildOfChange = function (e) {
      _this.setState({ timespanChildOf: e.target.value });
    };

    _this.state = {
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: [],
      isTyping: false
    };
    _this.allSpans = null;
    return _this;
  }

  TimespanForm.prototype.componentDidMount = function componentDidMount() {
    var smData = this.props.smData;

    this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
  };

  TimespanForm.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var smData = this.props.smData;

    if (!isEqual(smData, prevProps.smData)) {
      this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
    }
  };

  TimespanForm.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.timespanOpen && !this.state.isTyping) {
      var initSegment = nextProps.initSegment,
          isInitializing = nextProps.isInitializing,
          peaksInstance = nextProps.peaksInstance,
          segment = nextProps.segment;

      // Set state to get initial begin and end times from temporary segment

      if (initSegment !== this.props.initSegment && isInitializing) {
        var startTime = initSegment.startTime,
            endTime = initSegment.endTime;

        this.setState({
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        });
        this.props.updateInitialize(false);
      }

      // Update state when segment handles are dragged in the waveform
      if (this.props.peaksInstance !== peaksInstance && !isInitializing) {
        // Prevent from overlapping when dragging the handles
        var _waveformDataUtils$va = waveformDataUtils.validateSegment(segment, peaksInstance.peaks),
            _startTime = _waveformDataUtils$va.startTime,
            _endTime = _waveformDataUtils$va.endTime;

        this.setState({
          beginTime: structuralMetadataUtils.toHHmmss(_startTime),
          endTime: structuralMetadataUtils.toHHmmss(_endTime)
        }, this.updateChildOfOptions());
      }
    }
  };

  TimespanForm.prototype.clearFormValues = function clearFormValues() {
    this.setState({
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: [],
      isTyping: false
    });
  };

  TimespanForm.prototype.formIsValid = function formIsValid() {
    var titleValid = isTitleValid(this.state.timespanTitle);
    var childOfValid = this.state.timespanChildOf.length > 0;
    var timesValidResponse = this.localValidTimespans();

    return titleValid && childOfValid && timesValidResponse.valid;
  };

  TimespanForm.prototype.updateChildOfOptions = function updateChildOfOptions() {
    var timesValidResponse = this.localValidTimespans();

    if (timesValidResponse.valid) {
      this.buildHeadingsOptions();
    } else {
      this.clearHeadingOptions();
    }
  };

  /**
   * A local wrapper for the reusable function 'validTimespans'
   */


  TimespanForm.prototype.localValidTimespans = function localValidTimespans() {
    var _state = this.state,
        beginTime = _state.beginTime,
        endTime = _state.endTime;
    var allSpans = this.allSpans;


    return validTimespans(beginTime, endTime, allSpans, this.props.peaksInstance.peaks);
  };

  TimespanForm.prototype.render = function render() {
    var _this2 = this;

    var _state2 = this.state,
        beginTime = _state2.beginTime,
        endTime = _state2.endTime,
        timespanChildOf = _state2.timespanChildOf,
        timespanTitle = _state2.timespanTitle;


    return React.createElement(
      'form',
      { onSubmit: this.handleSubmit },
      React.createElement(
        FormGroup,
        {
          controlId: 'timespanTitle',
          validationState: getValidationTitleState(timespanTitle)
        },
        React.createElement(
          ControlLabel,
          null,
          'Title'
        ),
        React.createElement(FormControl, {
          type: 'text',
          value: timespanTitle,
          onChange: this.handleInputChange
        }),
        React.createElement(FormControl.Feedback, null)
      ),
      React.createElement(
        Row,
        null,
        React.createElement(
          Col,
          { sm: 6 },
          React.createElement(
            FormGroup,
            {
              controlId: 'beginTime',
              validationState: getValidationBeginState(beginTime, this.allSpans)
            },
            React.createElement(
              ControlLabel,
              null,
              'Begin Time'
            ),
            React.createElement(FormControl, {
              type: 'text',
              value: beginTime,
              placeholder: '00:00:00',
              onChange: function onChange(e) {
                _this2.handleTimeChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            }),
            React.createElement(FormControl.Feedback, null)
          )
        ),
        React.createElement(
          Col,
          { sm: 6 },
          React.createElement(
            FormGroup,
            {
              controlId: 'endTime',
              validationState: getValidationEndState(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks)
            },
            React.createElement(
              ControlLabel,
              null,
              'End Time'
            ),
            React.createElement(FormControl, {
              type: 'text',
              value: endTime,
              placeholder: '00:00:00',
              onChange: function onChange(e) {
                _this2.handleTimeChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            }),
            React.createElement(FormControl.Feedback, null)
          )
        )
      ),
      React.createElement(
        FormGroup,
        { controlId: 'timespanChildOf' },
        React.createElement(
          ControlLabel,
          null,
          'Child Of'
        ),
        React.createElement(
          FormControl,
          {
            componentClass: 'select',
            placeholder: 'select',
            onChange: this.handleChildOfChange,
            value: timespanChildOf
          },
          React.createElement(
            'option',
            { value: '' },
            'Select...'
          ),
          this.state.validHeadings.map(function (item) {
            return React.createElement(
              'option',
              { value: item.id, key: item.id },
              item.label
            );
          })
        )
      ),
      React.createElement(
        Row,
        null,
        React.createElement(
          Col,
          { xs: 12 },
          React.createElement(
            ButtonToolbar,
            { className: 'pull-right' },
            React.createElement(
              Button,
              { onClick: this.handleCancelClick },
              'Cancel'
            ),
            React.createElement(
              Button,
              {
                bsStyle: 'primary',
                type: 'submit',
                disabled: !this.formIsValid()
              },
              'Save'
            )
          )
        )
      )
    );
  };

  return TimespanForm;
}(Component);

// For testing purposes


export { TimespanForm as PureTimespanForm };

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment
  };
};

var mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment
};

export default connect(mapStateToProps, mapDispatchToProps)(TimespanForm);