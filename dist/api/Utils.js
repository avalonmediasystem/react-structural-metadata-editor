"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _axios = _interopRequireDefault(require("axios"));
// Config flag to change the source of data retrieval endpoint
var useLocalData = false;
var BASE_URL = 'http://localhost:3123/data/mock-response-';

// Default headers for API calls
var defaultHeaders = {
  'Content-Type': 'application/json'
};
var APIUtils = exports["default"] = /*#__PURE__*/function () {
  function APIUtils() {
    (0, _classCallCheck2["default"])(this, APIUtils);
  }
  return (0, _createClass2["default"])(APIUtils, [{
    key: "getRequest",
    value:
    /**
     * Construct GET request with parameters,
     * @param {String} url - url of the resource to be fetched
     * @param {Headers} headers
     */
    function getRequest(url) {
      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultHeaders;
      return _axios["default"].get(url, {
        headers: headers
      });
    }

    /**
     * Construct POST request with parameters,
     * @param {String} url - url where data gets posted
     * @param {JSON} data - JSON data posting to the server
     * @param {Headers} headers
     */
  }, {
    key: "postRequest",
    value: function postRequest(url, data) {
      var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultHeaders;
      return _axios["default"].post(url, data, {
        headers: headers
      });
    }

    /**
     * Construct HEAD request with parameters,
     * @param {String} url
     * @param {Headers} headers
     */
  }, {
    key: "headRequest",
    value: function headRequest(url) {
      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultHeaders;
      return _axios["default"].head(url, {
        headers: headers
      });
    }
  }]);
}();