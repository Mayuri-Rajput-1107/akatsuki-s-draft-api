function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with that unique value already exists." });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource ID." });
  }
  res.status(err.status || 500).json({
    message: err.status && err.status < 500 ? err.message : "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
