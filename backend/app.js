import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";

import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/document.routes.js";
import inviteRoutes from "./routes/invite.routes.js";

const app = express();

// Core middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

// Request tracing middleware
app.use(requestLogger);

// Routes
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/invite", inviteRoutes);

// Global error handler
app.use(errorHandler);

export default app;
