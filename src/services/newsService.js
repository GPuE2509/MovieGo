import { Op } from 'sequelize';
import { News } from '../models/index.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

class NewsService {
  // Get all news with pagination and search
  async getAllNews(page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '') {
    const offset = page * pageSize;
    const limit = pageSize;
    
    // Build where clause for search
    const whereClause = search ? {
      title: {
        [Op.like]: `%${search}%`
      }
    } : {};
    
    // Build order clause
    const orderClause = [[sortField, sortOrder.toUpperCase()]];
    
    // Get total count
    const total = await News.count({ where: whereClause });
    
    // Get paginated data
    const news = await News.findAll({
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
      data: news.map(news => ({
        id: news.id,
        title: news.title,
        content: news.content,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        image: news.image
      }))
    };
  }

  // Get news by ID
  async getNewsById(id) {
    const news = await News.findByPk(id);
    
    if (!news) {
      throw new Error('News not found');
    }
    
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      image: news.image
    };
  }

  // Create new news
  async createNews(newsData, imageFile = null) {
    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }
    
    const news = await News.create({
      title: newsData.title,
      content: newsData.content,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: null
    });
    
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      image: news.image
    };
  }

  // Update news
  async updateNews(id, newsData, imageFile = null) {
    const news = await News.findByPk(id);
    
    if (!news) {
      throw new Error('News not found');
    }
    
    // Upload new image if provided
    if (imageFile) {
      const imageUrl = await uploadToCloudinary(imageFile);
      news.image = imageUrl;
    }
    
    // Update other fields
    if (newsData.title !== undefined) {
      news.title = newsData.title;
    }
    if (newsData.content !== undefined) {
      news.content = newsData.content;
    }
    
    news.updatedAt = new Date();
    await news.save();
    
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      image: news.image
    };
  }

  // Delete news
  async deleteNews(id) {
    const news = await News.findByPk(id);
    
    if (!news) {
      throw new Error('News not found');
    }
    
    await news.destroy();
    return true;
  }

  // Get news for carousel (latest 9 news)
  async getNewsForCarousel() {
    const news = await News.findAll({
      order: [['createdAt', 'DESC']],
      limit: 9
    });
    
    return news.map(news => ({
      id: news.id,
      title: news.title,
      content: news.content,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      image: news.image
    }));
  }
}

export default new NewsService();
