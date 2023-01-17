let config = {};

if (process.env.NODE_ENV === 'development') {
  config.url = 'http://localhost:3001';
  config.env = 'dev';
} else {
  config.url = 'https://react-structural-metadata-editor.netlify.app';
  config.env = 'prod';
}

export default config;
