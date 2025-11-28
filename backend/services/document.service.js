// services/document.service.js
import Document from "../models/Document.model.js";
import { getShareDB } from "../sharedb/sharedb.js";

class DocumentService {
  // CREATE DOCUMENT
  static async createDocument(ownerId, title = "Untitled Document") {
    const doc = await Document.create({
      ownerId,
      title,
      snapshot: "this is empty doc",
    });

    return doc;
  }

  // GET ALL DOCUMENTS FOR A USER
  static async getUserDocuments(userId) {
    const docs = await Document.find({
      $or: [{ ownerId: userId }, { "collaborators.userId": userId }],
    }).sort({ updatedAt: -1 });

    return docs;
  }

  // FETCH A DOCUMENT WITH PERMISSION CHECK
  static async getDocumentById(docId, userId) {
    const doc = await Document.findById(docId);
    if (!doc) throw new Error("Document not found");

    // OWNER → full access
    if (doc.ownerId.toString() === userId.toString()) return doc;

    // COLLABORATOR → access
    const isCollaborator = doc.collaborators.some(
      (c) => c.userId.toString() === userId.toString()
    );
    if (isCollaborator) return doc;

    // OTHERWISE → denied
    throw new Error("Forbidden: You do not have access to this document");
  }
  // Assuming this is in your document service file (e.g., document.service.js)

  static async deleteDocument(docId, userId) {
    // 1. Find the document and ensure the requesting user is the owner
    const doc = await Document.findOne({
      _id: docId,
      ownerId: userId, // Critically checks that the document exists AND the userId matches the ownerId
    });

    if (!doc) {
      throw new Error(
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
        docToDelete.del(
          { source: "serverDelete", user: { id: userId } },
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    });

    await shareDBCleanupPromise;
    return { message: "Document successfully deleted." };
  }
  // UPDATE DELTA OPERATIONS (APPEND)
  static async appendDelta(docId, deltaOps) {
    const doc = await Document.findById(docId);
    if (!doc) throw new Error("Document not found");

    doc.delta.push(...deltaOps);
    await doc.save();

    return doc;
  }
  static async updateSnapshot(docId, htmlContent) {
    const doc = await Document.findById(docId);
    if (!doc) throw new Error("Document not found");

    doc.snapshot = htmlContent;
    await doc.save();
    return doc;
  }
  // ADD COLLABORATOR
  static async addCollaborator(docId, userId, role = "editor") {
    const doc = await Document.findById(docId);
    if (!doc) throw new Error("Document not found");

    // prevent duplicates
    const already = doc.collaborators.some(
      (c) => c.userId.toString() === userId.toString()
    );
    if (already) return doc;

    doc.collaborators.push({ userId, role });
    await doc.save();

    return doc;
  }

  static async verifyAccess(docId, userId) {
    try {
      const doc = await Document.findById(docId).select(
        "ownerId collaborators"
      );
      if (!doc) return false;

      // owner has access
      if (doc.ownerId && doc.ownerId.toString() === userId.toString())
        return true;

      // collaborator (any role) has access
      const isCollaborator = doc.collaborators.some(
        (c) => c.userId.toString() === userId.toString()
      );
      if (isCollaborator) return true;

      // otherwise no access
      return false;
    } catch (err) {
      console.error("DocumentService.verifyAccess error:", err);
      return false;
    }
  }

  /* -------------------------
     New: canEdit(docId, userId)
     Returns true if user can send edits (owner OR collaborator.role === 'editor')
     Returns false for viewers or non-collaborators
     ------------------------- */
  static async canEdit(docId, userId) {
    try {
      const doc = await Document.findById(docId).select(
        "ownerId collaborators"
      );
      if (!doc) return false;

      // owner can always edit
      if (doc.ownerId && doc.ownerId.toString() === userId.toString())
        return true;

      // collaborator with editor role can edit
      const editor = doc.collaborators.find(
        (c) => c.userId.toString() === userId.toString() && c.role === "editor"
      );
      if (editor) return true;

      // otherwise (viewer or not present) cannot edit
      return false;
    } catch (err) {
      console.error("DocumentService.canEdit error:", err);
      return false;
    }
  }
}

export default DocumentService;
