exports.handler = async function(event, context, callback) {
  try {
    const waveform = require('../../assets/waveform.json');
    return {
      statusCode: 200,
      body: JSON.stringify(waveform)
    }
  } catch (err) {
    console.error('Server -> Error fetching waveform -> ', err);
    return {
      statusCode: 404,
      body: JSON.stringify('No waveform')
    }
  }
}
