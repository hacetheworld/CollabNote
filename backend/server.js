import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import connectDB from "./db/db.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/document.routes.js";
import inviteRoutes from "./routes/invite.routes.js";

import passportConfig from "./config/passport.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorHandler from "./middlewares/errorHandler.js";

import {
  initializeShareDBBackend,
  startShareDBServer,
} from "./sharedb/sharedb.js";

connectDB();
passportConfig();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(passport.initialize());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(requestLogger);

// Routes
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/invite", inviteRoutes);

// Global error handler
app.use(errorHandler);

// Create HTTP server instance
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Attach ShareDB WS server

await initializeShareDBBackend();

startShareDBServer(server);
