import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Festival = sequelize.define('Festival', {
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
  image: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time',
    validate: {
      isDate: true,
      isAfter: new Date().toISOString()
    }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time',
    validate: {
      isDate: true
    }
  }
}, {
  tableName: 'festivals',
  timestamps: true,
  validate: {
    endTimeAfterStartTime() {
      if (this.endTime && this.startTime && this.endTime < this.startTime) {
        throw new Error('End time must be after start time');
      }
    }
  }
});
