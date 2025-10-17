import { Op } from 'sequelize';
import { Coupon, User, UserCoupon } from '../models/index.js';

class CouponService {
  // Get all coupons with pagination and search (Admin)
  async getAllCoupons(page = 0, pageSize = 10, sortField = 'name', sortOrder = 'asc', search = '') {
    const offset = page * pageSize;
    const limit = pageSize;
    
    // Build where clause for search
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } }
      ]
    } : {};
    
    // Build order clause
    const orderClause = [[sortField, sortOrder.toUpperCase()]];
    
    // Get total count
    const total = await Coupon.count({ where: whereClause });
    
    // Get paginated data
    const coupons = await Coupon.findAll({
      where: whereClause,
      order: orderClause,
      limit,
      offset
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages - 1;
    const hasPrevious = page > 0;
    
    return {
      total,
      page,
      size: pageSize,
      totalPages,
      hasNext,
      hasPrevious,
      data: coupons.map(coupon => ({
        id: coupon.id,
        name: coupon.name,
        code: coupon.code,
        value: coupon.value,
        exchange_point: coupon.exchangePoint,
        canExchange: false // Will be set based on user context
      }))
    };
  }

  // Get available coupons for user (coupons user doesn't have)
  async getAvailableCouponsForUser(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Coupon,
        as: 'coupons',
        through: {
          attributes: []
        }
      }]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all coupons
    const allCoupons = await Coupon.findAll();
    
    // Get user's coupon IDs
    const userCouponIds = user.coupons.map(coupon => coupon.id);
    
    // Filter out coupons user already has
    const availableCoupons = allCoupons.filter(coupon => !userCouponIds.includes(coupon.id));
    
    return availableCoupons.map(coupon => ({
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      value: coupon.value,
      exchange_point: coupon.exchangePoint,
      canExchange: user.point >= coupon.exchangePoint
    }));
  }

  // Get user's coupons
  async getUserCoupons(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Coupon,
        as: 'coupons',
        through: {
          attributes: []
        }
      }]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.coupons.map(coupon => ({
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      value: coupon.value,
      exchange_point: coupon.exchangePoint,
      canExchange: false // User already has this coupon
    }));
  }

  // Exchange coupon (user gets coupon by spending points)
  async exchangeCoupon(userId, couponId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Coupon,
        as: 'coupons',
        through: {
          attributes: []
        }
      }]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const coupon = await Coupon.findByPk(couponId);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    // Check if user has enough points
    if (user.point < coupon.exchangePoint) {
      throw new Error('Insufficient points to exchange this coupon');
    }
    
    // Check if user already has this coupon
    const userCouponIds = user.coupons.map(c => c.id);
    if (userCouponIds.includes(couponId)) {
      throw new Error('You already have this coupon');
    }
    
    // Deduct points and add coupon to user
    await user.update({
      point: user.point - coupon.exchangePoint
    });
    
    // Add coupon to user
    await UserCoupon.create({
      userId: userId,
      couponId: couponId
    });
    
    return true;
  }

  // Check if user can exchange coupon
  async canExchangeCoupon(userId, couponId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Coupon,
        as: 'coupons',
        through: {
          attributes: []
        }
      }]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const coupon = await Coupon.findByPk(couponId);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    const userCouponIds = user.coupons.map(c => c.id);
    
    return user.point >= coupon.exchangePoint && !userCouponIds.includes(couponId);
  }

  // Create new coupon (Admin)
  async createCoupon(couponData) {
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      where: { code: couponData.code }
    });

    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      name: couponData.name,
      code: couponData.code,
      value: couponData.value,
      exchangePoint: couponData.exchange_point,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      value: coupon.value,
      exchange_point: coupon.exchangePoint
    };
  }

  // Update coupon (Admin)
  async updateCoupon(id, couponData) {
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Check if new code already exists (excluding current coupon)
    if (couponData.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        where: { 
          code: couponData.code,
          id: { [Op.ne]: id }
        }
      });

      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }
    }

    await coupon.update({
      name: couponData.name,
      code: couponData.code,
      value: couponData.value,
      exchangePoint: couponData.exchange_point,
      updatedAt: new Date()
    });
    
    return {
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      value: coupon.value,
      exchange_point: coupon.exchangePoint
    };
  }

  // Delete coupon (Admin)
  async deleteCoupon(id) {
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Delete all user-coupon associations first
    await UserCoupon.destroy({
      where: { couponId: id }
    });

    await coupon.destroy();
    return true;
  }

  // Apply coupon to booking (by coupon code)
  async applyCouponToBooking(userId, couponCode) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Coupon,
        as: 'coupons',
        through: {
          attributes: []
        }
      }]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const coupon = await Coupon.findOne({
      where: { code: couponCode }
    });
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    // Check if user has this coupon
    const userCouponIds = user.coupons.map(c => c.id);
    if (!userCouponIds.includes(coupon.id)) {
      throw new Error('You do not have this coupon');
    }
    
    return coupon;
  }

  // Remove coupon from user
  async removeCouponFromUser(userId, couponId) {
    const userCoupon = await UserCoupon.findOne({
      where: {
        userId: userId,
        couponId: couponId
      }
    });
    
    if (!userCoupon) {
      throw new Error('User does not have this coupon');
    }
    
    await userCoupon.destroy();
    return true;
  }
}

export default new CouponService();
