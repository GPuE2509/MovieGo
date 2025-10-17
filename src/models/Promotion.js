import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'promotions',
  timestamps: true
});
