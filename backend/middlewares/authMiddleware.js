// --- src/middleware/authMiddleware.js ---
import jwt from "jsonwebtoken";
import Document from "../models/Document.model.js";

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
      return res.sendStatus(401);
    }
    // 3. Attach User ID to Request
    // We trust the token payload, which contains the userId.
    console.log(userPayload);

    req.userId = userPayload.id;

    next(); // Move to the next function (the controller)
  });
};

export function registerShareDBPermissionMiddleware(backend) {
  backend.use("submit", async (request, callback) => {
    try {
      if (request.op && request.op.user && request.op.user.id) {
        // If user context is provided in the operation data,
        // the operation can be considered safe or authorized by the calling service.
        // We can explicitly attach the user to the agent for downstream checks:
        request.agent.user = request.op.user;
        // Alternatively, if the server is performing a trusted delete, just let it pass:
        // if (request.op.del && request.op.source === "serverDelete")
        //   return done();

        // For now, let's proceed to the next check, as the user is attached.
      }
      const { agent, collection, id } = request;
      // console.log(request, "registerShareDBPermissionMiddleware");

      if (collection !== "documents") return callback();

      const user = agent.stream.ws.user; // added earlier in connection
      if (!user) return callback("Not authenticated");

      const doc = await Document.findById(id);
      if (!doc) return callback("Document does not exist");

      // OWNER → allow all

      console.log(user, "user");

      if (doc.ownerId.toString() === user.id.toString()) {
        return callback();
      }

      // COLLABORATOR → allow
      const isCollaborator = doc.collaborators.some(
        (c) => c.userId.toString() === user.id.toString()
      );
      if (isCollaborator) {
        return callback();
      }

      // Otherwise → forbid
      return callback("Permission denied");
    } catch (err) {
      console.error("ShareDB permission error:", err);
      callback("Server error");
    }
  });
}
