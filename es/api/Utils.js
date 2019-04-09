function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import axios from 'axios';

// Config flag to change the source of data retrieval endpoint
var useLocalData = false;

export var BASE_URL = useLocalData ? 'http://localhost:3123/data/mock-response-' : 'https://spruce.dlib.indiana.edu';

// Masterfile ID on the server
export var masterFileID = 'd791sg30j';

// Default headers for API calls
export var defaultHeaders = new Headers();
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
    return axios.get(url, {
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
    return axios.post(url, data, {
      headers: headers
    });
  };

  return APIUtils;
}();

export { APIUtils as default };