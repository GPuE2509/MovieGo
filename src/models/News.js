import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const News = sequelize.define('News', {
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
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'updated_at'
  }
}, {
  tableName: 'news',
  timestamps: false,
  hooks: {
    beforeCreate: (news) => {
      news.createdAt = new Date();
      news.updatedAt = new Date();
    },
    beforeUpdate: (news) => {
      news.updatedAt = new Date();
    }
  }
});