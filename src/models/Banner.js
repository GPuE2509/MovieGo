import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('MAIN', 'SIDEBAR', 'FOOTER'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  position: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'banners',
  timestamps: false
});
