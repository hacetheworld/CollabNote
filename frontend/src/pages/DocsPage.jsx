import { useEffect, useState, useRef } from "react";
import {
  getDocuments,
  createDocument,
  deleteDocumentById,
} from "../api/api.service.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/docs.css"; // custom CSS
import { NavLink } from "react-router-dom";
import { AppHeader } from "../components/AppHeader.jsx";
import { AppFooter } from "../components/AppFooter.jsx";

// Assume you have a hook/function for logging out from your AuthContext
// const { user, logout } = useAuth(); // Assuming logout is available

// Helper component for the Modal
function CreateDocumentModal({ show, title, setTitle, handleCreate, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create Document</h2>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          onKeyPress={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <div className="modal-actions">
          <button
            className="modal-button modal-button-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="modal-button modal-button-primary"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  // Assuming useAuth provides a logout function
  const { user, logout } = useAuth();
  const [docs, setDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // New state for avatar menu
  const [title, setTitle] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const handleDelete = async (docId, event) => {
    // Prevent navigating to the document when clicking the delete button
    event.stopPropagation();

    if (
      window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      try {
        await deleteDocumentById(docId);
        loadDocs(); // Reload the document list after successful deletion
      } catch (error) {
        console.error("Deletion failed:", error);
        alert("Error: Could not delete document. You may not be the owner.");
      }
    }
  };
  // Closes the menu if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadDocs = async () => {
    try {
      const res = await getDocuments();
      setDocs(res.data.documents);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createDocument({ title });
      setShowModal(false);
      setTitle("");
      loadDocs();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  const handleLogout = () => {
    // Implement your actual logout logic here
    if (logout) {
      logout();
    } else {
      console.warn("Logout function not provided by AuthContext.");
      // Fallback for demonstration: clear token and refresh
      localStorage.removeItem("accessToken");
      window.location.reload();
    }
  };

  return (
    <div className="docs-page-wrapper">
      {/* --- HEADER BAR (Google Docs Style) --- */}
      <AppHeader />
      {/* -------------------------------------- */}

      {/* Main Content Area */}
      <div className="docs-main-content">
        <button
          onClick={() => setShowModal(true)}
          className="create-doc-button"
        >
          + Create New Document
        </button>
        {/* Create New Document Button */}

        {/* Document List (Grid) */}
        <div className="document-list-grid">
          {docs.length > 0 ? (
            docs.map((d) => (
              <div
                key={d._id}
                onClick={() => (window.location.href = `/docs/${d._id}`)}
                className="document-card"
              >
                <h3 className="document-title">
                  {d.title || "Untitled Document"}
                </h3>
                {d.ownerId.toString() === user._id.toString() && (
                  <button
                    className="delete-button"
                    onClick={(e) => handleDelete(d._id, e)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">
              You don't have any documents yet. Create one to start
              collaborating!
            </p>
          )}
        </div>
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        show={showModal}
        title={title}
        setTitle={setTitle}
        handleCreate={handleCreate}
        onClose={() => setShowModal(false)}
      />
      <AppFooter />
    </div>
  );
}
