import newsService from '../services/newsService.js';

class NewsController {
  // Get all news with pagination (Public API)
  async getAllNews(req, res) {
    try {
      const {
        page = 0,
        pageSize = 10,
        sortField = 'title',
        sortOrder = 'asc',
        search = ''
      } = req.query;
      
      const result = await newsService.getAllNews(
        parseInt(page),
        parseInt(pageSize),
        sortField,
        sortOrder,
        search
      );
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get news by ID (Public API)
  async getNewsById(req, res) {
    try {
      const { id } = req.params;
      
      const news = await newsService.getNewsById(id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: news
      });
    } catch (error) {
      if (error.message === 'News not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'News not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get news for carousel (Public API)
  async getNewsForCarousel(req, res) {
    try {
      const news = await newsService.getNewsForCarousel();
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: news
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }
}

export default new NewsController();
