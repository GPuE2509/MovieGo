const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Public Home API endpoints
router.get('/genres', homeController.getAllGenres);
router.get('/theaters/near', homeController.getTheatersNear);

router.get('/movies/showing', homeController.getAllMoviesShowing);
router.get('/movies/coming', homeController.getAllMoviesComing);
router.get('/movie/detail/:Id', homeController.getMovieDetail);
router.get('/movie/trailer/:Id', homeController.getMovieTrailer);

router.get('/news', homeController.getAllNews);
router.get('/news/:Id', homeController.getNewsById);

router.get('/festivals', homeController.getAllFestivals);
router.get('/festivals/:Id', homeController.getFestivalDetail);

router.get('/promotions', homeController.getAllPromotions);
router.get('/promotions/:Id', homeController.getPromotionDetail);

router.get('/ticket-prices', homeController.getAllTicketPrices);

module.exports = router;
