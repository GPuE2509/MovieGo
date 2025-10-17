import express from 'express';
import couponController from '../controllers/couponController.js';
import { 
  validateCoupon, 
  validatePagination, 
  validateUserId, 
  validateCouponId, 
  validateSearch 
} from '../validators/couponValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CouponResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Voucher Giảm 50k"
 *         code:
 *           type: string
 *           example: "50KQUAGIANGSINH"
 *         value:
 *           type: integer
 *           example: 50000
 *         exchange_point:
 *           type: integer
 *           example: 100
 *         canExchange:
 *           type: boolean
 *           example: true
 *     FormCoupon:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - value
 *         - exchange_point
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *           example: "Voucher Giảm 50k"
 *         code:
 *           type: string
 *           maxLength: 255
 *           example: "50KQUAGIANGSINH"
 *         value:
 *           type: integer
 *           minimum: 0
 *           example: 50000
 *         exchange_point:
 *           type: integer
 *           minimum: 0
 *           example: 100
 */

/**
 * @swagger
 * /api/v1/admin/coupons:
 *   get:
 *     summary: Get all coupons (Admin)
 *     description: Retrieve a paginated list of coupons with optional search and sorting
 *     tags: [Coupon Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (0-based)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: name
 *           enum: [name, code, value, exchange_point, createdAt, updatedAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search term for name or code
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/PageResponse'
 *       400:
 *         description: Invalid pagination parameters
 *       500:
 *         description: Internal server error
 */
router.get('/admin/coupons', validatePagination, validateSearch, couponController.getAllCoupons);

/**
 * @swagger
 * /api/v1/admin/coupon/create:
 *   post:
 *     summary: Create a new coupon (Admin)
 *     description: Create a new coupon
 *     tags: [Coupon Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormCoupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: string
 *                   example: "Coupon created successfully"
 *       400:
 *         description: Invalid input data or coupon code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/admin/coupon/create', validateCoupon, couponController.createCoupon);

/**
 * @swagger
 * /api/v1/admin/coupon/update/{id}:
 *   put:
 *     summary: Update a coupon (Admin)
 *     description: Update an existing coupon by ID
 *     tags: [Coupon Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormCoupon'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "Coupon updated successfully"
 *       400:
 *         description: Invalid input data or coupon code already exists
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Internal server error
 */
router.put('/admin/coupon/update/:id', validateCouponId, validateCoupon, couponController.updateCoupon);

/**
 * @swagger
 * /api/v1/admin/coupon/delete/{id}:
 *   delete:
 *     summary: Delete a coupon (Admin)
 *     description: Delete a coupon by ID
 *     tags: [Coupon Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coupon ID
 *     responses:
 *       204:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 204
 *                 code:
 *                   type: integer
 *                   example: 204
 *                 data:
 *                   type: string
 *                   example: "Coupon deleted successfully"
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Internal server error
 */
router.delete('/admin/coupon/delete/:id', validateCouponId, couponController.deleteCoupon);

/**
 * @swagger
 * /api/v1/user/available-coupons/{userId}:
 *   get:
 *     summary: Get available coupons for user
 *     description: Retrieve coupons that the user can exchange (doesn't already have)
 *     tags: [Coupon Feature]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CouponResponse'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/available-coupons/:userId', validateUserId, couponController.getAvailableCoupons);

/**
 * @swagger
 * /api/v1/user/my-coupons/{userId}:
 *   get:
 *     summary: Get user's coupons
 *     description: Retrieve coupons that the user already has
 *     tags: [Coupon Feature]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CouponResponse'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/my-coupons/:userId', validateUserId, couponController.getMyCoupons);

/**
 * @swagger
 * /api/v1/user/exchange/{couponId}/{userId}:
 *   post:
 *     summary: Exchange coupon
 *     description: Exchange a coupon using user's points
 *     tags: [Coupon Feature]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coupon ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Coupon exchanged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "Coupon exchanged successfully!"
 *       400:
 *         description: Insufficient points or already have coupon
 *       404:
 *         description: User or coupon not found
 *       500:
 *         description: Internal server error
 */
router.post('/user/exchange/:couponId/:userId', validateCouponId, validateUserId, couponController.exchangeCoupon);

/**
 * @swagger
 * /api/v1/user/can-exchange/{couponId}/{userId}:
 *   get:
 *     summary: Check if user can exchange coupon
 *     description: Check if user has enough points and doesn't already have the coupon
 *     tags: [Coupon Feature]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coupon ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful check
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: User or coupon not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/can-exchange/:couponId/:userId', validateCouponId, validateUserId, couponController.canExchangeCoupon);

export default router;
