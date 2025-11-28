import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import InviteController from "../controllers/invite.controller.js";

const router = express.Router();

// Send invite (owner only)
router.post("/", authenticateToken, InviteController.sendInvite);

// Accept invite through URL
router.get("/accept/:token", authenticateToken, InviteController.acceptInvite);

export default router;
