const express = require('express');
const { protect: verifyToken } = require('../middleware/auth');
const { syncOrganization, joinByCode, updateMemberRole } = require('../controllers/orgController');

const router = express.Router();

router.use(verifyToken);

router.post('/sync', syncOrganization);
router.post('/join', joinByCode);
router.patch('/members/:userId/role', updateMemberRole);

module.exports = router;
