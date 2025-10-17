import homeService from '../services/homeService.js';

class HomeController {
  // Get all genres
  async getAllGenres(req, res) {
    try {
      const genres = await homeService.getAllGenres();
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: genres
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get theaters near location
  async getTheatersNear(req, res) {
    try {
      const { lat, lon, radius = 5, date, limit = 10 } = req.query;
      
      const theaters = await homeService.getTheatersNear(lat, lon, radius, date, limit);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: theaters
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get all movies showing
  async getAllMoviesShowing(req, res) {
    try {
      const movies = await homeService.getAllMoviesShowing();
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: movies
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get all movies coming
  async getAllMoviesComing(req, res) {
    try {
      const { page = 0, pageSize = 10 } = req.query;
      
      const result = await homeService.getAllMoviesComing(parseInt(page), parseInt(pageSize));
      
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

  // Get movie detail
  async getMovieDetail(req, res) {
    try {
      const { Id } = req.params;
      
      const movie = await homeService.getMovieDetail(Id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: movie
      });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Movie not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get movie trailer
  async getMovieTrailer(req, res) {
    try {
      const { Id } = req.params;
      
      const trailer = await homeService.getMovieTrailer(Id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: trailer
      });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Trailer not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get all news
  async getAllNews(req, res) {
    try {
      const { 
        page = 0, 
        pageSize = 10, 
        sortField = 'title', 
        sortOrder = 'asc', 
        search = '' 
      } = req.query;
      
      const result = await homeService.getAllNews(
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

  // Get news by ID
  async getNewsById(req, res) {
    try {
      const { Id } = req.params;
      
      const news = await homeService.getNewsById(Id);
      
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

  // Get all festivals
  async getAllFestivals(req, res) {
    try {
      const { 
        page = 0, 
        pageSize = 10, 
        sortField = 'title', 
        sortOrder = 'asc', 
        search = '' 
      } = req.query;
      
      const result = await homeService.getAllFestivals(
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

  // Get festival detail
  async getFestivalDetail(req, res) {
    try {
      const { Id } = req.params;
      
      const festival = await homeService.getFestivalDetail(Id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: festival
      });
    } catch (error) {
      if (error.message === 'Festival not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Festival not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get all promotions
  async getAllPromotions(req, res) {
    try {
      const { 
        page = 0, 
        pageSize = 10, 
        sortField = 'title', 
        sortOrder = 'asc', 
        search = '' 
      } = req.query;
      
      const result = await homeService.getAllPromotions(
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

  // Get promotion detail
  async getPromotionDetail(req, res) {
    try {
      const { Id } = req.params;
      
      const promotion = await homeService.getPromotionDetail(Id);
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: promotion
      });
    } catch (error) {
      if (error.message === 'Promotion not found') {
        return res.status(404).json({
          status: 404,
          code: 404,
          message: 'Promotion not found'
        });
      }
      
      res.status(500).json({
        status: 500,
        code: 500,
        message: error.message
      });
    }
  }

  // Get all ticket prices
  async getAllTicketPrices(req, res) {
    try {
      const ticketPrices = await homeService.getAllTicketPrices();
      
      res.status(200).json({
        status: 200,
        code: 200,
        data: ticketPrices
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

export default new HomeController();
