import axios from 'axios';

// Config flag to change the source of data retrieval endpoint
const useLocalData = false;

export const BASE_URL = useLocalData
  ? 'http://localhost:3123/data/mock-response-'
  : 'https://spruce.dlib.indiana.edu';

// Masterfile ID on the server
export const masterFileID = 'd791sg30j';

// Default headers for API calls
export const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

export default class APIUtils {
  /**
   * Construct GET request with parameters,
   * @param {String} urlEndPoint
   * @param {Headers} headers
   */
  getRequest(urlEndPoint, headers = defaultHeaders) {
    const url = useLocalData
      ? `${BASE_URL}${urlEndPoint}`
      : `${BASE_URL}/master_files/${masterFileID}/${urlEndPoint}`;
    return axios.get(url, {
      headers: headers
    });
  }

  /**
   * Construct POST request with parameters,
   * @param {String} urlEndPoint
   * @param {JSON} data - JSON data posting to the server
   * @param {Headers} headers
   */
  postRequest(urlEndPoint, data, headers = defaultHeaders) {
    const url = useLocalData
      ? `${BASE_URL}${urlEndPoint}`
      : `${BASE_URL}/master_files/${masterFileID}/${urlEndPoint}`;
    return axios.post(url, data, {
      headers: headers
    });
  }
}
