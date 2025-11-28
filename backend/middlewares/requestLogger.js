import { v4 as uuidv4 } from "uuid";

export default function requestLogger(req, res, next) {
  req.requestId = uuidv4();

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `[${req.requestId}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
