// rateLimiter.js

import rateLimit from "express-rate-limit";

/**
 * Global rate limiting middleware.
 * Uses the default MemoryStore, which is fine for single-process apps.
 */
const apiLimiter = rateLimit({
  // The time window for the requests (15 minutes in milliseconds)
  windowMs: 15 * 60 * 1000,
  // Limit each IP to 100 requests per windowMs
  max: 100,
  // Send the rate limit headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  standardHeaders: true,
  // Disable the legacy headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
  legacyHeaders: false,
  // Custom message when rate limit is exceeded
  message: {
    status: 429,
    message: "Too many requests, please try again after 15 minutes.",
  },
  // Use a custom key generator if you want to limit based on something other than IP
  // keyGenerator: (req, res) => req.headers['x-api-key'] || req.ip,
});

export default apiLimiter;
