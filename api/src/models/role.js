const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role_name: { type: String, enum: ['ROLE_ADMIN', 'ROLE_USER'], required: true },
});

module.exports = mongoose.model('Role', roleSchema);
