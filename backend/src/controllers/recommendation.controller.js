const {
  getRecommendationGraph,
} = require("../services/recommendation.service");

const getRecommendations = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const recommendations = await getRecommendationGraph(req.user.id, limit);
    return res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
