const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { _id: false } // Disable _id for subdocuments if not needed
);

const chatSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
