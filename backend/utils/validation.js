const isValidEmail = (value) => {
  const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
};

const isValidE164 = (value) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
};

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
};

const isValidDocumentType = (mime) => {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
  return allowed.includes(mime);
};

const validateProfilePayload = (payload) => {
  const errors = [];
  if (payload.email && !isValidEmail(payload.email)) errors.push('Email must be a valid address.');
  if (payload.phone && payload.phone.length > 0 && !isValidE164(payload.phone)) errors.push('Phone must be stored as E.164.');
  if (payload.website && payload.website.length > 0 && !isValidUrl(payload.website)) errors.push('Website must be a valid https URL.');
  if (payload.linkedIn && payload.linkedIn.length > 0 && !isValidUrl(payload.linkedIn)) errors.push('LinkedIn must be a valid https URL.');
  if (payload.x && payload.x.length > 0 && !isValidUrl(payload.x)) errors.push('X must be a valid https URL.');
  return errors;
};

module.exports = {
  isValidEmail,
  isValidE164,
  isValidUrl,
  isValidDocumentType,
  validateProfilePayload,
};
