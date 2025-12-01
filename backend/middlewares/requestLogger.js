import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/winstonLogger.js";

export default function requestLogger(req, res, next) {
  // 1. Check if the client/upstream service provided a Request ID header.
  // If so, reuse it. If not, generate a new one.
  const correlationId = req.headers["x-request-id"] || uuidv4();

  // 2. Attach it to the request object for easy access in controllers/services.
  req.cid = correlationId;

  // 3. Set the header on the response so the client/consumer can track it.
  res.set("X-Request-ID", correlationId);

  // 4. Log the incoming request with the Correlation ID.
  logger.info({
    message: `Request received: ${req.method} ${req.originalUrl}`,
    cid: req.cid,
    ip: req.ip,
  });

  next();
}
