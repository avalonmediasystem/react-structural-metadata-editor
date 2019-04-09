'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./App.css');

var _WaveformContainer = require('./containers/WaveformContainer');

var _WaveformContainer2 = _interopRequireDefault(_WaveformContainer);

var _ButtonSection = require('./components/ButtonSection');

var _ButtonSection2 = _interopRequireDefault(_ButtonSection);

var _StructureOutputContainer = require('./containers/StructureOutputContainer');

var _StructureOutputContainer2 = _interopRequireDefault(_StructureOutputContainer);

var _reactDnd = require('react-dnd');

var _reactDndHtml5Backend = require('react-dnd-html5-backend');

var _reactDndHtml5Backend2 = _interopRequireDefault(_reactDndHtml5Backend);

var _fontawesomeSvgCore = require('@fortawesome/fontawesome-svg-core');

var _freeSolidSvgIcons = require('@fortawesome/free-solid-svg-icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Bootstrap (styles only)
// import 'bootstrap/dist/css/bootstrap.min.css';

// Font Awesome Imports


_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faDotCircle, _freeSolidSvgIcons.faMinusCircle, _freeSolidSvgIcons.faPen, _freeSolidSvgIcons.faSave, _freeSolidSvgIcons.faTrash);

var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  App.prototype.render = function render() {
    return _react2.default.createElement(
      _reactDnd.DragDropContextProvider,
      { backend: _reactDndHtml5Backend2.default },
      _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'h1',
          null,
          'Test Structural Metadata Editor'
        ),
        _react2.default.createElement(_WaveformContainer2.default, null),
        _react2.default.createElement(_ButtonSection2.default, null),
        _react2.default.createElement(_StructureOutputContainer2.default, null)
      )
    );
  };

  return App;
}(_react.Component);

exports.default = App;
module.exports = exports['default'];