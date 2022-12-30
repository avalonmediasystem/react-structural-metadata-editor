const path = require('path');
const fs = require('fs');

exports.handler = async function(event, context, callback) {
  let mediaFile = require('../../assets/media.mp4');
  try {
    const res = fetch('https://fixtures.iiif.io/info.html?file=/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4');
    console.log(res);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'video/mp4' },
      body: mediaFile
    };
  } catch (err) {
    console.error('Server -> Error fetching media file -> ', err);
  }
}
