"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.defaultHeaders = exports.masterFileID = exports.BASE_URL = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _axios = _interopRequireDefault(require("axios"));

// Config flag to change the source of data retrieval endpoint
var useLocalData = false;
var BASE_URL = useLocalData ? 'http://localhost:3123/data/mock-response-' : 'https://spruce.dlib.indiana.edu'; // Masterfile ID on the server

exports.BASE_URL = BASE_URL;
var masterFileID = 'd791sg30j'; // Default headers for API calls
//export const defaultHeaders = new Headers();
//defaultHeaders.append('Content-Type', 'application/json');

exports.masterFileID = masterFileID;
var defaultHeaders = {
  'Content-Type': 'application/json'
};
exports.defaultHeaders = defaultHeaders;

var APIUtils =
/*#__PURE__*/
function () {
  function APIUtils() {
    (0, _classCallCheck2["default"])(this, APIUtils);
  }

  (0, _createClass2["default"])(APIUtils, [{
    key: "getRequest",

    /**
     * Construct GET request with parameters,
     * @param {String} baseURL - base URL of the server hosting master file
     * @param {String} masterFile - master file ID on the server
     * @param {String} urlEndPoint - end point to make the network request
     * @param {Headers} headers
     */
    value: function getRequest(baseURL, masterFile, urlEndPoint) {
      var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultHeaders;
      var url = useLocalData ? "".concat(BASE_URL).concat(urlEndPoint) : "".concat(baseURL, "/master_files/").concat(masterFile, "/").concat(urlEndPoint);
      return _axios["default"].get(url, {
        headers: headers
      });
    }
    /**
     * Construct POST request with parameters,
     * @param {String} baseURL - base URL of the server hosting master file
     * @param {String} masterFile - master file ID on the server
     * @param {String} urlEndPoint - end point to make the network request
     * @param {JSON} data - JSON data posting to the server
     * @param {Headers} headers
     */

  }, {
    key: "postRequest",
    value: function postRequest(baseURL, masterFile, urlEndPoint, data) {
      var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaultHeaders;
      var url = useLocalData ? "".concat(BASE_URL).concat(urlEndPoint) : "".concat(baseURL, "/master_files/").concat(masterFile, "/").concat(urlEndPoint);
      return _axios["default"].post(url, data, {
        headers: headers
      });
    }
  }]);
  return APIUtils;
}();

exports["default"] = APIUtils;