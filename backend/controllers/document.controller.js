import DocumentService from "../services/document.service.js";

class DocumentController {
  // CREATE NEW DOCUMENT
  static async createDocument(req, res, next) {
    try {
      const userId = req.userId;
      const { title } = req.body;

      const doc = await DocumentService.createDocument(userId, title);
      return res.status(201).json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  }

  // GET ALL DOCUMENTS (OWNED + COLLABORATIONS)
  static async getUserDocuments(req, res, next) {
    try {
      const userId = req.userId;
      const docs = await DocumentService.getUserDocuments(userId);
      console.log(docs, "docs..");

      res.json({ success: true, documents: docs });
    } catch (error) {
      next(error);
    }
  }

  // GET A SINGLE DOCUMENT WITH PERMISSION CHECK
  static async getDocumentById(req, res, next) {
    try {
      const docId = req.params.id;
      const userId = req.userId;

      const doc = await DocumentService.getDocumentById(docId, userId);
      let permission = "viewer";

      // Owner always editor
      if (doc.ownerId.toString() === userId.toString()) {
        permission = "editor";
      }
      // Check collaborators
      else {
        const collab = doc.collaborators.find(
          (c) => c.userId.toString() === userId.toString()
        );

        if (collab) {
          permission = collab.role; // viewer or editor
        }
      }
      res.json({ permission, success: true, document: doc });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocumentById(req, res, next) {
    try {
      const docId = req.params.id;
      const userId = req.userId;

      await DocumentService.deleteDocument(docId, userId);

      res.status(200).json({
        message: "Document deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  // APPEND DELTA UPDATE
  static async appendDelta(req, res, next) {
    try {
      const docId = req.params.id;
      const { delta } = req.body;

      const updated = await DocumentService.appendDelta(docId, delta);

      res.json({ success: true, document: updated });
    } catch (error) {
      next(error);
    }
  }
}

export default DocumentController;
