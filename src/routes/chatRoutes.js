const express = require('express');
const router = express.Router();
const { conversarComIA } = require('../controllers/chatController');

router.post('/', conversarComIA);

module.exports = router;
