const Movie = require("../models/movie");
const Booking = require("../models/booking");
const ShowTime = require("../models/showtime");

async function getDefaultRecommendations(limit = 10) {
  // Default: latest released movies
  const movies = await Movie.find({})
    .sort({ release_date: -1, created_at: -1 })
    .limit(limit)
    .lean();
  return movies.map(mapToRecommendationResp);
}

async function getRecommendedMovies(userId, limit = 10) {
  // Personalized: infer preferred genres from user's bookings -> showtimes -> movies
  const userBookings = await Booking.find({ user_id: userId, status: { $in: ["CONFIRMED", "COMPLETED"] } })
    .select("showtime_id")
    .lean();

  if (!userBookings.length) {
    return getDefaultRecommendations(limit);
  }

  const showtimeIds = [...new Set(userBookings.map((b) => String(b.showtime_id)))];
  const showtimes = await ShowTime.find({ _id: { $in: showtimeIds } })
    .select("movie_id")
    .lean();
  const movieIds = [...new Set(showtimes.map((s) => String(s.movie_id)))];

  const watchedMovies = await Movie.find({ _id: { $in: movieIds } })
    .select("genres")
    .lean();
  const genreCounts = new Map();
  for (const m of watchedMovies) {
    (m.genres || []).forEach((g) => {
      const key = String(g);
      genreCounts.set(key, (genreCounts.get(key) || 0) + 1);
    });
  }

  if (genreCounts.size === 0) {
    return getDefaultRecommendations(limit);
  }

  const favoriteGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([g]) => g);

  const personalized = await Movie.find({
    genres: { $in: favoriteGenres },
    _id: { $nin: movieIds },
  })
    .sort({ release_date: -1 })
    .limit(limit)
    .lean();

  const fallback = personalized.length < limit
    ? await Movie.find({ _id: { $nin: [...movieIds, ...personalized.map((m) => String(m._id))] } })
        .sort({ release_date: -1 })
        .limit(limit - personalized.length)
        .lean()
    : [];

  return [...personalized, ...fallback].map(mapToRecommendationResp);
}

function mapToRecommendationResp(movie) {
  return {
    id: movie._id,
    title: movie.title,
    image: movie.image,
    trailer: movie.trailer,
    type: movie.type,
    duration: movie.duration,
    release_date: movie.release_date,
    genres: movie.genres,
  };
}

module.exports = {
  getDefaultRecommendations,
  getRecommendedMovies,
};


