const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadMedia(mediaUrl) {
  const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
  const filename = `uploads/${Date.now()}.jpg`;
  fs.writeFileSync(path.join(__dirname, '..', filename), response.data);
  return filename; // or return S3 URL if uploading to AWS
}

module.exports = { downloadMedia };
