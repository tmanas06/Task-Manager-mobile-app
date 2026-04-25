const express = require('express');
const { protect: verifyToken } = require('../middleware/auth');
const { syncOrganization, joinByCode } = require('../controllers/orgController');

const router = express.Router();

router.use(verifyToken);

router.post('/sync', syncOrganization);
router.post('/join', joinByCode);

module.exports = router;
