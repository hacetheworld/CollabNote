import { logger } from "../utils/winstonLogger.js";

export default function errorHandler(err, req, res, next) {
  // 1. Determine Status Code and Log Level
  // Default to 500 Internal Server Error for unhandled exceptions
  const statusCode = err.statusCode || 500;

  // Client errors (4xx) are often WARN (they used the API wrong). Server errors (5xx) are always ERROR.
  const logLevel = statusCode >= 500 ? "error" : "warn";

  // 2. Log the Error Internally (Securely)
  // We log the FULL stack trace and all context INTERNALLY.
  logger[logLevel]({
    message: err.message,
    cid: req.cid,
    statusCode: statusCode,
    // Crucial for debugging: log the full stack trace for server errors
    stack: logLevel === "error" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // 3. Send a SAFE, Sanitized Response to the Client
  // NEVER expose the stack trace or internal error details in production.
  const isProduction = process.env.NODE_ENV === "production";
  let errorMessage = err.message;

  if (isProduction && statusCode === 500) {
    // For security, mask 500 errors in production
    errorMessage =
      "Internal Server Error. Our team has been notified. Please reference the Correlation ID.";
  }

  res.status(statusCode).json({
    status: "error",
    message: errorMessage,
    correlationId: req.cid, // Always return the ID so the client can reference it for support
  });
}
