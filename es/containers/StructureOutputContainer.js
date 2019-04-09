import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import AlertContainer from './AlertContainer';
import { configureAlert } from '../services/alert-status';
import uuidv1 from 'uuid/v1';
import { cloneDeep } from 'lodash';
import { buildSMUI as _buildSMUI } from '../actions/sm-data';
import { handleStructureMasterFile } from '../actions/forms';

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

        var postAlertObj = configureAlert(status, _this.clearPostAlert);

        _this.setState({ postAlertObj: postAlertObj });
      }).catch(function (error) {
        _this.handleSaveError(error);
      });
    };

    _this.apiUtils = new APIUtils();
    return _this;
  }

  StructureOutputContainer.prototype.componentDidMount = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var response, smData;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
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
    var structureWithIds = cloneDeep(structureJS);

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
        item.id = uuidv1();

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
    var fetchAlertObj = configureAlert(status, this.clearFetchAlert);

    this.setState({ fetchAlertObj: fetchAlertObj });
  };

  StructureOutputContainer.prototype.handleSaveError = function handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    var status = error.response !== undefined ? error.response.status : error.request.status;
    var postAlertObj = configureAlert(status, this.clearPostAlert);

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


    return React.createElement(
      'section',
      { className: 'structure-section' },
      postAlertObj && React.createElement(AlertContainer, postAlertObj),
      !forms.structureRetrieved ? React.createElement(AlertContainer, fetchAlertObj) : React.createElement(
        'div',
        { className: 'scrollable' },
        React.createElement(
          'h3',
          null,
          'HTML Structure Tree from a masterfile in server'
        ),
        React.createElement('br', null),
        React.createElement(List, { items: smData }),
        React.createElement(
          Row,
          null,
          React.createElement(
            Col,
            { xs: 12, className: 'text-right' },
            React.createElement(
              Button,
              { bsStyle: 'primary', onClick: this.handleSaveItClick },
              'Save Structure'
            )
          )
        )
      )
    );
  };

  return StructureOutputContainer;
}(Component);

// For testing purposes


export { StructureOutputContainer as PureStructureOutputContainer };

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(smData) {
      return dispatch(_buildSMUI(smData));
    },
    handleStructureFile: function handleStructureFile(code) {
      return dispatch(handleStructureMasterFile(code));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StructureOutputContainer);