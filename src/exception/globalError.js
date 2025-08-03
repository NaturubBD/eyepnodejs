const process = require("process");
const globalError = (err, req, res, next) => {
  let environment = process?.env?.NODE_ENV;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "unknown_error";
  err.correlationId = req.headers["x-correlation-id"];
  res.status(err.statusCode).json({
    status: err.status,
    errors: err.errors,
    message: err.message,
    ...(environment === "dev" && {
      correlationId: err.correlationId,
      stack: err.stack,
    }),
  });
};
module.exports = globalError;
