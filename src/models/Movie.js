import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Movie = sequelize.define('Movie', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  trailer: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('2D', '3D', '4DX', 'IMAX'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'release_date'
  },
  actors: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nation: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'movies',
  timestamps: true
});
