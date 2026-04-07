const errorHandler = (err, req, res, next) => {
  console.error(`Error in ${req.method} ${req.originalUrl}: ${err.message}`, {
    status: err.status || 500,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
};

module.exports = errorHandler;