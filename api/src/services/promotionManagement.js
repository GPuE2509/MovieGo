const mongoose = require("mongoose");
const Promotion = require("../models/promotion");

class PromotionManagementService {
  async getAllPromotions(
    search,
    status,
    sortBy = "created_at",
    page = 0,
    size = 10
  ) {
    try {
      const filter = {};

      // Add search filter if provided
      if (search && search.trim() !== "") {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Add status filter if provided
      if (status) {
        filter.is_active = status === "ACTIVE";
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = -1; // Default to descending order

      // Calculate pagination
      const skip = page * size;
      const limit = size;

      // Get total count
      const totalElements = await Promotion.countDocuments(filter);

      // Get promotions with pagination
      const content = await Promotion.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Transform data
      const promotionDTO = content.map((promotion) => {
        return {
          id: promotion._id,
          title: promotion.title,
          description: promotion.description,
          discountPercentage: promotion.discount_percentage,
          discountAmount: promotion.discount_amount,
          minOrderAmount: promotion.min_order_amount,
          maxDiscountAmount: promotion.max_discount_amount,
          startDate: promotion.start_date,
          endDate: promotion.end_date,
          isActive: promotion.is_active,
          image: promotion.image,
          createdAt: promotion.created_at,
          updatedAt: promotion.updated_at,
        };
      });

      return {
        content: promotionDTO,
        totalElements,
        totalPages: Math.ceil(totalElements / size) || 0,
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / size) - 1,
        hasNext: page < Math.ceil(totalElements / size) - 1,
        hasPrevious: page > 0,
        numberOfElements: promotionDTO.length,
      };
    } catch (error) {
      throw new Error(`Failed to get promotions: ${error.message}`);
    }
  }

  async getPromotionById(id) {
    try {
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      return {
        id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        discountPercentage: promotion.discount_percentage,
        discountAmount: promotion.discount_amount,
        minOrderAmount: promotion.min_order_amount,
        maxDiscountAmount: promotion.max_discount_amount,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        isActive: promotion.is_active,
        image: promotion.image,
        createdAt: promotion.created_at,
        updatedAt: promotion.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to get promotion: ${error.message}`);
    }
  }

  async createPromotion(promotionData) {
    try {
      // Validate that at least one discount type is provided
      if (!promotionData.discount_percentage && !promotionData.discount_amount) {
        throw new Error("Either discount percentage or discount amount must be provided");
      }

      // Validate that both discount types are not provided
      if (promotionData.discount_percentage && promotionData.discount_amount) {
        throw new Error("Cannot provide both discount percentage and discount amount");
      }

      // Validate date range
      if (new Date(promotionData.end_date) <= new Date(promotionData.start_date)) {
        throw new Error("End date must be after start date");
      }

      const promotion = new Promotion(promotionData);
      await promotion.save();

      return {
        id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        discountPercentage: promotion.discount_percentage,
        discountAmount: promotion.discount_amount,
        minOrderAmount: promotion.min_order_amount,
        maxDiscountAmount: promotion.max_discount_amount,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        isActive: promotion.is_active,
        image: promotion.image,
        createdAt: promotion.created_at,
        updatedAt: promotion.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to create promotion: ${error.message}`);
    }
  }

  async updatePromotion(id, updateData) {
    try {
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      // Validate discount types if provided
      if (updateData.discount_percentage && updateData.discount_amount) {
        throw new Error("Cannot provide both discount percentage and discount amount");
      }

      // Validate date range if dates are provided
      if (updateData.start_date && updateData.end_date) {
        if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
          throw new Error("End date must be after start date");
        }
      }

      // Update fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          promotion[key] = updateData[key];
        }
      });

      await promotion.save();

      return {
        id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        discountPercentage: promotion.discount_percentage,
        discountAmount: promotion.discount_amount,
        minOrderAmount: promotion.min_order_amount,
        maxDiscountAmount: promotion.max_discount_amount,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        isActive: promotion.is_active,
        image: promotion.image,
        createdAt: promotion.created_at,
        updatedAt: promotion.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to update promotion: ${error.message}`);
    }
  }


  async deletePromotion(id) {
    try {
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      await Promotion.findByIdAndDelete(id);

      return {
        message: "Promotion deleted successfully",
        id: id,
      };
    } catch (error) {
      throw new Error(`Failed to delete promotion: ${error.message}`);
    }
  }

}

module.exports = new PromotionManagementService();
