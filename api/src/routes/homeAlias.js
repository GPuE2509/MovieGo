const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Exact paths as per image (no /home prefix, dashed names)
router.get('/theaters-near', homeController.getTheatersNear);
router.get('/now-showing', homeController.getAllMoviesShowing);
router.get('/now-coming', homeController.getAllMoviesComing);

router.get('/get-promotion-detail/:Id', homeController.getPromotionDetail);
router.get('/get-new-by-id/:Id', homeController.getNewsById);
router.get('/get-movie-trailer/:Id', homeController.getMovieTrailer);
router.get('/get-movie-detail/:Id', homeController.getMovieDetail);
router.get('/get-festival-detail/:Id', homeController.getFestivalDetail);

router.get('/get-all-ticket-price', homeController.getAllTicketPrices);
router.get('/get-all-promotion', homeController.getAllPromotions);
router.get('/get-all-news', homeController.getAllNews);
router.get('/get-all-genres', homeController.getAllGenres);
router.get('/get-all-festivals', homeController.getAllFestivals);

module.exports = router;
