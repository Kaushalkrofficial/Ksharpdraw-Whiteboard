// server/models/board.js
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Board' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  canvasState: { type: String, default: '{}' },
  isPublic: { type: Boolean, default: false },
  inviteToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);