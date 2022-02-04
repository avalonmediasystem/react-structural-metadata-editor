import axios from 'axios';

// Config flag to change the source of data retrieval endpoint
const useLocalData = false;

const BASE_URL = 'http://localhost:3123/data/mock-response-';

// Default headers for API calls
const defaultHeaders = { 'Content-Type': 'application/json' };

export default class APIUtils {
  /**
   * Construct GET request with parameters,
   * @param {String} url - url of the resource to be fetched
   * @param {Headers} headers
   */
  getRequest(url, headers = defaultHeaders) {
    return axios.get(url, { headers });
  }

  /**
   * Construct POST request with parameters,
   * @param {String} url - url where data gets posted
   * @param {JSON} data - JSON data posting to the server
   * @param {Headers} headers
   */
  postRequest(url, data, headers = defaultHeaders) {
    return axios.post(url, data, {
      headers,
    });
  }

  /**
   * Construct HEAD request with parameters,
   * @param {String} url
   * @param {Headers} headers
   */
  headRequest(url, headers = defaultHeaders) {
    return axios.head(url, { headers });
  }
}
