const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Send a new message to the chat
router.post('/', chatController.handleChatMessage);

// Get chat history for a session
router.get('/:sessionId', chatController.getChatHistory);

module.exports = router;
