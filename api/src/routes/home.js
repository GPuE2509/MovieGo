const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Trang chủ - các API công khai
 */

/**
 * @swagger
 * /api/v1/home/genres:
 *   get:
 *     summary: Lấy danh sách thể loại phim
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách thể loại phim
 */

/**
 * @swagger
 * /api/v1/home/theaters/near:
 *   get:
 *     summary: Lấy danh sách rạp gần bạn
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách rạp gần bạn
 */

/**
 * @swagger
 * /api/v1/home/movies/showing:
 *   get:
 *     summary: Lấy danh sách phim đang chiếu
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách phim đang chiếu
 */

/**
 * @swagger
 * /api/v1/home/movies/coming:
 *   get:
 *     summary: Lấy danh sách phim sắp chiếu
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách phim sắp chiếu
 */

/**
 * @swagger
 * /api/v1/home/movie/detail/{Id}:
 *   get:
 *     summary: Lấy chi tiết phim
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phim
 */

/**
 * @swagger
 * /api/v1/home/movie/trailer/{Id}:
 *   get:
 *     summary: Lấy trailer phim
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trailer phim
 */

/**
 * @swagger
 * /api/v1/home/news:
 *   get:
 *     summary: Lấy danh sách tin tức
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách tin tức
 */

/**
 * @swagger
 * /api/v1/home/news/{Id}:
 *   get:
 *     summary: Lấy chi tiết tin tức
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết tin tức
 */

/**
 * @swagger
 * /api/v1/home/festivals:
 *   get:
 *     summary: Lấy danh sách lễ hội
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách lễ hội
 */

/**
 * @swagger
 * /api/v1/home/festivals/{Id}:
 *   get:
 *     summary: Lấy chi tiết lễ hội
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết lễ hội
 */

/**
 * @swagger
 * /api/v1/home/promotions:
 *   get:
 *     summary: Lấy danh sách khuyến mãi
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi
 */

/**
 * @swagger
 * /api/v1/home/promotions/{Id}:
 *   get:
 *     summary: Lấy chi tiết khuyến mãi
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết khuyến mãi
 */

/**
 * @swagger
 * /api/v1/home/ticket-prices:
 *   get:
 *     summary: Lấy danh sách giá vé
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Danh sách giá vé
 */

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
