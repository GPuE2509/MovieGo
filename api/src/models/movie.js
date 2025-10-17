// models/movie.model.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String }, // Fixed: description not descriptions
  author: { type: String, required: true, maxlength: 100 },
  image: { type: String, maxlength: 255 },
  trailer: { type: String, maxlength: 255 },
  type: { type: String, enum: ['2D', '3D'], required: true },
  duration: { type: Number, min: 1, required: true },
  release_date: { type: Date },
  actors: { type: String }, // Added missing field
  nation: { type: String, maxlength: 100 }, // Added missing field
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Movie', movieSchema);
