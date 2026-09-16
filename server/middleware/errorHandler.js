function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || 400;
  const message = err.expose !== false ? err.message : "Something went wrong. Please try again.";
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
