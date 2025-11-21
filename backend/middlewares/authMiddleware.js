// --- src/middleware/authMiddleware.js ---
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // 1. Extract Token from "Bearer <token>" header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    // 401: Unauthorized - No token provided
    return res.sendStatus(401);
  }

  // 2. Verify the Token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userPayload) => {
    if (err) {
      // 403: Forbidden - Token is invalid, expired, or tampered with
      return res.sendStatus(403);
    }
    // 3. Attach User ID to Request
    // We trust the token payload, which contains the userId.
    req.userId = userPayload.id;

    next(); // Move to the next function (the controller)
  });
};
