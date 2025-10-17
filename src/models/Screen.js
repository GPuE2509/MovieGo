import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Screen = sequelize.define('Screen', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  seatCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seat_capacity'
  },
  theaterId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'theater_id',
    references: {
      model: 'theaters',
      key: 'id'
    }
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'screens',
  timestamps: false,
  hooks: {
    beforeCreate: (screen) => {
      screen.createdAt = new Date();
      screen.updatedAt = new Date();
    },
    beforeUpdate: (screen) => {
      screen.updatedAt = new Date();
    }
  }
});
