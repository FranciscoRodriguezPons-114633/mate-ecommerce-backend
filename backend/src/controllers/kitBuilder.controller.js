const { getKitBuilder } = require("../services/kitBuilder.service");

const getMyKit = async (req, res, next) => {
  try {
    const kit = await getKitBuilder(req.user?.id);
    return res.status(200).json(kit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyKit,
};
