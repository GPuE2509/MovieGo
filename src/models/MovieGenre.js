import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const MovieGenre = sequelize.define('MovieGenre', {
  movieId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    field: 'movie_id',
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  genreId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    field: 'genre_id',
    references: {
      model: 'genres',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_genre',
  timestamps: false
});
