import newsService from '../../services/newsService.js';

class AdminNewsController {
  // Get all news with pagination (Admin API)
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

  // Create new news (Admin API)
  async createNews(req, res) {
    try {
      const { title, content } = req.body;
      const imageFile = req.file; // From multer middleware
      
      const news = await newsService.createNews(
        { title, content },
        imageFile
      );
      
      res.status(201).json({
        status: 201,
        code: 201,
        data: 'News created successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Update news (Admin API)
  async updateNews(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const imageFile = req.file; // From multer middleware
      
      await newsService.updateNews(
        id,
        { title, content },
        imageFile
      );
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: 'News updated successfully'
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

  // Delete news (Admin API)
  async deleteNews(req, res) {
    try {
      const { id } = req.params;
      
      await newsService.deleteNews(id);
      
      res.status(204).json({
        status: 204,
        code: 204,
        message: 'News deleted successfully'
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

  // Get news by ID (Admin API)
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
}

export default new AdminNewsController();
