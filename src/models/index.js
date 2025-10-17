import { Movie } from './Movie.js';
import { Genre } from './Genre.js';
import { MovieGenre } from './MovieGenre.js';
import { News } from './News.js';
import { Theater } from './Theater.js';
import { Screen } from './Screen.js';
import { Showtime } from './Showtime.js';
import { User } from './User.js';
import { Coupon } from './Coupon.js';
import { UserCoupon } from './UserCoupon.js';
import { Festival } from './Festival.js';
import { Promotion } from './Promotion.js';
import { TicketPrice } from './TicketPrice.js';
import { Banner } from './Banner.js';

// Define associations
Movie.belongsToMany(Genre, {
  through: MovieGenre,
  foreignKey: 'movieId',
  otherKey: 'genreId',
  as: 'genres'
});

Genre.belongsToMany(Movie, {
  through: MovieGenre,
  foreignKey: 'genreId',
  otherKey: 'movieId',
  as: 'movies'
});

// Theater -> Screen association
Theater.hasMany(Screen, {
  foreignKey: 'theaterId',
  as: 'screens'
});

Screen.belongsTo(Theater, {
  foreignKey: 'theaterId',
  as: 'theater'
});

// Movie -> Showtime association
Movie.hasMany(Showtime, {
  foreignKey: 'movieId',
  as: 'showtimes'
});

Showtime.belongsTo(Movie, {
  foreignKey: 'movieId',
  as: 'movie'
});

// Screen -> Showtime association
Screen.hasMany(Showtime, {
  foreignKey: 'screenId',
  as: 'showtimes'
});

Showtime.belongsTo(Screen, {
  foreignKey: 'screenId',
  as: 'screen'
});

// User -> Coupon association (many-to-many)
User.belongsToMany(Coupon, {
  through: UserCoupon,
  foreignKey: 'userId',
  otherKey: 'couponId',
  as: 'coupons'
});

Coupon.belongsToMany(User, {
  through: UserCoupon,
  foreignKey: 'couponId',
  otherKey: 'userId',
  as: 'users'
});

// Export all models
export {
  Movie,
  Genre,
  MovieGenre,
  News,
  Theater,
  Screen,
  Showtime,
  User,
  Coupon,
  UserCoupon,
  Festival,
  Promotion,
  TicketPrice,
  Banner
};
