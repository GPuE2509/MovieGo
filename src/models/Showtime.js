import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Showtime = sequelize.define('Showtime', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time'
  },
  movieId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'movie_id',
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  screenId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'screen_id',
    references: {
      model: 'screens',
      key: 'id'
    }
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
  tableName: 'showtimes',
  timestamps: false,
  hooks: {
    beforeCreate: (showtime) => {
      showtime.createdAt = new Date();
      showtime.updatedAt = new Date();
    },
    beforeUpdate: (showtime) => {
      showtime.updatedAt = new Date();
    }
  }
});
