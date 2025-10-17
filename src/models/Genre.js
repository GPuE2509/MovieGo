import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'genre_name',
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'genres',
  timestamps: false
});
