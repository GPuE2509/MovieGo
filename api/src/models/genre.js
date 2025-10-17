// models/genre.model.js
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  genre_name: { type: String, required: true },
});

module.exports = mongoose.model('Genre', genreSchema);
