// services/document.service.js
import Document from "../models/Document.model.js";
import { getShareDB } from "../sharedb/sharedb.js";
import { ForbiddenError, NotFoundError } from "../utils/appError.js";
import { logger } from "../utils/winstonLogger.js";

class DocumentService {
  // CREATE DOCUMENT
  static async createDocument(ownerId, title = "Untitled Document", cid) {
    logger.info({ message: "Attempting document creation...", cid });

    const doc = await Document.create({
      ownerId,
      title,
      snapshot: "this is empty doc",
    });

    logger.info({
      message: "Document SuccessFully Created...",
      cid,
    });
    return doc;
  }

  // GET ALL DOCUMENTS FOR A USER
  static async getUserDocuments(userId, cid) {
    logger.info({ message: "Attempting to get documents ...", cid });
    const docs = await Document.find({
      $or: [{ ownerId: userId }, { "collaborators.userId": userId }],
    }).sort({ updatedAt: -1 });
    logger.info({
      message: "SuccessFully got the documents.",
      cid,
    });
    return docs;
  }

  // FETCH A DOCUMENT WITH PERMISSION CHECK
  static async getDocumentById(docId, userId, cid) {
    logger.info({ message: "Attempting to get document by docId ...", cid });

    const doc = await Document.findById(docId);
    if (!doc) throw new NotFoundError("Document not found");

    // OWNER → full access
    if (doc.ownerId.toString() === userId.toString()) return doc;

    // COLLABORATOR → access
    const isCollaborator = doc.collaborators.some(
      (c) => c.userId.toString() === userId.toString()
    );
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
    if (isCollaborator) {
      logger.info({
        message: "SuccessFully got the document",
        cid,
      });
      return { success: true, permission, doc };
    }
    // OTHERWISE → denied
    throw new ForbiddenError(
      "Forbidden: You do not have access to this document"
    );
  }
  // Assuming this is in your document service file (e.g., document.service.js)

  static async deleteDocument(docId, userId, cid) {
    logger.info({ message: "Attempting to delete the document ...", cid });
    // 1. Find the document and ensure the requesting user is the owner
    const doc = await Document.findOne({
      _id: docId,
      ownerId: userId, // Critically checks that the document exists AND the userId matches the ownerId
    });

    if (!doc) {
      throw new ForbiddenError(
        "Forbidden: Document not found or you do not have permission to delete it."
      );
    }

    // 2. Perform the deletion
    const result = await Document.deleteOne({ _id: docId });

    if (result.deletedCount === 0) {
      throw new Error("Deletion failed: Document could not be removed.");
    }

    // Optional: In a real-time app, you'd also need to notify ShareDB
    // to stop tracking this document and potentially delete it from the ShareDB collection.
    const { db, backend } = getShareDB(); // Get the ShareDB connection
    const shareDBCleanupPromise = new Promise((resolve, reject) => {
      // Get the ShareDB document instance
      const docToDelete = backend.connect().get("documents", docId);
      // Use the doc.del() method to cleanly remove it from ShareDB and its oplog
      docToDelete.fetch(function (err) {
        if (err) return reject(err);
        if (docToDelete.type === null) {
          // Document already deleted or never existed in ShareDB's collection
          return resolve();
        }

        // Delete the document data and oplog
        docToDelete.del({}, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    await shareDBCleanupPromise;
    logger.info({
      message: "SuccessFully deleted the documents.",
      cid,
    });
    return { message: "Document successfully deleted." };
  }

  static async updateSnapshot(docId, htmlContent, cid) {
    logger.info({ message: "Attempting to update the document ...", cid });
    const doc = await Document.findById(docId);
    if (!doc) throw new NotFoundError("Document not found");

    doc.snapshot = htmlContent;
    await doc.save();
    logger.info({ message: "SuccessFully updated the document", cid });

    return doc;
  }
  // ADD COLLABORATOR
  static async addCollaborator(docId, userId, role = "editor", cid) {
    logger.info({
      message: "Attempting to Added the collaborator to the document",
      cid,
    });

    const doc = await Document.findById(docId);
    if (!doc) throw new NotFoundError("Document not found");

    // prevent duplicates
    const already = doc.collaborators.some(
      (c) => c.userId.toString() === userId.toString()
    );
    if (already) return doc;

    doc.collaborators.push({ userId, role });
    await doc.save();
    logger.info({
      message: "SuccessFully Added the collaborator to the document",
      cid,
    });

    return doc;
  }
}

export default DocumentService;
