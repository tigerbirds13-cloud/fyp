const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  requestAvatarUpload,
  requestCoverUpload,
  listDocuments,
  createDocument,
  softDeleteDocument,
  getNotificationPreferences,
  updateNotificationPreferences,
  changeEmail,
  changePassword,
  getSessions,
  revokeSession,
  listApiKeys,
  createApiKey,
  revokeApiKey,
  getAuditLogs,
  previewPublicProfile,
} = require('../controllers/profileController');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', requestAvatarUpload);
router.post('/cover', requestCoverUpload);

router.get('/documents', listDocuments);
router.post('/documents', createDocument);
router.delete('/documents/:id', softDeleteDocument);

router.get('/notification-preferences', getNotificationPreferences);
router.post('/notification-preferences', updateNotificationPreferences);

router.post('/change-email', changeEmail);
router.post('/change-password', changePassword);

router.get('/security/sessions', getSessions);
router.delete('/security/sessions/:id', revokeSession);

router.get('/security/api-keys', listApiKeys);
router.post('/security/api-keys', createApiKey);
router.delete('/security/api-keys/:id', revokeApiKey);

router.get('/activity/audit-logs', getAuditLogs);
router.get('/public-profile/preview', previewPublicProfile);

module.exports = router;
