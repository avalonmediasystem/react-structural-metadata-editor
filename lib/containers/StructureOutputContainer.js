'use strict';

exports.__esModule = true;
exports.PureStructureOutputContainer = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _List = require('../components/List');

var _List2 = _interopRequireDefault(_List);

var _reactBootstrap = require('react-bootstrap');

var _Utils = require('../api/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _AlertContainer = require('./AlertContainer');

var _AlertContainer2 = _interopRequireDefault(_AlertContainer);

var _alertStatus = require('../services/alert-status');

var _v = require('uuid/v1');

var _v2 = _interopRequireDefault(_v);

var _lodash = require('lodash');

var _smData = require('../actions/sm-data');

var _forms = require('../actions/forms');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StructureOutputContainer = function (_Component) {
  _inherits(StructureOutputContainer, _Component);

  function StructureOutputContainer(props) {
    _classCallCheck(this, StructureOutputContainer);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      fetchAlertObj: {},
      postAlertObj: {}
    };

    _this.clearFetchAlert = function () {
      _this.setState({
        fetchAlertObj: null
      });
    };

    _this.clearPostAlert = function () {
      _this.setState({
        postAlertObj: null
      });
    };

    _this.handleSaveItClick = function () {
      var postData = { json: _this.props.smData[0] };
      _this.apiUtils.postRequest('structure.json', postData).then(function (response) {
        var status = response.status;

        var postAlertObj = (0, _alertStatus.configureAlert)(status, _this.clearPostAlert);

        _this.setState({ postAlertObj: postAlertObj });
      }).catch(function (error) {
        _this.handleSaveError(error);
      });
    };

    _this.apiUtils = new _Utils2.default();
    return _this;
  }

  StructureOutputContainer.prototype.componentDidMount = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var response, smData;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return this.apiUtils.getRequest('structure.json');

            case 3:
              response = _context.sent;


              // Add unique ids to every object
              smData = this.addIds([response.data]);

              // Tag the root element

              this.markRootElement(smData);

              // Update the redux store
              this.props.buildSMUI(smData);

              // Update redux-store flag for structure file retrieval
              this.props.handleStructureFile(0);
              _context.next = 14;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context['catch'](0);

              console.log('TCL: StructureOutputContainer -> }catch -> error', _context.t0);
              this.handleFetchError(_context.t0);

            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 10]]);
    }));

    function componentDidMount() {
      return _ref.apply(this, arguments);
    }

    return componentDidMount;
  }();

  /**
   * This function adds a unique, front-end only id, to every object in the data structure
   * @param {Array} structureJS
   * @returns {Array}
   */


  StructureOutputContainer.prototype.addIds = function addIds(structureJS) {
    var structureWithIds = (0, _lodash.cloneDeep)(structureJS);

    // Recursively loop through data structure
    var fn = function fn(items) {
      for (var _iterator = items, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var item = _ref2;

        // Create and add an id
        item.id = (0, _v2.default)();

        // Send child items back into the function
        if (item.items && item.items.length > 0) {
          fn(item.items);
        }
      }
    };

    fn(structureWithIds);

    return structureWithIds;
  };

  StructureOutputContainer.prototype.markRootElement = function markRootElement(smData) {
    if (smData.length > 0) {
      smData[0].type = 'root';
    }
  };

  StructureOutputContainer.prototype.handleFetchError = function handleFetchError(error) {
    var status = error.response !== undefined ? error.response.status : -2;
    var fetchAlertObj = (0, _alertStatus.configureAlert)(status, this.clearFetchAlert);

    this.setState({ fetchAlertObj: fetchAlertObj });
  };

  StructureOutputContainer.prototype.handleSaveError = function handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    var status = error.response !== undefined ? error.response.status : error.request.status;
    var postAlertObj = (0, _alertStatus.configureAlert)(status, this.clearPostAlert);

    this.setState({ postAlertObj: postAlertObj });
  };

  StructureOutputContainer.prototype.render = function render() {
    var _props = this.props,
        _props$smData = _props.smData,
        smData = _props$smData === undefined ? [] : _props$smData,
        forms = _props.forms;
    var _state = this.state,
        fetchAlertObj = _state.fetchAlertObj,
        postAlertObj = _state.postAlertObj;


    return _react2.default.createElement(
      'section',
      { className: 'structure-section' },
      postAlertObj && _react2.default.createElement(_AlertContainer2.default, postAlertObj),
      !forms.structureRetrieved ? _react2.default.createElement(_AlertContainer2.default, fetchAlertObj) : _react2.default.createElement(
        'div',
        { className: 'scrollable' },
        _react2.default.createElement(
          'h3',
          null,
          'HTML Structure Tree from a masterfile in server'
        ),
        _react2.default.createElement('br', null),
        _react2.default.createElement(_List2.default, { items: smData }),
        _react2.default.createElement(
          _reactBootstrap.Row,
          null,
          _react2.default.createElement(
            _reactBootstrap.Col,
            { xs: 12, className: 'text-right' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'primary', onClick: this.handleSaveItClick },
              'Save Structure'
            )
          )
        )
      )
    );
  };

  return StructureOutputContainer;
}(_react.Component);

// For testing purposes


exports.PureStructureOutputContainer = StructureOutputContainer;


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(smData) {
      return dispatch((0, _smData.buildSMUI)(smData));
    },
    handleStructureFile: function handleStructureFile(code) {
      return dispatch((0, _forms.handleStructureMasterFile)(code));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StructureOutputContainer);