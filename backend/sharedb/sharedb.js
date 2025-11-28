import ShareDB from "sharedb";
import sharedbMongo from "sharedb-mongo";
import { WebSocketServer } from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";

// Dependencies needed for external logic
import verifyToken from "../utils/verifyToken.js";
import DocumentService from "../services/document.service.js";
import { registerShareDBPermissionMiddleware } from "../middlewares/authMiddleware.js";
import { convertDeltaToHTML } from "../utils/deltaToHtml.js";

// Global variables for the backend and database connection
let backend;

let db;

/**
 * Initializes the ShareDB backend, registers the rich-text type,
 * and applies middleware. This MUST be called *after* any necessary
 * global mocks (like the 'document' object) are set.
 */

export async function initializeShareDBBackend() {
  if (!db) {
    db = sharedbMongo(process.env.MONGO_URI);
  }

  let richText;

  try {
    // dynamic import for CJS module (works in ESM)
    const module = await import("rich-text");
    richText = module.default.type;
  } catch (err) {
    console.error("Failed to load rich-text module.", err);
    throw new Error("ShareDB Initialization Failed: Cannot load rich-text.");
  }

  ShareDB.types.register(richText);

  backend = new ShareDB({ db, presence: true });
  registerShareDBPermissionMiddleware(backend);

  backend.use("afterWrite", async (request, done) => {
    try {
      if (request.collection !== "documents") return done();

      const docId = request.id;
      const delta = request.snapshot.data;

      const htmlContent = convertDeltaToHTML(delta);
      await DocumentService.updateSnapshot(docId, htmlContent);

      done();
    } catch (err) {
      console.error("Snapshot update failed:", err);
      done(err);
    }
  });

  return backend;
}

// helper: convert ws to json stream for ShareDB
// class WebSocketJSONStream {
//   constructor(ws) {
//     this.ws = ws;
//     ws.on("message", (msg) => {
//       let data = JSON.parse(msg.toString());
//       this.onMessage && this.onMessage(data);
//     });
//     ws.on("close", () => {
//       this.onClose && this.onClose();
//     });
//   }

//   send(data) {
//     this.ws.send(JSON.stringify(data));
//   }
// }

export function startShareDBServer(server) {
  if (!backend) {
    console.error(
      "ShareDB Backend not initialized. Call initializeShareDBBackend() first."
    );
    return;
  }

  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    try {
      const token = req.url?.split("token=")[1];

      if (!token) return ws.close();

      const user = verifyToken(token);
      ws.user = user;
      console.log(user, "user the ws...");

      const stream = new WebSocketJSONStream(ws);
      backend.listen(stream);
    } catch (err) {
      console.error("WS Auth Failed:", err);
      ws.close();
    }
  });

  return backend;
}

export function getShareDB() {
  return {
    backend: backend,
    db: db,
  };
}
