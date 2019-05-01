import axios from 'axios';

// Config flag to change the source of data retrieval endpoint
const useLocalData = false;

export const BASE_URL = useLocalData
  ? 'http://localhost:3123/data/mock-response-'
  : 'https://spruce.dlib.indiana.edu';

// Masterfile ID on the server
export const masterFileID = 'd791sg30j';

// Default headers for API calls
//export const defaultHeaders = new Headers();
//defaultHeaders.append('Content-Type', 'application/json');
export const defaultHeaders = { 'Content-Type': 'application/json' };

export default class APIUtils {
  /**
   * Construct GET request with parameters,
   * @param {String} baseURL - base URL of the server hosting master file
   * @param {String} masterFile - master file ID on the server
   * @param {String} urlEndPoint - end point to make the network request
   * @param {Headers} headers
   */
  getRequest(baseURL, masterFile, urlEndPoint, headers = defaultHeaders) {
    const url = useLocalData
      ? `${BASE_URL}${urlEndPoint}`
      : `${baseURL}/master_files/${masterFile}/${urlEndPoint}`;
    return axios.get(url, {
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
  postRequest(
    baseURL,
    masterFile,
    urlEndPoint,
    data,
    headers = defaultHeaders
  ) {
    const url = useLocalData
      ? `${BASE_URL}${urlEndPoint}`
      : `${baseURL}/master_files/${masterFile}/${urlEndPoint}`;
    return axios.post(url, data, {
      headers: headers
    });
  }
}
