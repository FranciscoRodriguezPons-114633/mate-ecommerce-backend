const {
  getCustomerJourney,
} = require("../services/customerJourney.service");

const getMyJourney = async (req, res, next) => {
  try {
    const journey = await getCustomerJourney(req.user.id);
    return res.status(200).json(journey);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyJourney,
};
