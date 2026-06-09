/* 
  CommonJS shim for uuid v14 published as ESM-only which does not work in
  load normally in the Jest environment that still expects CommonJS modules.
  Use jsdom's built-in crypto.randomUUID() API that provides a standard browser
  style UUID generator, without reimplementing the v4() UUID generator. 
*/
const v4 = () => crypto.randomUUID();
module.exports = { v4 };
