'use strict';

exports.__esModule = true;
exports.default = exports.defaultHeaders = exports.masterFileID = exports.BASE_URL = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Config flag to change the source of data retrieval endpoint
var useLocalData = false;

var BASE_URL = exports.BASE_URL = useLocalData ? 'http://localhost:3123/data/mock-response-' : 'https://spruce.dlib.indiana.edu';

// Masterfile ID on the server
var masterFileID = exports.masterFileID = 'd791sg30j';

// Default headers for API calls
var defaultHeaders = exports.defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

var APIUtils = function () {
  function APIUtils() {
    _classCallCheck(this, APIUtils);
  }

  /**
   * Construct GET request with parameters,
   * @param {String} urlEndPoint
   * @param {Headers} headers
   */
  APIUtils.prototype.getRequest = function getRequest(urlEndPoint) {
    var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultHeaders;

    var url = useLocalData ? '' + BASE_URL + urlEndPoint : BASE_URL + '/master_files/' + masterFileID + '/' + urlEndPoint;
    return _axios2.default.get(url, {
      headers: headers
    });
  };

  /**
   * Construct POST request with parameters,
   * @param {String} urlEndPoint
   * @param {JSON} data - JSON data posting to the server
   * @param {Headers} headers
   */


  APIUtils.prototype.postRequest = function postRequest(urlEndPoint, data) {
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultHeaders;

    var url = useLocalData ? '' + BASE_URL + urlEndPoint : BASE_URL + '/master_files/' + masterFileID + '/' + urlEndPoint;
    return _axios2.default.post(url, data, {
      headers: headers
    });
  };

  return APIUtils;
}();

exports.default = APIUtils;