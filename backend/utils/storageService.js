const crypto = require('crypto');

const createUploadKey = ({ userId, prefix, filename }) => {
  const token = crypto.randomBytes(10).toString('hex');
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return `${prefix}/${userId}/${Date.now()}-${token}-${safeName}`;
};

const createSignedUpload = ({ userId, filename, mimeType, type }) => {
  const key = createUploadKey({ userId, prefix: type === 'cover' ? 'cover-images' : 'avatars', filename });
  const signature = crypto.createHmac('sha256', process.env.SIGNING_SECRET || 'dev-signature').update(key).digest('hex');
  return {
    key,
    uploadUrl: `https://s3-compatible.example.com/${key}?signature=${signature}`,
    expiresIn: 15 * 60,
  };
};

module.exports = {
  createSignedUpload,
};
