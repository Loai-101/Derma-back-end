const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all chat routes
router.use(protect);

// Chat room routes
router.post('/rooms', chatController.createChatRoom);
router.get('/rooms/active', chatController.getActiveChats);
router.post('/rooms/:roomId/close', chatController.closeChatRoom);

// Message routes
router.post('/messages', chatController.sendMessage);
router.get('/rooms/:roomId/messages', chatController.getChatHistory);
router.post('/messages/read', chatController.markAsRead);

module.exports = router; 