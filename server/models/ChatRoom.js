const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['customer', 'support', 'doctor'],
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastSeen: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'pending'
    },
    subject: {
        type: String,
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    category: {
        type: String,
        enum: ['general', 'technical', 'medical', 'billing', 'other'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        browser: String,
        device: String,
        ipAddress: String,
        userAgent: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: Date,
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
chatRoomSchema.index({ roomId: 1 });
chatRoomSchema.index({ 'participants.user': 1 });
chatRoomSchema.index({ status: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });

// Method to add participant
chatRoomSchema.methods.addParticipant = function(userId, role) {
    if (!this.participants.some(p => p.user.toString() === userId.toString())) {
        this.participants.push({
            user: userId,
            role: role,
            joinedAt: new Date(),
            lastSeen: new Date()
        });
    }
    return this.save();
};

// Method to update participant's last seen
chatRoomSchema.methods.updateLastSeen = function(userId) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant) {
        participant.lastSeen = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to close chat room
chatRoomSchema.methods.closeChat = function() {
    this.status = 'closed';
    this.closedAt = new Date();
    return this.save();
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom; 