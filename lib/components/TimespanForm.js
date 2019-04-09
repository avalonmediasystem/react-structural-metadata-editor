'use strict';

exports.__esModule = true;
exports.PureTimespanForm = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _StructuralMetadataUtils = require('../services/StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

var _formHelper = require('../services/form-helper');

var _peaksInstance = require('../actions/peaks-instance');

var peaksActions = _interopRequireWildcard(_peaksInstance);

var _WaveformDataUtils = require('../services/WaveformDataUtils');

var _WaveformDataUtils2 = _interopRequireDefault(_WaveformDataUtils);

var _lodash = require('lodash');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();
var waveformDataUtils = new _WaveformDataUtils2.default();

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

    if (!(0, _lodash.isEqual)(smData, prevProps.smData)) {
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
    var titleValid = (0, _formHelper.isTitleValid)(this.state.timespanTitle);
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


    return (0, _formHelper.validTimespans)(beginTime, endTime, allSpans, this.props.peaksInstance.peaks);
  };

  TimespanForm.prototype.render = function render() {
    var _this2 = this;

    var _state2 = this.state,
        beginTime = _state2.beginTime,
        endTime = _state2.endTime,
        timespanChildOf = _state2.timespanChildOf,
        timespanTitle = _state2.timespanTitle;


    return _react2.default.createElement(
      'form',
      { onSubmit: this.handleSubmit },
      _react2.default.createElement(
        _reactBootstrap.FormGroup,
        {
          controlId: 'timespanTitle',
          validationState: (0, _formHelper.getValidationTitleState)(timespanTitle)
        },
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Title'
        ),
        _react2.default.createElement(_reactBootstrap.FormControl, {
          type: 'text',
          value: timespanTitle,
          onChange: this.handleInputChange
        }),
        _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { sm: 6 },
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            {
              controlId: 'beginTime',
              validationState: (0, _formHelper.getValidationBeginState)(beginTime, this.allSpans)
            },
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Begin Time'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, {
              type: 'text',
              value: beginTime,
              placeholder: '00:00:00',
              onChange: function onChange(e) {
                _this2.handleTimeChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            }),
            _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { sm: 6 },
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            {
              controlId: 'endTime',
              validationState: (0, _formHelper.getValidationEndState)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks)
            },
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'End Time'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, {
              type: 'text',
              value: endTime,
              placeholder: '00:00:00',
              onChange: function onChange(e) {
                _this2.handleTimeChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            }),
            _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
          )
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { controlId: 'timespanChildOf' },
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Child Of'
        ),
        _react2.default.createElement(
          _reactBootstrap.FormControl,
          {
            componentClass: 'select',
            placeholder: 'select',
            onChange: this.handleChildOfChange,
            value: timespanChildOf
          },
          _react2.default.createElement(
            'option',
            { value: '' },
            'Select...'
          ),
          this.state.validHeadings.map(function (item) {
            return _react2.default.createElement(
              'option',
              { value: item.id, key: item.id },
              item.label
            );
          })
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 12 },
          _react2.default.createElement(
            _reactBootstrap.ButtonToolbar,
            { className: 'pull-right' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.handleCancelClick },
              'Cancel'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
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
}(_react.Component);

// For testing purposes


exports.PureTimespanForm = TimespanForm;


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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanForm);