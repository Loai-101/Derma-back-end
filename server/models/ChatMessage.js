const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: [true, 'Chat room reference is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender reference is required']
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system', 'typing', 'read'],
        default: 'text'
    },
    content: {
        text: {
            type: String,
            trim: true,
            maxlength: [5000, 'Message text cannot exceed 5000 characters']
        },
        attachments: [{
            type: {
                type: String,
                enum: ['image', 'file', 'link'],
                required: true
            },
            url: {
                type: String,
                required: true
            },
            name: String,
            size: Number,
            mimeType: String,
            thumbnail: String
        }]
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatMessage'
        },
        mentions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ 'readBy.user': 1 });

// Method to mark message as read
chatMessageSchema.methods.markAsRead = function(userId) {
    if (!this.readBy.some(r => r.user.toString() === userId.toString())) {
        this.readBy.push({
            user: userId,
            readAt: new Date()
        });
        this.status = 'read';
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to edit message
chatMessageSchema.methods.editMessage = function(newText) {
    this.content.text = newText;
    this.metadata.isEdited = true;
    this.metadata.editedAt = new Date();
    return this.save();
};

// Method to add attachment
chatMessageSchema.methods.addAttachment = function(attachment) {
    this.content.attachments.push(attachment);
    this.type = attachment.type === 'image' ? 'image' : 'file';
    return this.save();
};

// Static method to get messages for a room
chatMessageSchema.statics.getRoomMessages = function(roomId, limit = 50, before = null) {
    const query = { room: roomId };
    if (before) {
        query.createdAt = { $lt: before };
    }
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'name email')
        .populate('metadata.replyTo')
        .populate('metadata.mentions', 'name email');
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage; 