// models/showtime.model.js
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  screen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('ShowTime', showtimeSchema);
