const recommendationService = require("../services/recommendationService");

class RecommendationController {
  async getRecommendations(req, res) {
    try {
      const userId = req.user?.id;
      const data = userId
        ? await recommendationService.getRecommendedMovies(userId)
        : await recommendationService.getDefaultRecommendations();

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RecommendationController();


