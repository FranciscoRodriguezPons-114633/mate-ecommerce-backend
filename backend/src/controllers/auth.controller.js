const {
  registerUser,
  loginUser,
  getProfile,
} = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    error.status = error.message.includes("Ya existe") ? 409 : 400;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error) {
    error.status = 401;
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    return res.status(200).json(profile);
  } catch (error) {
    error.status = 404;
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};