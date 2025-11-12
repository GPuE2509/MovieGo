const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

/**
 * @swagger
 * tags:
 *   name: HomeAlias
 *   description: Trang chủ - các API alias không có /home prefix
 */


/**
 * @swagger
 * /api/v1/now-showing:
 *   get:
 *     summary: Lấy danh sách phim đang chiếu
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách phim đang chiếu
 */

/**
 * @swagger
 * /api/v1/now-coming:
 *   get:
 *     summary: Lấy danh sách phim sắp chiếu
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách phim sắp chiếu
 */

/**
 * @swagger
 * /api/v1/get-promotion-detail/{Id}:
 *   get:
 *     summary: Lấy chi tiết khuyến mãi
 *     tags: [HomeAlias]
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
 * /api/v1/get-new-by-id/{Id}:
 *   get:
 *     summary: Lấy chi tiết tin tức
 *     tags: [HomeAlias]
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
 * /api/v1/get-movie-trailer/{Id}:
 *   get:
 *     summary: Lấy trailer phim
 *     tags: [HomeAlias]
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
 * /api/v1/get-movie-detail/{Id}:
 *   get:
 *     summary: Lấy chi tiết phim
 *     tags: [HomeAlias]
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
 * /api/v1/get-festival-detail/{Id}:
 *   get:
 *     summary: Lấy chi tiết lễ hội
 *     tags: [HomeAlias]
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
 * /api/v1/get-all-ticket-price:
 *   get:
 *     summary: Lấy danh sách giá vé
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách giá vé
 */

/**
 * @swagger
 * /api/v1/get-all-promotion:
 *   get:
 *     summary: Lấy danh sách khuyến mãi
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi
 */

/**
 * @swagger
 * /api/v1/get-all-news:
 *   get:
 *     summary: Lấy danh sách tin tức
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách tin tức
 */

/**
 * @swagger
 * /api/v1/get-all-genres:
 *   get:
 *     summary: Lấy danh sách thể loại phim
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách thể loại phim
 */

/**
 * @swagger
 * /api/v1/get-all-festivals:
 *   get:
 *     summary: Lấy danh sách lễ hội
 *     tags: [HomeAlias]
 *     responses:
 *       200:
 *         description: Danh sách lễ hội
 */

// Exact paths as per image (no /home prefix, dashed names)

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
