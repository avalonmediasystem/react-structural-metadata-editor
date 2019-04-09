'use strict';

exports.__esModule = true;
exports.PureTimespanInlineForm = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _formHelper = require('../services/form-helper');

var _reactRedux = require('react-redux');

var _StructuralMetadataUtils = require('../services/StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

var _lodash = require('lodash');

var _ListItemInlineEditControls = require('./ListItemInlineEditControls');

var _ListItemInlineEditControls2 = _interopRequireDefault(_ListItemInlineEditControls);

var _peaksInstance = require('../actions/peaks-instance');

var peaksActions = _interopRequireWildcard(_peaksInstance);

var _WaveformDataUtils = require('../services/WaveformDataUtils');

var _WaveformDataUtils2 = _interopRequireDefault(_WaveformDataUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();
var waveformUtils = new _WaveformDataUtils2.default();

var styles = {
  formControl: {
    margin: '0 5px'
  }
};

var TimespanInlineForm = function (_Component) {
  _inherits(TimespanInlineForm, _Component);

  function TimespanInlineForm(props) {
    _classCallCheck(this, TimespanInlineForm);

    // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data
    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      beginTime: '',
      endTime: '',
      timespanTitle: '',
      clonedSegment: {},
      isTyping: false
    };

    _this.handleCancelClick = function () {
      // Revert to segment to the state before
      _this.props.revertSegment(_this.state.clonedSegment);
      _this.props.cancelFn();
    };

    _this.handleInputChange = function (e, callback) {
      var _this$setState;

      _this.setState({ isTyping: true });
      _this.setState((_this$setState = {}, _this$setState[e.target.id] = e.target.value, _this$setState), function () {
        callback();
        var _this$props = _this.props,
            item = _this$props.item,
            peaksInstance = _this$props.peaksInstance;

        var segment = peaksInstance.peaks.segments.getSegment(item.id);
        if (_this.formIsValid()) {
          _this.props.updateSegment(segment, _this.state);
        }
      });
    };

    _this.handleSaveClick = function () {
      _this.props.saveSegment(_this.state);
      var _this$state = _this.state,
          beginTime = _this$state.beginTime,
          endTime = _this$state.endTime,
          timespanTitle = _this$state.timespanTitle;

      _this.props.saveFn(_this.props.item.id, {
        beginTime: beginTime,
        endTime: endTime,
        timespanTitle: timespanTitle
      });
    };

    _this.tempSmData = undefined;
    return _this;
  }

  TimespanInlineForm.prototype.componentDidMount = function componentDidMount() {
    var _props = this.props,
        smData = _props.smData,
        item = _props.item,
        peaksInstance = _props.peaksInstance;

    // Get a fresh copy of store data

    this.tempSmData = (0, _lodash.cloneDeep)(smData);

    // Load existing form values
    this.setState((0, _formHelper.getExistingFormValues)(item.id, this.tempSmData, peaksInstance.peaks));

    // Remove current list item from the data we're doing validation against in this form
    this.tempSmData = structuralMetadataUtils.deleteListItem(item.id, this.tempSmData);

    // Save a reference to all the spans for future calculations
    this.allSpans = structuralMetadataUtils.getItemsOfType('span', this.tempSmData);

    // Make segment related to timespan editable
    this.props.activateSegment(item.id);

    this.props.changeSegment();
  };

  TimespanInlineForm.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (this.props.peaksInstance !== nextProps.peaksInstance) {
      if (nextProps.segment && !this.state.isTyping) {
        var segment = nextProps.segment,
            peaksInstance = nextProps.peaksInstance;
        // Prevent from overlapping when dragging the handles

        var _waveformUtils$valida = waveformUtils.validateSegment(segment, peaksInstance.peaks),
            startTime = _waveformUtils$valida.startTime,
            endTime = _waveformUtils$valida.endTime;

        this.setState({
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        });
      }
    }
  };

  TimespanInlineForm.prototype.formIsValid = function formIsValid() {
    var _state = this.state,
        beginTime = _state.beginTime,
        endTime = _state.endTime;

    var titleValid = (0, _formHelper.isTitleValid)(this.state.timespanTitle);
    var timesValidResponse = (0, _formHelper.validTimespans)(beginTime, endTime, this.allSpans, this.props.peaksInstance.peaks);

    return titleValid && timesValidResponse.valid;
  };

  TimespanInlineForm.prototype.render = function render() {
    var _this2 = this;

    var _state2 = this.state,
        beginTime = _state2.beginTime,
        endTime = _state2.endTime,
        timespanTitle = _state2.timespanTitle;


    return _react2.default.createElement(
      _reactBootstrap.Form,
      { inline: true },
      _react2.default.createElement(
        'div',
        { className: 'row-wrapper' },
        _react2.default.createElement(
          'div',
          null,
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
              style: styles.formControl,
              value: timespanTitle,
              onChange: function onChange(e) {
                _this2.handleInputChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            })
          ),
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
              style: styles.formControl,
              value: beginTime,
              onChange: function onChange(e) {
                _this2.handleInputChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            })
          ),
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
              style: styles.formControl,
              value: endTime,
              onChange: function onChange(e) {
                _this2.handleInputChange(e, function () {
                  _this2.setState({ isTyping: false });
                });
              }
            })
          )
        ),
        _react2.default.createElement(_ListItemInlineEditControls2.default, {
          formIsValid: this.formIsValid(),
          handleSaveClick: this.handleSaveClick,
          handleCancelClick: this.handleCancelClick
        })
      )
    );
  };

  return TimespanInlineForm;
}(_react.Component);

// For testing purposes


TimespanInlineForm.propTypes = process.env.NODE_ENV !== "production" ? {
  item: _propTypes2.default.object,
  cancelFn: _propTypes2.default.func,
  saveFn: _propTypes2.default.func
} : {};
exports.PureTimespanInlineForm = TimespanInlineForm;


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    segment: state.peaksInstance.segment
  };
};

var mapDispatchToProps = {
  activateSegment: peaksActions.activateSegment,
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  changeSegment: peaksActions.changeSegment
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TimespanInlineForm);