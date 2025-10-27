const mongoose = require("mongoose");
const Promotion = require("../models/promotion");
const News = require("../models/news");
const Festival = require("../models/festival");

class SidebarManagementService {
  /**
   * Get promotions for carousel
   * Returns active promotions that are currently valid
   */
  async getPromotionsForCarousel() {
    try {
      const currentDate = new Date();
      
      const promotions = await Promotion.find({
        is_active: true,
        start_date: { $lte: currentDate },
        end_date: { $gte: currentDate }
      })
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

      const promotionDTO = promotions.map((promotion) => {
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
          image: promotion.image,
          createdAt: promotion.created_at,
          updatedAt: promotion.updated_at,
        };
      });

      return {
        success: true,
        data: promotionDTO,
        total: promotionDTO.length
      };
    } catch (error) {
      throw new Error(`Failed to get promotions for carousel: ${error.message}`);
    }
  }

  /**
   * Get news for carousel
   * Returns published news sorted by published date
   */
  async getNewsForCarousel() {
    try {
      const news = await News.find({
        is_published: true
      })
      .sort({ published_at: -1 })
      .limit(10)
      .lean();

      const newsDTO = news.map((item) => {
        return {
          id: item._id,
          title: item.title,
          content: item.content,
          image: item.image,
          author: item.author,
          publishedAt: item.published_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      });

      return {
        success: true,
        data: newsDTO,
        total: newsDTO.length
      };
    } catch (error) {
      throw new Error(`Failed to get news for carousel: ${error.message}`);
    }
  }

  /**
   * Get top festivals
   * Returns upcoming festivals sorted by start time
   */
  async getTopFestivals() {
    try {
      const currentDate = new Date();
      
      const festivals = await Festival.find({
        start_time: { $gte: currentDate }
      })
      .sort({ start_time: 1 })
      .limit(10)
      .lean();

      const festivalDTO = festivals.map((festival) => {
        return {
          id: festival._id,
          title: festival.title,
          image: festival.image,
          location: festival.location,
          description: festival.description,
          startTime: festival.start_time,
          endTime: festival.end_time,
          createdAt: festival.created_at,
          updatedAt: festival.updated_at,
        };
      });

      return {
        success: true,
        data: festivalDTO,
        total: festivalDTO.length
      };
    } catch (error) {
      throw new Error(`Failed to get top festivals: ${error.message}`);
    }
  }
}

module.exports = new SidebarManagementService();
