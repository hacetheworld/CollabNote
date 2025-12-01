import DocumentService from "../services/document.service.js";
import { logger } from "../utils/winstonLogger.js";

class DocumentController {
  // CREATE NEW DOCUMENT
  static async createDocument(req, res, next) {
    try {
      const cid = req.cid;
      const userId = req.userId;
      const { title } = req.body;

      const doc = await DocumentService.createDocument(userId, title, cid);
      logger.info({
        message: "createDocument response sent successfully.",
        cid,
      });
      return res.status(201).json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  }

  // GET ALL DOCUMENTS (OWNED + COLLABORATIONS)
  static async getUserDocuments(req, res, next) {
    try {
      const cid = req.cid;
      const userId = req.userId;
      const docs = await DocumentService.getUserDocuments(userId, cid);
      logger.info({
        message: "getUserDocuments response sent successfully.",
        cid,
      });

      res.json({ success: true, documents: docs });
    } catch (error) {
      next(error);
    }
  }

  // GET A SINGLE DOCUMENT WITH PERMISSION CHECK
  static async getDocumentById(req, res, next) {
    try {
      const cid = req.cid;
      const docId = req.params.id;
      const userId = req.userId;

      const doc = await DocumentService.getDocumentById(docId, userId, cid);
      logger.info({
        message: "getDocumentById response sent successfully.",
        docId: docId,
        cid,
      });

      res.json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocumentById(req, res, next) {
    try {
      const cid = req.cid;
      const docId = req.params.id;
      const userId = req.userId;

      await DocumentService.deleteDocument(docId, userId, cid);
      logger.info({
        message: "deleteDocument response sent successfully.",
        cid,
      });
      res.status(200).json({
        message: "Document deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DocumentController;
