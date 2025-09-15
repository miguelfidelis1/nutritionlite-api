const express = require('express');
const router = express.Router();
const { conversarComIA } = require('../controllers/chatController');

router.post('/chat', conversarComIA);

module.exports = router;
