const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

// Create a new chat room
exports.createChatRoom = async (req, res) => {
    try {
        const { subject, category, priority } = req.body;
        const userId = req.user._id;

        const chatRoom = new ChatRoom({
            roomId: uuidv4(),
            subject,
            category,
            priority,
            metadata: {
                browser: req.headers['user-agent'],
                ipAddress: req.ip
            }
        });

        // Add the user as a participant
        await chatRoom.addParticipant(userId, 'customer');

        // Create initial system message
        const systemMessage = new ChatMessage({
            room: chatRoom._id,
            sender: userId,
            type: 'system',
            content: {
                text: 'Chat session started'
            }
        });

        await Promise.all([chatRoom.save(), systemMessage.save()]);

        res.status(201).json({
            status: 'success',
            data: {
                chatRoom,
                initialMessage: systemMessage
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating chat room',
            error: error.message
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { roomId, content, type = 'text', replyTo } = req.body;
        const userId = req.user._id;

        const chatRoom = await ChatRoom.findOne({ roomId });
        if (!chatRoom) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat room not found'
            });
        }

        const message = new ChatMessage({
            room: chatRoom._id,
            sender: userId,
            type,
            content: {
                text: content
            },
            metadata: {
                replyTo
            }
        });

        await message.save();

        // Update chat room's last message timestamp
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        // Populate sender information
        await message.populate('sender', 'name email');

        res.status(201).json({
            status: 'success',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;

        const chatRoom = await ChatRoom.findOne({ roomId });
        if (!chatRoom) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat room not found'
            });
        }

        const messages = await ChatMessage.getRoomMessages(chatRoom._id, parseInt(limit), before);

        res.status(200).json({
            status: 'success',
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching chat history',
            error: error.message
        });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        const messages = await ChatMessage.find({
            _id: { $in: messageIds }
        });

        const updatePromises = messages.map(message => message.markAsRead(userId));
        await Promise.all(updatePromises);

        res.status(200).json({
            status: 'success',
            message: 'Messages marked as read'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error marking messages as read',
            error: error.message
        });
    }
};

// Close chat room
exports.closeChatRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const chatRoom = await ChatRoom.findOne({ roomId });
        if (!chatRoom) {
            return res.status(404).json({
                status: 'error',
                message: 'Chat room not found'
            });
        }

        await chatRoom.closeChat();

        // Create system message for chat closure
        const systemMessage = new ChatMessage({
            room: chatRoom._id,
            sender: userId,
            type: 'system',
            content: {
                text: 'Chat session closed'
            }
        });

        await systemMessage.save();

        res.status(200).json({
            status: 'success',
            message: 'Chat room closed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error closing chat room',
            error: error.message
        });
    }
};

// Get active chat rooms for a user
exports.getActiveChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chatRooms = await ChatRoom.find({
            'participants.user': userId,
            status: { $in: ['active', 'pending'] }
        })
        .sort({ lastMessageAt: -1 })
        .populate('participants.user', 'name email')
        .populate({
            path: 'participants.user',
            select: 'name email'
        });

        res.status(200).json({
            status: 'success',
            data: chatRooms
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching active chats',
            error: error.message
        });
    }
}; 