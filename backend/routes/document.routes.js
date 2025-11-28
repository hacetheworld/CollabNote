import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import DocumentController from "../controllers/document.controller.js";

const router = express.Router();

// Protected routes
router.post("/", authenticateToken, DocumentController.createDocument);

router.get("/", authenticateToken, DocumentController.getUserDocuments);

router.get("/:id", authenticateToken, DocumentController.getDocumentById);
router.delete("/:id", authenticateToken, DocumentController.deleteDocumentById);

export default router;
