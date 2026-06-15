const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    totalTokensUsed: { type: Number, default: 0 },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatLog', chatLogSchema);
