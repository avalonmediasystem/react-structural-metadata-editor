exports.handler = async function(event, context, callback) {
  try {
    const structure = require('../../assets/structure.json');
    return {
      statusCode: 200,
      body: JSON.stringify(structure)
    }
  } catch (err) {
    console.error('Server -> Error fetching structure -> ', err);
    return {
      statusCode: 404,
      body: JSON.stringify('No structure')
    }
  }
}
