import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport"; // <-- Import Passport
import connectDB from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
// import docRoutes from "./routes/docRoutes.js";
import passportConfig from "./config/passport.js";
connectDB();
passportConfig();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(passport.initialize());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("api is runninggggg..");
});
app.use("/api/auth", authRoutes);
// app.use("/api/docs", docRoutes);

app.listen(PORT, () => {
  console.log(`server is running on the port ${PORT}`);
});
