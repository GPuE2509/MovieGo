const homeService = require('../services/homeService');

class HomeController {
  async getAllGenres(req, res) {
    try {
      const genres = await homeService.getAllGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTheatersNear(req, res) {
    try {
      const { lat, lon, radius = 5, date, limit = 10 } = req.query;
      const theaters = await homeService.getTheatersNear(lat, lon, radius, date, limit);
      res.status(200).json({ success: true, data: theaters });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllMoviesShowing(req, res) {
    try {
      const movies = await homeService.getAllMoviesShowing();
      res.status(200).json({ success: true, data: movies });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllMoviesComing(req, res) {
    try {
      const { page = 0, pageSize = 10 } = req.query;
      const result = await homeService.getAllMoviesComing(Number(page) || 0, Number(pageSize) || 10);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMovieDetail(req, res) {
    try {
      const { Id } = req.params;
      const movie = await homeService.getMovieDetail(Id);
      res.status(200).json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMovieTrailer(req, res) {
    try {
      const { Id } = req.params;
      const trailer = await homeService.getMovieTrailer(Id);
      res.status(200).json({ success: true, data: trailer });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, message: 'Trailer not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllNews(req, res) {
    try {
      const { page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '' } = req.query;
      const result = await homeService.getAllNews(Number(page)||0, Number(pageSize)||10, sortField, sortOrder, search);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getNewsById(req, res) {
    try {
      const { Id } = req.params;
      const news = await homeService.getNewsById(Id);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      if (error.message === 'News not found') {
        return res.status(404).json({ success: false, message: 'News not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllFestivals(req, res) {
    try {
      const { page = 0, pageSize = 10, sortField = 'name', sortOrder = 'asc', search = '' } = req.query;
      const result = await homeService.getAllFestivals(Number(page)||0, Number(pageSize)||10, sortField, sortOrder, search);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFestivalDetail(req, res) {
    try {
      const { Id } = req.params;
      const festival = await homeService.getFestivalDetail(Id);
      res.status(200).json({ success: true, data: festival });
    } catch (error) {
      if (error.message === 'Festival not found') {
        return res.status(404).json({ success: false, message: 'Festival not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllPromotions(req, res) {
    try {
      const { page = 0, pageSize = 10, sortField = 'title', sortOrder = 'asc', search = '' } = req.query;
      const result = await homeService.getAllPromotions(Number(page)||0, Number(pageSize)||10, sortField, sortOrder, search);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPromotionDetail(req, res) {
    try {
      const { Id } = req.params;
      const promotion = await homeService.getPromotionDetail(Id);
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      if (error.message === 'Promotion not found') {
        return res.status(404).json({ success: false, message: 'Promotion not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllTicketPrices(req, res) {
    try {
      const data = await homeService.getAllTicketPrices();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new HomeController();
